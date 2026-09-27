-- ============================================================================
-- NFC/QR Customer Feedback SaaS — initial schema
-- ============================================================================
-- Design notes (read before editing):
--
-- 1. TENANT ISOLATION STRATEGY
--    Every tenant-owned table carries a `business_id`. Authenticated access
--    (business owners/staff logged into the dashboard, and the platform
--    admin) is protected by Postgres Row Level Security below.
--
-- 2. PUBLIC WRITES DO NOT GO THROUGH ANON RLS
--    The customer-facing feedback page is anonymous (no login). Rather than
--    grant the `anon` role INSERT/SELECT policies on cards/feedback/scans
--    (a common source of SaaS data leaks — one wrong policy and any visitor
--    can read or write any business's data), all public reads/writes for
--    that flow go through Next.js server-only route handlers using the
--    Supabase *service role* key. The service role bypasses RLS entirely,
--    so all validation (card exists + active, rating 1-5, business_id
--    matches the card, rate limiting, etc.) happens in application code
--    before the write — never trust the client. This keeps RLS simple and
--    keeps the anon key (which IS shipped to the browser) unable to touch
--    tenant data at all.
--
-- 3. CARD IDENTIFIERS
--    `cards.public_token` is a random, non-sequential, non-guessable token
--    (not the internal uuid PK) used in the public URL
--    `/f/{business_slug}/{public_token}`. This prevents enumeration of
--    other businesses' cards by incrementing an id.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- gen_random_uuid(), gen_random_bytes()

-- ---------------------------------------------------------------------------
-- profiles — one row per auth.users row. Holds the platform-admin flag.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_platform_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- businesses
-- ---------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  logo_url text,
  cover_image_url text,
  brand_color text default '#4F46E5',
  address text,
  phone text,
  website text,
  google_review_url text,
  welcome_message text default 'How was your experience?',
  thank_you_message text default 'Thank you for your feedback!',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create index businesses_slug_idx on public.businesses (slug);

-- ---------------------------------------------------------------------------
-- business_users — membership + role, join table between auth users
-- and businesses. A user can belong to more than one business (e.g. an
-- agency managing several client accounts).
-- ---------------------------------------------------------------------------
create type public.business_role as enum ('owner', 'staff');

create table public.business_users (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.business_role not null default 'owner',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index business_users_business_idx on public.business_users (business_id);
create index business_users_user_idx on public.business_users (user_id);

-- ---------------------------------------------------------------------------
-- cards — one row per physical NFC card / printed QR code
-- ---------------------------------------------------------------------------
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  public_token text not null unique default encode(gen_random_bytes(9), 'base64'),
  label text not null default 'Untitled card',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index cards_business_idx on public.cards (business_id);
create index cards_public_token_idx on public.cards (public_token);

-- base64 can contain '/', '+' which are awkward in URLs — normalize on write.
create function public.sanitize_card_token()
returns trigger language plpgsql as $$
begin
  new.public_token := replace(replace(replace(new.public_token, '/', '_'), '+', '-'), '=', '');
  return new;
end;
$$;

create trigger cards_sanitize_token
  before insert on public.cards
  for each row execute procedure public.sanitize_card_token();

-- ---------------------------------------------------------------------------
-- feedback_categories — per-business configurable tags
-- (Service, Staff, Product, Cleanliness, Speed, Value, Other, ...)
-- ---------------------------------------------------------------------------
create table public.feedback_categories (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, name)
);

create index feedback_categories_business_idx on public.feedback_categories (business_id);

-- ---------------------------------------------------------------------------
-- feedback — a single customer submission
-- ---------------------------------------------------------------------------
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  card_id uuid references public.cards(id) on delete set null,
  rating smallint not null,
  comment text,
  clicked_google_review boolean not null default false,
  sent_as_private_feedback boolean not null default false,
  created_at timestamptz not null default now(),
  constraint rating_range check (rating between 1 and 5)
);

create index feedback_business_idx on public.feedback (business_id, created_at desc);
create index feedback_card_idx on public.feedback (card_id);

-- ---------------------------------------------------------------------------
-- feedback_category_links — many-to-many: which categories a submission tagged
-- ---------------------------------------------------------------------------
create table public.feedback_category_links (
  feedback_id uuid not null references public.feedback(id) on delete cascade,
  category_id uuid not null references public.feedback_categories(id) on delete cascade,
  primary key (feedback_id, category_id)
);

-- ---------------------------------------------------------------------------
-- scans — every NFC tap / QR scan, whether or not it converts to feedback
-- ---------------------------------------------------------------------------
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  user_agent text,
  created_at timestamptz not null default now()
  -- Deliberately NOT storing IP address or precise geolocation — not needed
  -- for the product's analytics and avoids unnecessary personal-data
  -- collection under GDPR data-minimization principles.
);

create index scans_business_idx on public.scans (business_id, created_at desc);
create index scans_card_idx on public.scans (card_id);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row execute procedure public.set_updated_at();

create trigger cards_set_updated_at
  before update on public.cards
  for each row execute procedure public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_users enable row level security;
alter table public.cards enable row level security;
alter table public.feedback_categories enable row level security;
alter table public.feedback enable row level security;
alter table public.feedback_category_links enable row level security;
alter table public.scans enable row level security;

-- Helper: is the current authenticated user a member of this business?
create function public.is_business_member(target_business_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.business_users
    where business_id = target_business_id
      and user_id = auth.uid()
  );
$$;

-- Helper: is the current authenticated user the owner of this business?
create function public.is_business_owner(target_business_id uuid)
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.business_users
    where business_id = target_business_id
      and user_id = auth.uid()
      and role = 'owner'
  );
$$;

-- Helper: is the current authenticated user a platform admin?
create function public.is_platform_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select coalesce(
    (select is_platform_admin from public.profiles where id = auth.uid()),
    false
  );
$$;

-- profiles: users can see/update only their own row; admins see all.
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_platform_admin());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- businesses: members can read/update their business; any authenticated
-- user can create a business (they become owner via the app's signup flow,
-- which inserts the business_users row in the same transaction); admins
-- have full access.
create policy "businesses_select_member_or_admin" on public.businesses
  for select using (public.is_business_member(id) or public.is_platform_admin());
create policy "businesses_insert_authenticated" on public.businesses
  for insert with check (auth.uid() is not null);
create policy "businesses_update_member_or_admin" on public.businesses
  for update using (public.is_business_member(id) or public.is_platform_admin());
create policy "businesses_delete_admin" on public.businesses
  for delete using (public.is_platform_admin());

-- business_users: members can see who's on their team; only the owner
-- (or admin) can add/remove members.
create policy "business_users_select_member_or_admin" on public.business_users
  for select using (public.is_business_member(business_id) or public.is_platform_admin());
create policy "business_users_insert_owner_or_admin" on public.business_users
  for insert with check (public.is_business_owner(business_id) or public.is_platform_admin());
create policy "business_users_delete_owner_or_admin" on public.business_users
  for delete using (public.is_business_owner(business_id) or public.is_platform_admin());

-- cards / feedback_categories / feedback / feedback_category_links / scans:
-- dashboard (authenticated) access is member-or-admin only. Anonymous
-- customers never touch these tables directly — see the note at the top
-- of this file. No anon policies are created on purpose.
create policy "cards_all_member_or_admin" on public.cards
  for all using (public.is_business_member(business_id) or public.is_platform_admin())
  with check (public.is_business_member(business_id) or public.is_platform_admin());

create policy "feedback_categories_all_member_or_admin" on public.feedback_categories
  for all using (public.is_business_member(business_id) or public.is_platform_admin())
  with check (public.is_business_member(business_id) or public.is_platform_admin());

create policy "feedback_select_member_or_admin" on public.feedback
  for select using (public.is_business_member(business_id) or public.is_platform_admin());

create policy "feedback_category_links_select_member_or_admin" on public.feedback_category_links
  for select using (
    exists (
      select 1 from public.feedback f
      where f.id = feedback_id
        and (public.is_business_member(f.business_id) or public.is_platform_admin())
    )
  );

create policy "scans_select_member_or_admin" on public.scans
  for select using (public.is_business_member(business_id) or public.is_platform_admin());

-- ============================================================================
-- RPC: create_business_with_owner
-- ----------------------------------------------------------------------------
-- Onboarding needs to insert a business row, a business_users(owner) row,
-- and a handful of default feedback_categories together. Doing that as
-- three separate client-side inserts risks an orphaned business if a
-- later insert fails (e.g. network blip). This function does it in one
-- transaction instead. SECURITY DEFINER so it can insert the
-- business_users row even though the RLS insert policy for that table
-- normally requires the caller to already be the owner (a chicken-and-egg
-- problem on first creation) — the function itself hard-codes the caller
-- as auth.uid(), so a user can only ever make *themselves* the owner of
-- the business they're creating, never anyone else.
-- ============================================================================
create function public.create_business_with_owner(
  business_name text,
  business_slug text
)
returns public.businesses
language plpgsql
security definer set search_path = public
as $$
declare
  new_business public.businesses;
begin
  if auth.uid() is null then
    raise exception 'Must be authenticated';
  end if;

  insert into public.businesses (name, slug)
  values (business_name, business_slug)
  returning * into new_business;

  insert into public.business_users (business_id, user_id, role)
  values (new_business.id, auth.uid(), 'owner');

  insert into public.feedback_categories (business_id, name, sort_order)
  values
    (new_business.id, 'Service', 1),
    (new_business.id, 'Staff', 2),
    (new_business.id, 'Product', 3),
    (new_business.id, 'Cleanliness', 4),
    (new_business.id, 'Speed', 5),
    (new_business.id, 'Value', 6);

  return new_business;
end;
$$;

grant execute on function public.create_business_with_owner(text, text) to authenticated;

-- ============================================================================
-- Seed: default feedback categories are inserted by the RPC above at
-- business-creation time, not here, so the wording can later be
-- localized / customized per signup flow.
-- ============================================================================

// Hand-written types matching supabase/migrations/0001_init.sql.
//
// Once you have a real Supabase project, replace this file by running:
//   npx supabase gen types typescript --project-id <your-project-ref> > src/lib/database.types.ts
// and re-check the app still typechecks — this file is intentionally
// kept in sync manually for now so the MVP doesn't depend on a live
// Supabase project just to build.

export type BusinessRole = 'owner' | 'staff'

export interface Business {
  id: string
  slug: string
  name: string
  logo_url: string | null
  cover_image_url: string | null
  brand_color: string
  address: string | null
  phone: string | null
  website: string | null
  google_review_url: string | null
  welcome_message: string
  thank_you_message: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BusinessUser {
  id: string
  business_id: string
  user_id: string
  role: BusinessRole
  created_at: string
}

export interface Card {
  id: string
  business_id: string
  public_token: string
  label: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FeedbackCategory {
  id: string
  business_id: string
  name: string
  sort_order: number
  created_at: string
}

export interface Feedback {
  id: string
  business_id: string
  card_id: string | null
  rating: number
  comment: string | null
  clicked_google_review: boolean
  sent_as_private_feedback: boolean
  created_at: string
}

export interface Scan {
  id: string
  business_id: string
  card_id: string
  user_agent: string | null
  created_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  is_platform_admin: boolean
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      businesses: { Row: Business; Insert: Partial<Business> & { slug: string; name: string }; Update: Partial<Business> }
      business_users: { Row: BusinessUser; Insert: Partial<BusinessUser> & { business_id: string; user_id: string }; Update: Partial<BusinessUser> }
      cards: { Row: Card; Insert: Partial<Card> & { business_id: string }; Update: Partial<Card> }
      feedback_categories: { Row: FeedbackCategory; Insert: Partial<FeedbackCategory> & { business_id: string; name: string }; Update: Partial<FeedbackCategory> }
      feedback: { Row: Feedback; Insert: Partial<Feedback> & { business_id: string; rating: number }; Update: Partial<Feedback> }
      scans: { Row: Scan; Insert: Partial<Scan> & { business_id: string; card_id: string }; Update: Partial<Scan> }
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> }
    }
    Views: Record<string, never>
    Functions: {
      create_business_with_owner: {
        Args: { business_name: string; business_slug: string }
        Returns: Business
      }
      is_business_member: {
        Args: { target_business_id: string }
        Returns: boolean
      }
    }
    Enums: {
      business_role: BusinessRole
    }
  }
}

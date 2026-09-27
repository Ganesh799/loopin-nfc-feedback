'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { slugify } from '@/lib/slugify'

const schema = z.object({
  name: z.string().trim().min(2, 'Business name is too short').max(120),
})

export async function createBusinessAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const parsed = schema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const baseSlug = slugify(parsed.data.name) || 'business'
  let slug = baseSlug
  let attempt = 0

  // Slugs must be globally unique (they're part of the public feedback
  // URL). Try a few "name-2", "name-3" suffixes before giving up.
  while (attempt < 5) {
    const { data, error } = await supabase.rpc('create_business_with_owner', {
      business_name: parsed.data.name,
      business_slug: slug,
    })

    if (!error && data) {
      redirect('/dashboard')
    }

    // Postgres unique_violation
    if (error?.code === '23505') {
      attempt += 1
      slug = `${baseSlug}-${attempt + 1}`
      continue
    }

    return { error: error?.message ?? 'Something went wrong. Please try again.' }
  }

  return { error: 'Could not generate a unique URL for your business. Please try a different name.' }
}

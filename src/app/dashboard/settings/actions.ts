'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireCurrentBusiness } from '@/lib/current-business'

const businessSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().max(300).optional().or(z.literal('')),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(300)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Website must start with http:// or https://'),
  google_review_url: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal(''))
    .refine(
      (v) => !v || /^https:\/\/(www\.)?(google\.com|g\.page|goo\.gl)\//i.test(v),
      'Must be a Google review link (google.com, g.page, or goo.gl)'
    ),
  brand_color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color like #4F46E5'),
  welcome_message: z.string().trim().min(1).max(200),
  thank_you_message: z.string().trim().min(1).max(200),
})

export async function updateBusinessAction(
  _prevState: { error: string | null; success: boolean },
  formData: FormData
): Promise<{ error: string | null; success: boolean }> {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const parsed = businessSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address'),
    phone: formData.get('phone'),
    website: formData.get('website'),
    google_review_url: formData.get('google_review_url'),
    brand_color: formData.get('brand_color'),
    welcome_message: formData.get('welcome_message'),
    thank_you_message: formData.get('thank_you_message'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input', success: false }
  }

  const { error } = await supabase
    .from('businesses')
    .update(parsed.data)
    .eq('id', business.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath(`/f/${business.slug}`)
  return { error: null, success: true }
}

export async function updateBusinessImageAction(
  field: 'logo_url' | 'cover_image_url',
  publicUrl: string
): Promise<{ error: string | null }> {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const { error } = await supabase
    .from('businesses')
    .update({ [field]: publicUrl })
    .eq('id', business.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { error: null }
}

const categorySchema = z.object({ name: z.string().trim().min(1).max(40) })

export async function addCategoryAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const parsed = categorySchema.safeParse({ name: formData.get('name') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid category' }
  }

  const { count } = await supabase
    .from('feedback_categories')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', business.id)

  const { error } = await supabase.from('feedback_categories').insert({
    business_id: business.id,
    name: parsed.data.name,
    sort_order: (count ?? 0) + 1,
  })

  if (error) {
    return { error: error.code === '23505' ? 'That category already exists.' : error.message }
  }

  revalidatePath('/dashboard/settings')
  return { error: null }
}

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  await supabase
    .from('feedback_categories')
    .delete()
    .eq('id', categoryId)
    .eq('business_id', business.id)

  revalidatePath('/dashboard/settings')
}

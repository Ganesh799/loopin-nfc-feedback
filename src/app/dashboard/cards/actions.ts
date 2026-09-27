'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { requireCurrentBusiness } from '@/lib/current-business'

const labelSchema = z.object({ label: z.string().trim().min(1).max(60) })

export async function createCardAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const parsed = labelSchema.safeParse({ label: formData.get('label') })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid label' }
  }

  const { error } = await supabase.from('cards').insert({
    business_id: business.id,
    label: parsed.data.label,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/cards')
  return { error: null }
}

export async function toggleCardAction(cardId: string, isActive: boolean): Promise<void> {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  await supabase
    .from('cards')
    .update({ is_active: isActive })
    .eq('id', cardId)
    .eq('business_id', business.id)

  revalidatePath('/dashboard/cards')
}

export async function renameCardAction(cardId: string, label: string): Promise<void> {
  const { business } = await requireCurrentBusiness()
  const parsed = labelSchema.safeParse({ label })
  if (!parsed.success) return

  const supabase = createClient()
  await supabase
    .from('cards')
    .update({ label: parsed.data.label })
    .eq('id', cardId)
    .eq('business_id', business.id)

  revalidatePath('/dashboard/cards')
}

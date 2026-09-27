import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthCard } from '@/components/AuthCard'
import { OnboardingForm } from './OnboardingForm'

export default async function OnboardingPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // If they already have a business, skip straight to the dashboard.
  const { data: membership } = await supabase
    .from('business_users')
    .select('business_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (membership) {
    redirect('/dashboard')
  }

  return (
    <AuthCard title="Let's set up your business" subtitle="Takes about 30 seconds">
      <OnboardingForm />
    </AuthCard>
  )
}

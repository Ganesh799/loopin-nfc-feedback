import { requireCurrentBusiness } from '@/lib/current-business'
import { createClient } from '@/lib/supabase/server'
import { BusinessForm } from './BusinessForm'
import { ImageUploader } from './ImageUploader'
import { CategoryManager } from './CategoryManager'

export default async function SettingsPage() {
  const { business } = await requireCurrentBusiness()
  const supabase = createClient()

  const { data: categories } = await supabase
    .from('feedback_categories')
    .select('*')
    .eq('business_id', business.id)
    .order('sort_order')

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Business profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          This information appears on your customer feedback page.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          <ImageUploader
            businessId={business.id}
            field="logo_url"
            currentUrl={business.logo_url}
            label="Logo"
          />
          <ImageUploader
            businessId={business.id}
            field="cover_image_url"
            currentUrl={business.cover_image_url}
            label="Cover image"
          />
        </div>
        <BusinessForm business={business} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Feedback categories</h2>
        <p className="mt-1 text-sm text-slate-500">
          Shown as optional tags customers can select after rating.
        </p>
        <div className="mt-4">
          <CategoryManager categories={categories ?? []} />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-sm font-semibold text-slate-900">Your feedback page</h2>
        <p className="mt-2 text-sm text-slate-500">
          Cards point here automatically — create cards under{' '}
          <span className="font-medium">Cards</span> to get a QR code and NFC link.
        </p>
        <code className="mt-2 block truncate rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">
          {process.env.NEXT_PUBLIC_APP_URL ?? 'https://yourapp.com'}/f/{business.slug}/&#123;card&#125;
        </code>
      </section>
    </div>
  )
}

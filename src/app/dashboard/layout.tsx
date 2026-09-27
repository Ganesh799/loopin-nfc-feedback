import { requireCurrentBusiness } from '@/lib/current-business'
import { DashboardNav } from '@/components/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { business } = await requireCurrentBusiness()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardNav businessName={business.name} />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  )
}

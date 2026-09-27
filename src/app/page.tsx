import { Navbar } from '@/components/marketing/Navbar'
import { Hero } from '@/components/marketing/Hero'
import { HowItWorks } from '@/components/marketing/HowItWorks'
import { Features } from '@/components/marketing/Features'
import { Pricing } from '@/components/marketing/Pricing'
import { FAQ } from '@/components/marketing/FAQ'
import { Footer } from '@/components/marketing/Footer'

export default function LandingPage() {
  return (
    <div className="bg-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </div>
  )
}

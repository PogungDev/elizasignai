"use client"

import { useRouter } from "next/navigation"
import { LandingPage } from "@/components/landing-page"

export default function HomePage() {
  const router = useRouter()

  const handleGetStarted = () => {
    router.push("/eliza-sign") // Mengarahkan ke halaman ElizaSign AI
  }

  const handleLearnMore = () => {
    router.push("/how-it-works") // Mengarahkan ke halaman How It Works
  }

  return <LandingPage onGetStarted={handleGetStarted} onLearnMore={handleLearnMore} />
}

"use client"

import { useRouter } from "next/navigation"
import { HowItWorksPage } from "@/components/how-it-works-page"

export default function HowItWorks() {
  const router = useRouter()
  
  const handleTryDemo = () => {
    router.push("/dashboard")
  }

  return <HowItWorksPage onTryDemo={handleTryDemo} />
}

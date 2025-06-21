"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(pathname)

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    router.push(page)
  }

  return (
    <div className="min-h-screen bg-vault-dark">
      <Navigation 
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isWalletConnected={false} // This will be handled by wagmi inside Navigation component
      />
      <main className="flex-1">{children}</main>
    </div>
  )
} 
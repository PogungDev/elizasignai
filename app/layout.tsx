import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { Web3Provider } from "@/components/providers/web3-provider"
import { ClientLayout } from "./client-layout"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ElizaSign AI - Smart Contract Signing Assistant",
  description: "AI-powered smart contract signing with risk management and automated transactions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Web3Provider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <ClientLayout>
              {children}
            </ClientLayout>
            <Toaster />
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}

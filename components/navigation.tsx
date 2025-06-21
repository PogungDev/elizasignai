"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Bot, Code, Zap, Home, Settings, Wallet } from "lucide-react"
import { useAccount, useConnect, useDisconnect } from "wagmi"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { metaMask, injected } from "wagmi/connectors" // Import connectors

interface NavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  isWalletConnected: boolean // Prop ini tidak lagi digunakan secara langsung, wagmi akan menanganinya
}

export function Navigation({ currentPage, onPageChange, isWalletConnected }: NavigationProps) {
  const pathname = usePathname()
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "How It Works", href: "/how-it-works", icon: Settings },
    { name: "ElizaSign AI", href: "/eliza-sign", icon: Zap },
    { name: "Real Integration", href: "/real-integration", icon: Code },
  ]

  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "Connect Wallet"
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-vault-border bg-vault-dark px-4 md:px-6 shadow-lg">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base text-vault-primary hover:text-vault-primary/80"
        >
          <Bot className="h-6 w-6" />
          <span className="sr-only">ElizaSign AI</span>
          ElizaSign AI
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-2 transition-colors px-3 py-2 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-purple-600 text-white hover:bg-purple-700" // Aktif: background ungu
                    : "bg-transparent text-vault-text-muted hover:text-vault-primary hover:bg-vault-border", // Tidak aktif: transparan
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </div>
            </Link>
          )
        })}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
              <Bot className="h-6 w-6" />
              <span className="sr-only">ElizaSign AI</span>
              ElizaSign AI
            </Link>
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 transition-colors px-3 py-2 rounded-md",
                    isActive
                      ? "bg-purple-600 text-white" // Background ungu saat aktif
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
            {/* Connect Wallet for mobile */}
            <div className="mt-4">
              {isConnected ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-vault-text-muted hover:text-vault-primary"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      {formatAddress(address)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => disconnect()}>Disconnect</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-vault-text-muted hover:text-vault-primary"
                  onClick={() => connect({ connector: injected() || metaMask() })}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
      {/* Connect Wallet for desktop */}
      <div className="flex items-center gap-4">
        {isConnected ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-vault-text-muted hover:text-vault-primary">
                <Wallet className="h-4 w-4 mr-2" />
                {formatAddress(address)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => disconnect()}>Disconnect</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-vault-text-muted hover:text-vault-primary"
            onClick={() => connect({ connector: injected() || metaMask() })}
          >
            <Wallet className="h-4 w-4 mr-2" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  )
}

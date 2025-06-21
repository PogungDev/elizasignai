"use client"

import { useState } from "react"
import { UserFriendlyDashboard } from "@/components/user-friendly-dashboard"
import { ContractDemo } from "@/components/contract-demo"

export default function DashboardPage() {
  const [auditLogs, setAuditLogs] = useState<string[]>([])

  const handleAddAuditLog = (log: string) => {
    setAuditLogs(prev => [...prev, log])
  }

  const handleAction = (action: string) => {
    console.log("Action triggered:", action)
    handleAddAuditLog(`Action executed: ${action} at ${new Date().toLocaleTimeString()}`)
  }

  const handleConnectWallet = () => {
    console.log("Connecting wallet...")
    handleAddAuditLog(`Wallet connection initiated at ${new Date().toLocaleTimeString()}`)
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">VaultGuard Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive overview of your DeFi positions and AI-powered protection systems
        </p>
      </div>
      <div className="space-y-6">
        <ContractDemo />
        <UserFriendlyDashboard 
          initialAuditLogs={auditLogs}
          isConnected={false}
          onConnectWallet={handleConnectWallet}
          onAction={handleAction}
          onAddAuditLog={handleAddAuditLog}
          currentStep={1}
          vaultHealth={85}
          riskLevel="LOW"
          isDemo={true}
          aiRecommendedAction={null}
        />
      </div>
    </div>
  )
}

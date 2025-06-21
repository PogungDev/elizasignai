"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Send,
  Shield,
  Activity,
  CheckCircle,
  XCircle,
  Bot,
  Settings,
  Clock,
  LinkIcon,
  Database,
  BarChart3,
  Timer,
  Shuffle,
  Zap,
} from "lucide-react"
import { ElizaChatPanel } from "./eliza-chat-panel"
import { getElizaAIResponse } from "@/app/actions"
import type { RiskLevel } from "@/lib/simulated-engine"
import { toast } from "sonner"

interface TransactionHistoryEntry {
  id: string
  toAddress: string
  amount: number
  riskLevel: RiskLevel
  autoApprove: boolean
  agentDecision: string
  agentFeedback: string
  type: "success" | "warning" | "error"
  timestamp: Date
  chainlinkServicesUsed: string[]
}

export function ElizaSignApp() {
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState<number | string>("")
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("low")
  const [autoApprove, setAutoApprove] = useState(true)
  const [agentDecision, setAgentDecision] = useState<string | null>(null)
  const [agentFeedback, setAgentFeedback] = useState<string | null>(null)
  const [agentDecisionType, setAgentDecisionType] = useState<"success" | "warning" | "error" | null>(null)
  const [transactionHistory, setTransactionHistory] = useState<TransactionHistoryEntry[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  // Eliza Chat Panel states
  const [auditLogs, setAuditLogs] = useState<string[]>([])
  const [elizaStatus, setElizaStatus] = useState<"ACTIVE" | "SCANNING" | "IDLE">("ACTIVE")
  const [aiRecommendedAction, setAiRecommendedAction] = useState<string | null>(null)
  const [systemActionMessage, setSystemActionMessage] = useState<{
    message: string
    type: "success" | "warning" | "info" | "error"
    reasoning: string
  } | null>(null)
  const [lastChainlinkServicesUsed, setLastChainlinkServicesUsed] = useState<string[]>([])

  // Agent Configuration (user-controlled settings for the agent's behavior)
  const [agentConfig, setAgentConfig] = useState({
    autoApproveStatus: true, // This mirrors the user's autoApprove toggle for the agent's internal logic
    riskThreshold: "medium" as RiskLevel, // Agent will auto-approve up to this risk level if autoApprove is true
    signingMethod: "Delegated", // Can be "Delegated" or "Manual" (for simulation purposes)
  })

  useEffect(() => {
    // Sync agent's auto-approve status with user's toggle
    setAgentConfig((prev) => ({ ...prev, autoApproveStatus: autoApprove }))
  }, [autoApprove])

  const addAuditLog = (log: string) => {
    setAuditLogs((prev) => [...prev, log])
  }

  const handleSimulateTransaction = async () => {
    if (!toAddress || !amount) {
      toast.error("Please fill in To Address and Amount.")
      return
    }

    setIsSimulating(true)
    setAgentDecision(null)
    setAgentFeedback(null)
    setAgentDecisionType(null)
    setElizaStatus("SCANNING")
    addAuditLog(`Simulating transaction to ${toAddress} for ${amount} ETH with ${riskLevel} risk...`)

    try {
      const response = await getElizaAIResponse({
        userMessage: "simulate transaction", // This message triggers the specific simulation logic in actions.ts
        elizaStatus: "SCANNING",
        currentStep: 1, // Dummy value for this context
        aiRecommendedAction: null,
        auditLogsSummary: auditLogs.slice(-5).join("; "),
        toAddress,
        amount: Number.parseFloat(amount as string),
        riskLevel,
        autoApprove,
        agentConfig,
      })

      if (response.elizaSignDecision) {
        const { decision, feedback, type, chainlinkServicesUsed } = response.elizaSignDecision
        setAgentDecision(decision)
        setAgentFeedback(feedback)
        setAgentDecisionType(type)
        setLastChainlinkServicesUsed(chainlinkServicesUsed)

        const newEntry: TransactionHistoryEntry = {
          id: `tx-${Date.now()}`,
          toAddress,
          amount: Number.parseFloat(amount as string),
          riskLevel,
          autoApprove,
          agentDecision: decision,
          agentFeedback: feedback,
          type,
          timestamp: new Date(),
          chainlinkServicesUsed,
        }
        setTransactionHistory((prev) => [newEntry, ...prev].slice(0, 10)) // Keep last 10

        addAuditLog(`${decision}: ${feedback}`)
        toast[type](`Transaction ${type === "error" ? "Blocked" : "Processed"}`, { description: feedback })
      } else {
        setAgentDecision("Error")
        setAgentFeedback("Failed to get a decision from Eliza Agent.")
        setAgentDecisionType("error")
        toast.error("Simulation Error", { description: "Failed to get a decision from Eliza Agent." })
      }
    } catch (error) {
      console.error("Simulation failed:", error)
      setAgentDecision("Error")
      setAgentFeedback("An unexpected error occurred during simulation.")
      setAgentDecisionType("error")
      toast.error("Simulation Failed", { description: "An unexpected error occurred." })
    } finally {
      setIsSimulating(false)
      setElizaStatus("ACTIVE")
    }
  }

  const getDecisionIcon = (type: "success" | "warning" | "error" | null) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case "warning":
        return <Activity className="h-6 w-6 text-yellow-500" />
      case "error":
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <Bot className="h-6 w-6 text-gray-500" />
    }
  }

  const getDecisionBadgeVariant = (type: "success" | "warning" | "error" | null) => {
    switch (type) {
      case "success":
        return "default" as const
      case "warning":
        return "secondary" as const
      case "error":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case "low":
        return "text-green-500"
      case "medium":
        return "text-yellow-500"
      case "high":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getRiskBadgeVariant = (risk: RiskLevel) => {
    switch (risk) {
      case "low":
        return "default" as const
      case "medium":
        return "secondary" as const
      case "high":
        return "destructive" as const
      default:
        return "outline" as const
    }
  }

  const getChainlinkServiceIcon = (serviceName: string) => {
    switch (serviceName) {
      case "Chainlink Functions":
        return <BarChart3 className="h-3 w-3" />
      case "Chainlink Data Feeds":
        return <Database className="h-3 w-3" />
      case "Chainlink Automation (Block)":
      case "Chainlink Automation (Auto-Sign)":
      case "Chainlink Automation (Delegate)":
        return <Timer className="h-3 w-3" />
      case "Chainlink VRF":
        return <Shuffle className="h-3 w-3" />
      case "Chainlink Data Streams":
        return <Zap className="h-3 w-3" />
      default:
        return <LinkIcon className="h-3 w-3" />
    }
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center text-blue-400 mb-8">ElizaSign AI</h1>
          <p className="text-lg text-center text-gray-300 mb-12">
            Your Transaction Guardian: Risk-Managed Smart Contract Signing powered by ElizaOS and Chainlink.
          </p>

          {/* Transaction Form */}
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Send className="h-5 w-5 text-blue-400" />
                Simulate Transaction
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter transaction details to see Eliza Agent's decision.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toAddress" className="mb-2 block text-white">
                    To Address
                  </Label>
                  <Input
                    id="toAddress"
                    placeholder="0x..."
                    value={toAddress}
                    onChange={(e) => setToAddress(e.target.value)}
                    className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <Label htmlFor="amount" className="mb-2 block text-white">
                    Amount (ETH)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-slate-700/50 border-blue-500/30 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-white">Risk Level</Label>
                <RadioGroup
                  value={riskLevel}
                  onValueChange={(value: RiskLevel) => setRiskLevel(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="r1" />
                    <Label htmlFor="r1" className={getRiskColor("low")}>
                      Low
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="r2" />
                    <Label htmlFor="r2" className={getRiskColor("medium")}>
                      Medium
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="r3" />
                    <Label htmlFor="r3" className={getRiskColor("high")}>
                      High
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-approve" className="text-base text-white">
                  Auto-Approve Transactions
                </Label>
                <Switch id="auto-approve" checked={autoApprove} onCheckedChange={setAutoApprove} />
              </div>

              <Button
                onClick={handleSimulateTransaction}
                disabled={isSimulating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isSimulating ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" /> Simulating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" /> Get Eliza Agent Decision
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Eliza Agent Decision */}
          {agentDecision && (
            <Alert
              className={`border ${
                agentDecisionType === "success"
                  ? "border-green-500 bg-green-900/20"
                  : agentDecisionType === "warning"
                    ? "border-yellow-500 bg-yellow-900/20"
                    : "border-red-500 bg-red-900/20"
              } bg-slate-800/50`}
            >
              <div className="flex items-center gap-3">
                {getDecisionIcon(agentDecisionType)}
                <div>
                  <AlertTitle className="text-lg font-bold text-white">{agentDecision}</AlertTitle>
                  <AlertDescription className="text-gray-300">{agentFeedback}</AlertDescription>
                  {lastChainlinkServicesUsed.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs text-blue-300">Powered by:</span>
                      {lastChainlinkServicesUsed.map((service, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-blue-300 border-blue-500/30 bg-blue-900/20 flex items-center gap-1"
                        >
                          {getChainlinkServiceIcon(service)}
                          {service}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          )}

          {/* Transaction History */}
          <Card className="bg-slate-800/50 border-blue-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-green-400" />
                Transaction History
              </CardTitle>
              <CardDescription className="text-gray-400">
                Recent simulated transactions and Eliza Agent's actions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No transactions simulated yet.</p>
              ) : (
                <div className="space-y-4">
                  {transactionHistory.map((tx) => (
                    <div
                      key={tx.id}
                      className={`p-4 rounded-lg border ${
                        tx.type === "success"
                          ? "border-green-500/30 bg-green-900/10"
                          : tx.type === "warning"
                            ? "border-yellow-500/30 bg-yellow-900/10"
                            : "border-red-500/30 bg-red-900/10"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-white flex items-center gap-2">
                          {getDecisionIcon(tx.type)}
                          {tx.agentDecision}
                        </div>
                        <Badge variant={getDecisionBadgeVariant(tx.type)}>{tx.riskLevel.toUpperCase()} Risk</Badge>
                      </div>
                      <p className="text-sm text-gray-300">
                        To: {tx.toAddress} | Amount: {tx.amount} ETH
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{tx.agentFeedback}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tx.chainlinkServicesUsed.map((service, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs text-blue-300 border-blue-500/30 bg-blue-900/20 flex items-center gap-1"
                          >
                            {getChainlinkServiceIcon(service)}
                            {service}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-right">{tx.timestamp.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Agent Configuration Panel (Right Sidebar) */}
      <div className="w-1/4 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-l border-blue-500/30 shadow-2xl backdrop-blur-sm rounded-l-xl p-6 space-y-6">
        <Card className="bg-slate-800/50 border-blue-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Settings className="h-5 w-5 text-green-400" />
              ElizaOS Agent Configuration
            </CardTitle>
            <CardDescription className="text-gray-400">
              Current settings for Eliza Agent's decision-making.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base text-white">Auto-Approve Status</Label>
              <Badge variant={agentConfig.autoApproveStatus ? "default" : "destructive"}>
                {agentConfig.autoApproveStatus ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <Separator className="bg-blue-500/30" />
            <div>
              <Label className="mb-2 block text-white">Risk Threshold</Label>
              <Badge variant={getRiskBadgeVariant(agentConfig.riskThreshold)} className="text-base">
                {agentConfig.riskThreshold.toUpperCase()}
              </Badge>
              <p className="text-sm text-gray-400 mt-1">
                Agent will auto-approve transactions up to this risk level (if auto-approve is enabled).
              </p>
              <RadioGroup
                value={agentConfig.riskThreshold}
                onValueChange={(value: RiskLevel) => setAgentConfig((prev) => ({ ...prev, riskThreshold: value }))}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="agent-r1" />
                  <Label htmlFor="agent-r1" className={getRiskColor("low")}>
                    Low
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="agent-r2" />
                  <Label htmlFor="agent-r2" className={getRiskColor("medium")}>
                    Medium
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="agent-r3" />
                  <Label htmlFor="agent-r3" className={getRiskColor("high")}>
                    High
                  </Label>
                </div>
              </RadioGroup>
            </div>
            <Separator className="bg-blue-500/30" />
            <div className="flex items-center justify-between">
              <Label className="text-base text-white">Signing Method</Label>
              <Badge variant="outline">{agentConfig.signingMethod}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Eliza Chat Panel */}
      <ElizaChatPanel
        onTriggerAction={() => {}} // No general actions in this SPA
        auditLogs={auditLogs}
        currentStep={transactionHistory.length}
        elizaStatus={elizaStatus}
        onStatusChange={setElizaStatus}
        aiRecommendedAction={aiRecommendedAction}
        getElizaAIResponse={getElizaAIResponse}
        systemActionMessage={systemActionMessage}
        onSimulateTransaction={(to, amt, risk, auto) => {
          setToAddress(to)
          setAmount(amt)
          setRiskLevel(risk)
          setAutoApprove(auto)
          handleSimulateTransaction()
        }}
        agentConfig={agentConfig}
      />
    </div>
  )
}

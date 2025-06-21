'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { contractAddresses, YieldOptimizerABI } from '@/lib/contracts'
import { toast } from 'sonner'

export function ContractDemo() {
  const { address, isConnected } = useAccount()
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')

  // Read user balance from YieldOptimizer
  const { data: userBalance } = useReadContract({
    address: contractAddresses.yieldOptimizer,
    abi: YieldOptimizerABI,
    functionName: 'balances',
    args: address ? [address] : undefined,
  })

  // Write contract hooks
  const { writeContract: deposit, data: depositHash } = useWriteContract()
  const { writeContract: withdraw, data: withdrawHash } = useWriteContract()

  // Wait for transaction receipts
  const { isLoading: isDepositing } = useWaitForTransactionReceipt({
    hash: depositHash,
  })
  const { isLoading: isWithdrawing } = useWaitForTransactionReceipt({
    hash: withdrawHash,
  })

  const handleDeposit = async () => {
    if (!depositAmount) return
    
    try {
      await deposit({
        address: contractAddresses.yieldOptimizer,
        abi: YieldOptimizerABI,
        functionName: 'deposit',
        args: [parseEther(depositAmount)],
        value: parseEther(depositAmount),
      })
      toast.success('Deposit transaction submitted!')
      setDepositAmount('')
    } catch (error) {
      toast.error('Failed to deposit')
      console.error(error)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    
    try {
      await withdraw({
        address: contractAddresses.yieldOptimizer,
        abi: YieldOptimizerABI,
        functionName: 'withdraw',
        args: [parseEther(withdrawAmount)],
      })
      toast.success('Withdraw transaction submitted!')
      setWithdrawAmount('')
    } catch (error) {
      toast.error('Failed to withdraw')
      console.error(error)
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to interact with smart contracts
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yield Optimizer Demo</CardTitle>
        <CardDescription>
          Interact with the deployed Yield Optimizer smart contract
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Your Balance:</p>
          <p className="text-2xl font-bold">
            {userBalance ? formatEther(userBalance) : '0'} ETH
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit">Deposit Amount (ETH)</Label>
          <div className="flex space-x-2">
            <Input
              id="deposit"
              type="number"
              placeholder="0.0"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              step="0.01"
            />
            <Button 
              onClick={handleDeposit}
              disabled={isDepositing || !depositAmount}
            >
              {isDepositing ? 'Depositing...' : 'Deposit'}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="withdraw">Withdraw Amount (ETH)</Label>
          <div className="flex space-x-2">
            <Input
              id="withdraw"
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              step="0.01"
            />
            <Button 
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount}
              variant="outline"
            >
              {isWithdrawing ? 'Withdrawing...' : 'Withdraw'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

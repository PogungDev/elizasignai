export interface ChartDataPoint {
  timestamp: number
  value: number
  trend?: "up" | "down" | "stable"
}

export interface HistoricalData {
  ltvRatio: ChartDataPoint[]
  yieldRate: ChartDataPoint[]
  riskScore: ChartDataPoint[]
  tvl: ChartDataPoint[]
  gasFees: ChartDataPoint[]
  liquidationThreshold: ChartDataPoint[]
  mevAttempts: ChartDataPoint[]
  priceFeeds: ChartDataPoint[]
}

export class ChartDataGenerator {
  static formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  static generateDataPoints(count: number = 24, baseValue: number = 100, volatility: number = 0.1): ChartDataPoint[] {
    const points: ChartDataPoint[] = []
    const now = Date.now()
    const hourInMs = 60 * 60 * 1000

    for (let i = 0; i < count; i++) {
      const timestamp = now - (count - i - 1) * hourInMs
      const randomFactor = (Math.random() - 0.5) * 2 * volatility
      const value = baseValue * (1 + randomFactor)
      
      let trend: "up" | "down" | "stable" = "stable"
      if (i > 0) {
        const prevValue = points[i - 1].value
        if (value > prevValue * 1.02) trend = "up"
        else if (value < prevValue * 0.98) trend = "down"
      }

      points.push({
        timestamp,
        value: Math.max(0, value),
        trend
      })
    }

    return points
  }

  static generateRealTimeData(): HistoricalData {
    return {
      ltvRatio: this.generateDataPoints(24, 65, 0.05), // 65% base LTV with low volatility
      yieldRate: this.generateDataPoints(24, 8.5, 0.1), // 8.5% base yield
      riskScore: this.generateDataPoints(24, 25, 0.2), // Risk score 0-100
      tvl: this.generateDataPoints(24, 2500000, 0.15), // $2.5M base TVL
      gasFees: this.generateDataPoints(24, 45, 0.3), // $45 base gas fees
      liquidationThreshold: this.generateDataPoints(24, 85, 0.02), // 85% liquidation threshold
      mevAttempts: this.generateDataPoints(24, 12, 0.4), // 12 base MEV attempts
      priceFeeds: this.generateDataPoints(24, 3200, 0.05) // $3200 base ETH price
    }
  }

  static getLatestValue(data: ChartDataPoint[]): number {
    return data.length > 0 ? data[data.length - 1].value : 0
  }

  static calculateChange(data: ChartDataPoint[]): { value: number; percentage: number } {
    if (data.length < 2) return { value: 0, percentage: 0 }
    
    const latest = data[data.length - 1].value
    const previous = data[data.length - 2].value
    const value = latest - previous
    const percentage = previous !== 0 ? (value / previous) * 100 : 0

    return { value, percentage }
  }

  static getTrend(data: ChartDataPoint[]): "up" | "down" | "stable" {
    if (data.length < 2) return "stable"
    
    const latest = data[data.length - 1].value
    const previous = data[data.length - 2].value
    
    if (latest > previous * 1.01) return "up"
    if (latest < previous * 0.99) return "down"
    return "stable"
  }

  static formatValue(value: number, type: string): string {
    switch (type) {
      case 'percentage':
        return `${value.toFixed(2)}%`
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value)
      case 'tvl':
        if (value >= 1000000) {
          return `$${(value / 1000000).toFixed(1)}M`
        } else if (value >= 1000) {
          return `$${(value / 1000).toFixed(1)}K`
        }
        return `$${value.toFixed(0)}`
      default:
        return value.toFixed(2)
    }
  }
} 
export const MAX_TOKENS = 3 as const

export type PairId = string

export interface Token {
  pairId: PairId
  symbol: string
  icon?: string
  baseAddress?: string
}

export interface Quote {
  price: number | null // USD 价（缺失时 null）
  change24h: number | null // 24h 涨跌幅%
  updatedAt: number
  stale?: boolean
}

export type QuotesMap = Record<PairId, Quote>

export interface LocalStorageSchema {
  quotes: QuotesMap
}

export interface SyncStorageSchema {
  tokens: Token[]
  schemaVersion: number
  widgetEnabled: boolean
}

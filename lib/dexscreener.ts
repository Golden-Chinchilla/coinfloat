import { type PairId, type Quote, type QuotesMap, type Token } from "./types"

const BASE = "https://api.dexscreener.com/latest/dex/pairs/solana/"

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { accept: "application/json" } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

type PairResp = {
  schemaVersion?: string
  pairs?: Array<{
    chainId: string
    dexId: string
    url: string
    pairAddress: string
    baseToken: { address: string; name: string; symbol: string }
    quoteToken: { address: string; name: string; symbol: string }
    priceNative?: string
    priceUsd?: string
    txns?: any
    volume?: any
    priceChange?: { h24?: number; h6?: number } | null
    liquidity?: any
    fdv?: number
    marketCap?: number
    pairCreatedAt?: number
    info?: { imageUrl?: string }
  }>
}

// 提取第一个 pair（Dexscreener 返回数组，通常我们只取目标 pair）
function pickPair(r?: PairResp) {
  return r?.pairs?.[0]
}

// 将 pair 映射到我们的 Quote
function toQuoteFromPair(p?: ReturnType<typeof pickPair>): Quote {
  const now = Date.now()
  const price = p?.priceUsd ? Number(p.priceUsd) : null
  const change24h =
    typeof p?.priceChange?.h24 === "number" ? Number(p.priceChange!.h24) : null
  return { price, change24h, updatedAt: now, stale: price === null }
}

// 解析 meta：symbol、icon、baseAddress
export async function resolvePairMeta(pairId: PairId) {
  const data = await fetchJson<PairResp>(BASE + pairId)
  const p = pickPair(data)
  if (!p) throw new Error("未找到该交易对")
  return {
    symbol: p.baseToken?.symbol ?? pairId.slice(0, 6),
    icon: p.info?.imageUrl,
    baseAddress: p.baseToken?.address
  }
}

// 获取单个交易对的报价
export async function fetchOne(pairId: PairId): Promise<Quote> {
  const data = await fetchJson<PairResp>(BASE + pairId)
  const p = pickPair(data)
  return toQuoteFromPair(p)
}

// 批量获取报价（≤3，顺序串行足够稳定）
export async function fetchQuotes(tokens: Token[]): Promise<QuotesMap> {
  const map: QuotesMap = {}
  for (const t of tokens) {
    try {
      map[t.pairId] = await fetchOne(t.pairId)
    } catch {
      map[t.pairId] = {
        price: null,
        change24h: null,
        updatedAt: Date.now(),
        stale: true
      }
    }
  }
  return map
}

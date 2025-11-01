import {
  MAX_TOKENS,
  type QuotesMap,
  type SyncStorageSchema,
  type Token
} from "./types"

// ---- Promisify storage ----
const getSync = <K extends keyof SyncStorageSchema>(keys: K[] | K) =>
  new Promise<Pick<SyncStorageSchema, K>>((resolve) =>
    chrome.storage.sync.get(keys as any, (res) => resolve(res as any))
  )

const setSync = (obj: Partial<SyncStorageSchema>) =>
  new Promise<void>((resolve) => chrome.storage.sync.set(obj, () => resolve()))

const getLocal = <T extends object = { quotes: QuotesMap }>(
  keys: string[] | string
) =>
  new Promise<T>((resolve) =>
    chrome.storage.local.get(keys as any, (res) => resolve(res as any))
  )

const setLocal = (obj: object) =>
  new Promise<void>((resolve) => chrome.storage.local.set(obj, () => resolve()))

// ---- 初始化 schema ----
async function ensureInit() {
  const { tokens, schemaVersion, widgetEnabled } = await getSync([
    "tokens",
    "schemaVersion",
    "widgetEnabled"
  ])

  const normalizedTokens = Array.isArray(tokens) ? tokens : []
  const enabled = typeof widgetEnabled === "boolean" ? widgetEnabled : true

  if (!schemaVersion) {
    await setSync({
      schemaVersion: 3,
      tokens: normalizedTokens,
      widgetEnabled: enabled
    })
    return
  }

  const updates: Partial<SyncStorageSchema> = {}

  if (!Array.isArray(tokens)) {
    updates.tokens = []
  }
  if (schemaVersion < 3) {
    updates.schemaVersion = 3
  }
  if (typeof widgetEnabled !== "boolean") {
    updates.widgetEnabled = enabled
  }

  if (Object.keys(updates).length) {
    await setSync(updates)
  }
}

// ---- 对外 API ----
export async function getTokens(): Promise<Token[]> {
  await ensureInit()
  const { tokens } = await getSync("tokens")
  return Array.isArray(tokens) ? tokens : []
}

export async function setTokens(list: Token[]) {
  if (list.length > MAX_TOKENS)
    throw new Error(`最多只能添加 ${MAX_TOKENS} 个代币`)
  const seen = new Set<string>()
  const clean = list.filter((t) => {
    const k = t.pairId.toLowerCase()
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
  await setSync({ tokens: clean })
}

export async function addToken(tok: Token) {
  const tokens = await getTokens()
  const id = tok.pairId.toLowerCase()
  if (tokens.find((t) => t.pairId.toLowerCase() === id)) {
    throw new Error("该交易对已存在")
  }
  if (tokens.length >= MAX_TOKENS)
    throw new Error(`最多添加 ${MAX_TOKENS} 个代币`)
  tokens.push(tok)
  await setTokens(tokens)
}

export async function removeToken(pairId: string) {
  const tokens = await getTokens()
  const next = tokens.filter(
    (t) => t.pairId.toLowerCase() !== pairId.toLowerCase()
  )
  await setTokens(next)
}

export function watchTokens(cb: (tokens: Token[]) => void) {
  const handler = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => {
    if (area === "sync" && changes.tokens) {
      cb(changes.tokens.newValue as Token[])
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}

// ---- 行情缓存（local）----
export async function getQuotes(): Promise<QuotesMap> {
  const { quotes } = await getLocal<{ quotes?: QuotesMap }>("quotes")
  return quotes ?? {}
}

export async function setQuotes(q: QuotesMap) {
  await setLocal({ quotes: q })
}

export function watchQuotes(cb: (quotes: QuotesMap) => void) {
  const handler = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => {
    if (area === "local" && changes.quotes) {
      cb(changes.quotes.newValue as QuotesMap)
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}

export async function getWidgetEnabled(): Promise<boolean> {
  await ensureInit()
  const { widgetEnabled } = await getSync("widgetEnabled")
  return typeof widgetEnabled === "boolean" ? widgetEnabled : true
}

export async function setWidgetEnabled(enabled: boolean) {
  await setSync({ widgetEnabled: enabled })
}

export function watchWidgetEnabled(cb: (enabled: boolean) => void) {
  const handler = (
    changes: { [key: string]: chrome.storage.StorageChange },
    area: string
  ) => {
    if (area === "sync" && changes.widgetEnabled) {
      const next = changes.widgetEnabled.newValue
      cb(typeof next === "boolean" ? next : true)
    }
  }
  chrome.storage.onChanged.addListener(handler)
  return () => chrome.storage.onChanged.removeListener(handler)
}

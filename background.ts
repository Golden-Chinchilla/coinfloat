import { fetchQuotes } from "~lib/dexscreener"
import { getTokens, setQuotes } from "~lib/storage"

const ALARM_NAME = "dexscrape"
const PERIOD_MIN = 0.05 // 3s

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: PERIOD_MIN })
})

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return
  await runOnce()
})

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "sync" && changes.tokens) {
    await runOnce()
  }
})

async function runOnce() {
  try {
    const tokens = await getTokens()
    if (!tokens.length) {
      await setQuotes({})
      return
    }
    const quotes = await fetchQuotes(tokens) // ✅ 以 pairId 为 key 的报价
    await setQuotes(quotes)
  } catch {
    // 忽略错误（可扩展退避/告警）
  }
}

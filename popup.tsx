import React, { useEffect, useState } from "react"

import "~style.css"

import { AddTokenModal } from "~components/AddTokenModal"
import { resolvePairMeta } from "~lib/dexscreener"
import {
  addToken,
  getTokens,
  getWidgetEnabled,
  setWidgetEnabled as persistWidgetEnabled,
  removeToken,
  watchTokens,
  watchWidgetEnabled
} from "~lib/storage"
import { MAX_TOKENS, type Token } from "~lib/types"

export default function PopupPage() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string>("")
  const [widgetEnabled, setWidgetEnabledState] = useState(true)

  useEffect(() => {
    getTokens().then(setTokens)
    const un = watchTokens(setTokens)
    return un
  }, [])

  useEffect(() => {
    getWidgetEnabled().then(setWidgetEnabledState)
    const un = watchWidgetEnabled(setWidgetEnabledState)
    return () => un?.()
  }, [])

  const onToggleWidget = async (next: boolean) => {
    setWidgetEnabledState(next)
    await persistWidgetEnabled(next)
  }

  const onAdd = async (pairId: string) => {
    setError("")
    if (!pairId) {
      setError("请输入交易对地址（pairId）")
      return
    }
    try {
      const meta = await resolvePairMeta(pairId.trim())
      await addToken({
        pairId: pairId.trim(),
        symbol: meta.symbol,
        icon: meta.icon,
        baseAddress: meta.baseAddress
      })
    } catch (e: any) {
      setError(e?.message || "添加失败")
    }
  }

  return (
    <div className="w-[22rem] p-4 space-y-3 bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
        <div className="flex flex-col">
          <span className="font-semibold">悬浮窗</span>
          <span className="text-[11px] text-slate-500">
            控制页面上的价格悬浮窗显隐
          </span>
        </div>
        <label className="inline-flex items-center gap-2">
          <span className="text-[11px] text-slate-500">
            {widgetEnabled ? "开启" : "关闭"}
          </span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-slate-700"
            checked={widgetEnabled}
            onChange={(e) => onToggleWidget(e.target.checked)}
          />
        </label>
      </div>

      <div className="text-sm font-semibold">
        管理代币（最多 {MAX_TOKENS} 个）
      </div>

      <ul className="space-y-2">
        {tokens.length === 0 && (
          <li className="text-xs text-slate-500">还没有代币，点击下方添加吧</li>
        )}
        {tokens.map((t) => (
          <li
            key={t.pairId}
            className="flex items-center justify-between rounded-md border p-2">
            <div className="flex items-center gap-2 min-w-0">
              {t.icon ? (
                <img
                  src={t.icon}
                  alt={t.symbol}
                  className="h-5 w-5 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="h-5 w-5 rounded-full bg-slate-200" />
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{t.symbol}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {t.pairId}
                </div>
              </div>
            </div>
            <button
              className="text-xs px-2 py-1 rounded-md border hover:bg-slate-50"
              onClick={() => removeToken(t.pairId)}
              title="删除">
              ×
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between">
        <button
          className="text-xs px-3 py-1.5 rounded-md border hover:bg-slate-50 disabled:opacity-40"
          onClick={() => setOpen(true)}
          disabled={tokens.length >= MAX_TOKENS}>
          添加代币
        </button>
        {tokens.length >= MAX_TOKENS && (
          <span className="text-[11px] text-amber-600">已达上限</span>
        )}
      </div>

      {error && <div className="text-[12px] text-rose-600">{error}</div>}

      <AddTokenModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={onAdd}
        maxed={tokens.length >= MAX_TOKENS}
      />
    </div>
  )
}

import React, { useEffect, useMemo, useRef, useState } from "react"

import { getQuotes, getTokens, watchQuotes, watchTokens } from "~lib/storage"
import { type QuotesMap, type Token } from "~lib/types"

import { TokenRow, type TokenRowData } from "./TokenRow"

const cx = (...cls: Array<string | false | undefined>) =>
  cls.filter(Boolean).join(" ")
const POS_KEY = "__coinfloat_pos__"
const COLLAPSE_KEY = "__coinfloat_collapsed__"

const readPos = () => {
  try {
    const raw = localStorage.getItem(POS_KEY)
    if (raw) return JSON.parse(raw) as { x: number; y: number }
  } catch {}
  return null
}
const savePos = (p: { x: number; y: number }) => {
  try {
    localStorage.setItem(POS_KEY, JSON.stringify(p))
  } catch {}
}

export function FloatingWidget() {
  const [tokens, setTokens] = useState<Token[]>([])
  const [quotes, setQuotes] = useState<QuotesMap>({})

  useEffect(() => {
    getTokens().then(setTokens)
    getQuotes().then(setQuotes)
    const unTokens = watchTokens(setTokens)
    const unQuotes = watchQuotes(setQuotes)
    return () => {
      unTokens?.()
      unQuotes?.()
    }
  }, [])

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === "1"
    } catch {
      return false
    }
  })
  const viewTokens = useMemo(
    () => tokens.slice(0, collapsed ? 1 : 3),
    [tokens, collapsed]
  )

  // ✅ 合并：使用 pairId 取 quotes；symbol/icon 来自存储（添加时已解析）
  const rows: TokenRowData[] = useMemo(
    () =>
      viewTokens.map((t) => {
        const q = quotes[t.pairId]
        return {
          symbol: t.symbol,
          iconUrl: t.icon,
          price: q?.price ?? undefined,
          change24h: q?.change24h ?? undefined
        }
      }),
    [viewTokens, quotes]
  )

  // 拖拽定位
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    const saved = readPos()
    if (saved) return saved
    return {
      x: Math.max(8, window.innerWidth - 16 - 224),
      y: Math.max(8, window.innerHeight - 16 - 120)
    }
  })
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    if (!readPos()) {
      const preferX = window.innerWidth - rect.width - 16
      const preferY = window.innerHeight - rect.height - 16
      setPos({ x: Math.max(8, preferX), y: Math.max(8, preferY) })
    }
  }, [])
  const dragState = useRef({
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    dragging: false
  })
  const onMove = (e: PointerEvent) => {
    if (!dragState.current.dragging || !wrapRef.current) return
    const dx = e.clientX - dragState.current.startX
    const dy = e.clientY - dragState.current.startY
    const rect = wrapRef.current.getBoundingClientRect()
    const maxX = window.innerWidth - rect.width - 8
    const maxY = window.innerHeight - rect.height - 8
    setPos({
      x: Math.min(Math.max(dragState.current.originX + dx, 8), maxX),
      y: Math.min(Math.max(dragState.current.originY + dy, 8), maxY)
    })
  }
  const onUp = () => {
    if (!dragState.current.dragging) return
    dragState.current.dragging = false
    savePos(pos)
    window.removeEventListener("pointermove", onMove)
    window.removeEventListener("pointerup", onUp)
  }
  const startDrag = (e: React.PointerEvent) => {
    if (!wrapRef.current) return
    dragState.current.dragging = true
    dragState.current.startX = e.clientX
    dragState.current.startY = e.clientY
    dragState.current.originX = pos.x
    dragState.current.originY = pos.y
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }

  const toggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCollapsed((v) => {
      const next = !v
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0")
      } catch {}
      return next
    })
  }

  const widthClass = collapsed ? "w-48" : "w-56"

  return (
    <div
      ref={wrapRef}
      style={{ position: "fixed", left: pos.x, top: pos.y }}
      onPointerDown={startDrag}
      className="z-[2147483647] cursor-grab active:cursor-grabbing select-none">
      <div
        className={cx(
          widthClass,
          "rounded-2xl overflow-hidden",
          "backdrop-blur-2xl backdrop-saturate-150",
          "bg-white/25 dark:bg-slate-800/35",
          "border border-white/25 dark:border-white/15",
          "shadow-[0_8px_24px_rgba(0,0,0,0.25)] ring-1 ring-white/20"
        )}>
        {/* 折叠把手 */}
        <div className="flex items-center justify-end px-1.5 pt-1.5">
          <button
            onClick={toggleCollapse}
            onPointerDown={(e) => e.stopPropagation()}
            title={collapsed ? "展开" : "折叠"}
            className="h-5 px-2 rounded-md text-[11px] font-medium
                       bg-white/35 dark:bg-slate-700/40 border border-white/25
                       hover:bg-white/50 dark:hover:bg-slate-700/60
                       text-slate-700 dark:text-slate-200">
            {collapsed ? "▢" : "—"}
          </button>
        </div>

        <ul className="divide-y divide-white/15 dark:divide-white/10">
          {rows.map((row, idx) => (
            <TokenRow key={row.symbol + idx} token={row} />
          ))}
          {rows.length === 0 && (
            <li className="px-2.5 py-2 text-[12px] text-slate-600 dark:text-slate-300">
              去扩展弹窗添加代币（最多 3 个）
            </li>
          )}
        </ul>

        <div className="h-1 bg-gradient-to-r from-white/40 via-white/10 to-white/40" />
      </div>
    </div>
  )
}

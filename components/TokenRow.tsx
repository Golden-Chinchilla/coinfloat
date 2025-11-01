import React, { useEffect, useRef, useState } from "react"

export type TokenRowData = {
  symbol: string
  price?: number
  change24h?: number
  iconUrl?: string
}

const cx = (...cls: Array<string | false | undefined>) =>
  cls.filter(Boolean).join(" ")

export function TokenRow({ token }: { token: TokenRowData }) {
  const [flash, setFlash] = useState<"up" | "down" | null>(null)
  const prevPrice = useRef<number | undefined>()

  useEffect(() => {
    if (token.price === prevPrice.current) return

    if (prevPrice.current !== undefined) {
      if (token.price! > prevPrice.current!) setFlash("up")
      else if (token.price! < prevPrice.current!) setFlash("down")

      const t = setTimeout(() => setFlash(null), 600)
      prevPrice.current = token.price
      return () => clearTimeout(t)
    }

    prevPrice.current = token.price
  }, [token.price])

  const flashClass =
    flash === "up" ? "flash-up" : flash === "down" ? "flash-down" : ""

  return (
    <li
      className={cx(
        "px-2.5 py-1.5",
        "flex items-center justify-between gap-2",
        "bg-white/25 dark:bg-slate-700/25",
        flashClass
      )}>
      {/* 左：icon + 符号 */}
      <div className="flex items-center gap-2 min-w-0">
        {token.iconUrl ? (
          <img
            src={token.iconUrl}
            alt={token.symbol}
            className="h-5 w-5 rounded-full object-cover shadow-inner"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span
            className={cx(
              "h-5 w-5 rounded-full",
              "bg-gradient-to-br from-white/80 to-white/30",
              "dark:from-slate-200/40 dark:to-slate-500/20",
              "shadow-inner"
            )}
          />
        )}
        <span className="text-[13px] font-medium text-slate-800 dark:text-slate-100 truncate">
          {token.symbol}
        </span>
      </div>

      {/* 右：价格 + 涨跌幅 */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[12px] tabular-nums text-slate-900 dark:text-slate-100">
          {token.price != null ? `$${token.price.toFixed(5)}` : "--"}
        </span>
        <span
          className={cx(
            "text-[12px] tabular-nums font-medium",
            (token.change24h ?? 0) >= 0 ? "text-emerald-600" : "text-rose-600"
          )}>
          {token.change24h != null
            ? `${(token.change24h >= 0 ? "+" : "") + token.change24h.toFixed(2)}%`
            : "--"}
        </span>
      </div>
    </li>
  )
}

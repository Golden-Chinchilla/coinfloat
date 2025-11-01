import React from "react"

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (pairId: string) => void
  maxed?: boolean
}

export function AddTokenModal({ open, onClose, onSubmit, maxed }: Props) {
  const [pairId, setPairId] = React.useState("")

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-[22rem] rounded-2xl p-4
                   backdrop-blur-xl bg-white/30 dark:bg-slate-800/40
                   border border-white/25 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <div className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
          添加 Solana 交易对
        </div>
        <input
          value={pairId}
          onChange={(e) => setPairId(e.target.value.trim())}
          placeholder="输入交易对地址（pairId）"
          className="w-full text-sm px-3 py-2 rounded-lg
                     bg-white/60 dark:bg-slate-700/60
                     border border-white/30 outline-none
                     text-slate-800 dark:text-slate-100"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            className="text-xs px-3 py-1.5 rounded-md border border-white/30 bg-white/30
                       hover:bg-white/50 text-slate-700 dark:text-slate-200"
            onClick={onClose}>
            取消
          </button>
          <button
            disabled={!pairId || maxed}
            className="text-xs px-3 py-1.5 rounded-md bg-slate-900 text-white hover:opacity-90
                       disabled:opacity-40"
            onClick={() => {
              onSubmit(pairId)
              onClose()
            }}>
            确定
          </button>
        </div>
        {maxed && (
          <p className="mt-2 text-[12px] text-amber-600">最多添加 3 个代币。</p>
        )}
      </div>
    </div>
  )
}

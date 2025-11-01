import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"
import React, { useEffect, useState } from "react"

import { FloatingWidget } from "~components/FloatingWidget"
import { getWidgetEnabled, watchWidgetEnabled } from "~lib/storage"

export const config: PlasmoCSConfig = { matches: ["<all_urls>"] }

export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = `${cssText}

@keyframes priceFlashUp {
  0% {
    background-color: rgba(34,197,94,0.75);
    box-shadow: 0 0 0 0 rgba(34,197,94,0.45);
    transform: scale(1.02);
  }
  70% {
    background-color: rgba(34,197,94,0.25);
    box-shadow: 0 0 0 12px rgba(34,197,94,0);
    transform: scale(1.01);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
    transform: scale(1);
  }
}

@keyframes priceFlashDown {
  0% {
    background-color: rgba(239,68,68,0.75);
    box-shadow: 0 0 0 0 rgba(239,68,68,0.45);
    transform: scale(1.02);
  }
  70% {
    background-color: rgba(239,68,68,0.25);
    box-shadow: 0 0 0 12px rgba(239,68,68,0);
    transform: scale(1.01);
  }
  100% {
    background-color: transparent;
    box-shadow: none;
    transform: scale(1);
  }
}

.flash-up { animation: priceFlashUp 1.2s ease-out both; }
.flash-down { animation: priceFlashDown 1.2s ease-out both; }
`
  return style
}

export default function ContentUI() {
  const [enabled, setEnabled] = useState<boolean | null>(null)

  useEffect(() => {
    let alive = true
    getWidgetEnabled().then((value) => {
      if (alive) setEnabled(value)
    })
    const unwatch = watchWidgetEnabled(setEnabled)
    return () => {
      alive = false
      unwatch?.()
    }
  }, [])

  if (enabled === null) return null
  return enabled ? <FloatingWidget /> : null
}

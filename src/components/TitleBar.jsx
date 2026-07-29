import React, { useEffect, useState } from 'react'
import { Cube } from '@phosphor-icons/react'

export default function TitleBar() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI
  const [max, setMax] = useState(false)

  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.isMaximized().then(setMax)
    const off = window.electronAPI.onMaximizedState(setMax)
    return () => { try { off && off() } catch {} }
  }, [])

  return (
    <div className="titlebar h-10 flex items-center select-none bg-bg0 border-b border-line">
      {/* drag region */}
      <div className="flex-1 flex items-center pl-4 pr-2 h-full gap-2.5 min-w-0">
        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
          <Cube size={12} weight="fill" className="text-[#0d070b]" />
        </div>
        <span className="text-[13px] font-black tracking-tight text-fg"><span className="text-accent">X</span>Forge</span>
      </div>

      {/* controls */}
      <div className="no-drag flex h-full">
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="w-12 h-10 flex items-center justify-center text-fgdim hover:bg-bg2 hover:text-fg transition-colors"
          aria-label="Minimize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="1" y="4.5" fill="currentColor" /></svg>
        </button>
        <button
          onClick={() => window.electronAPI?.maximize()}
          className="w-12 h-10 flex items-center justify-center text-fgdim hover:bg-bg2 hover:text-fg transition-colors"
          aria-label="Maximize"
        >
          {max ? (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="2.5" width="6" height="6" fill="none" stroke="currentColor" />
              <rect x="2.5" y="0.5" width="6" height="6" fill="none" stroke="currentColor" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 10 10">
              <rect x="0.5" y="0.5" width="9" height="9" fill="none" stroke="currentColor" />
            </svg>
          )}
        </button>
        <button
          onClick={() => window.electronAPI?.close()}
          className="w-12 h-10 flex items-center justify-center text-fgdim hover:bg-error hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      </div>
    </div>
  )
}
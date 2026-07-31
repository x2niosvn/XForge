import React, { useEffect, useState, useRef } from 'react'
import { Cube, Bell, X, CaretRight, CircleNotch, ArrowSquareOut } from '@phosphor-icons/react'

export default function TitleBar() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI
  const [max, setMax] = useState(false)
  
  // Notification states
  const [releases, setReleases] = useState([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [selectedRelease, setSelectedRelease] = useState(null)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  // Listen to maximize state changes
  useEffect(() => {
    if (!isElectron) return
    window.electronAPI.isMaximized().then(setMax)
    const off = window.electronAPI.onMaximizedState(setMax)
    return () => { try { off && off() } catch {} }
  }, [])

  // Load cached releases and fetch updates
  useEffect(() => {
    // 1. Load from cache
    try {
      const cached = localStorage.getItem('xforge_releases')
      if (cached) {
        const parsed = JSON.parse(cached)
        setReleases(parsed)
        checkUnreadState(parsed)
      }
    } catch {}

    // 2. Fetch fresh releases from Github
    fetchReleases()
  }, [])

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const fetchReleases = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://api.github.com/repos/x2niosvn/XForge/releases')
      if (res.ok) {
        const data = await res.json()
        const formatted = data.map(rel => ({
          id: rel.id,
          tag_name: rel.tag_name,
          name: rel.name || rel.tag_name,
          body: rel.body || '',
          published_at: rel.published_at,
          html_url: rel.html_url
        }))
        setReleases(formatted)
        localStorage.setItem('xforge_releases', JSON.stringify(formatted))
        checkUnreadState(formatted)
      }
    } catch (err) {
      console.warn('Không thể fetch changelog mới từ GitHub:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkUnreadState = (list) => {
    if (!list || list.length === 0) return
    const lastRead = localStorage.getItem('xforge_last_read_release')
    const latestVersion = list[0].tag_name
    if (!lastRead || lastRead !== latestVersion) {
      setHasUnread(true)
    } else {
      setHasUnread(false)
    }
  }

  const handleOpenDropdown = () => {
    setDropdownOpen(!dropdownOpen)
    if (releases.length > 0) {
      const latestVersion = releases[0].tag_name
      localStorage.setItem('xforge_last_read_release', latestVersion)
      setHasUnread(false)
    }
  }

  // Minimal Custom Markdown Renderer
  const renderMarkdown = (text) => {
    if (!text) return <p className="text-xs text-fgfaint">Không có nội dung cập nhật.</p>
    const lines = text.split('\n')
    
    const parseInlineMarkdown = (lineText) => {
      const parts = lineText.split('**')
      return parts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={i} className="font-bold text-fg">{part}</strong>
        }
        const subParts = part.split('`')
        return subParts.map((sub, j) => {
          if (j % 2 === 1) {
            return <code key={j} className="bg-bg3/80 border border-line px-1.5 py-0.5 rounded text-[11px] font-mono text-accent">{sub}</code>
          }
          return sub
        })
      })
    }

    return lines.map((line, idx) => {
      const content = line.trim()
      if (content.startsWith('###')) {
        return <h4 key={idx} className="text-[13px] font-bold text-fg mt-4 mb-1">{content.replace(/^###\s*/, '')}</h4>
      }
      if (content.startsWith('##')) {
        return <h3 key={idx} className="text-sm font-bold text-fg mt-5 mb-1.5 border-b border-line pb-1">{content.replace(/^##\s*/, '')}</h3>
      }
      if (content.startsWith('#')) {
        return <h2 key={idx} className="text-base font-extrabold text-fg mt-6 mb-2">{content.replace(/^#\s*/, '')}</h2>
      }
      if (content.startsWith('-') || content.startsWith('*')) {
        return (
          <li key={idx} className="text-xs text-fgdim ml-4 list-disc my-1.5 leading-relaxed">
            {parseInlineMarkdown(content.replace(/^[-*]\s*/, ''))}
          </li>
        )
      }
      if (content === '') {
        return <div key={idx} className="h-2" />
      }
      return <p key={idx} className="text-xs text-fgdim my-1.5 leading-relaxed">{parseInlineMarkdown(content)}</p>
    })
  }

  return (
    <div className="titlebar h-10 flex items-center select-none bg-bg0 border-b border-line relative z-[9999]">
      {/* drag region */}
      <div className="flex-1 flex items-center pl-4 pr-2 h-full gap-2.5 min-w-0">
        <div className="w-5 h-5 rounded-md bg-accent flex items-center justify-center">
          <Cube size={12} weight="fill" className="text-[#0d070b]" />
        </div>
        <span className="text-[13px] font-black tracking-tight text-fg"><span className="text-accent">X</span>Forge</span>
      </div>

      {/* controls */}
      <div className="no-drag flex h-full items-center relative">
        {/* Notification Bell Button */}
        <div className="relative h-full flex items-center" ref={dropdownRef}>
          <button
            onClick={handleOpenDropdown}
            className="w-10 h-10 flex items-center justify-center text-fgdim hover:bg-bg2 hover:text-accent transition-colors relative"
            title="Thông báo cập nhật"
            aria-label="Changelog"
          >
            <Bell size={15} weight="bold" />
            {hasUnread && (
              <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-accent animate-pulse ring-2 ring-bg0" />
            )}
          </button>

          {/* Dropdown Box */}
          {dropdownOpen && (
            <div 
              className="absolute top-10 right-0 w-80 bg-bg1/95 backdrop-blur-md border border-line rounded-2xl shadow-2xl p-4 z-50 flex flex-col gap-3 transition-all"
              style={{ contentVisibility: 'auto' }}
            >
              <div className="flex items-center justify-between border-b border-line pb-2">
                <span className="text-xs font-bold text-fg uppercase tracking-wider">Thông báo cập nhật</span>
                {loading && <CircleNotch size={12} className="animate-spin text-accent" />}
              </div>

              <div className="max-h-[210px] overflow-y-auto space-y-1.5 custom-scrollbar">
                {releases.length === 0 ? (
                  <div className="text-center py-6 text-xs text-fgfaint">
                    Không có thông báo mới nào
                  </div>
                ) : (
                  releases.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => {
                        setSelectedRelease(rel)
                        setDropdownOpen(false)
                      }}
                      className="group flex flex-col gap-1 p-2.5 rounded-xl hover:bg-bg2/80 border border-transparent hover:border-line cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-fg group-hover:text-accent transition-colors truncate">
                          {rel.name}
                        </span>
                        <span className="text-[9px] font-mono bg-accentsoft/20 text-accent px-1.5 py-0.5 rounded-md shrink-0">
                          {rel.tag_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-fgfaint font-mono">
                        {new Date(rel.published_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Minimize */}
        <button
          onClick={() => window.electronAPI?.minimize()}
          className="w-12 h-10 flex items-center justify-center text-fgdim hover:bg-bg2 hover:text-fg transition-colors"
          aria-label="Minimize"
        >
          <svg width="10" height="10" viewBox="0 0 10 10"><rect width="10" height="1" y="4.5" fill="currentColor" /></svg>
        </button>

        {/* Maximize */}
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

        {/* Close */}
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

      {/* Changelog Detail Modal */}
      {selectedRelease && (
        <div className="fixed inset-0 bg-bg0/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 no-drag">
          <div className="bg-bg1 border border-line rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[80vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-line bg-bg2/40">
              <div>
                <h3 className="text-sm font-bold text-fg flex items-center gap-2">
                  <span>Chi tiết bản cập nhật</span>
                  <span className="text-[10px] font-mono bg-accentsoft/20 text-accent px-1.5 py-0.5 rounded-md">
                    {selectedRelease.tag_name}
                  </span>
                </h3>
                <p className="text-[10px] text-fgfaint font-mono mt-0.5">
                  Phát hành ngày {new Date(selectedRelease.published_at).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedRelease(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-fgfaint hover:text-fg hover:bg-bg2 transition-all"
                title="Đóng"
              >
                <X size={14} weight="bold" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar select-text">
              <h2 className="text-base font-extrabold text-fg mb-4 border-b border-line pb-2">
                {selectedRelease.name}
              </h2>
              <div className="space-y-1">
                {renderMarkdown(selectedRelease.body)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-line bg-bg2/20">
              {isElectron && (
                <button
                  onClick={() => window.electronAPI.openExternal(selectedRelease.html_url)}
                  className="flex items-center gap-1.5 text-xs text-accent hover:text-accent/80 font-bold px-3 py-1.5 rounded-lg border border-accent/20 bg-accentsoft/10 hover:bg-accentsoft/20 transition-all cursor-pointer"
                >
                  <ArrowSquareOut size={12} weight="bold" />
                  Xem trên GitHub
                </button>
              )}
              <button
                onClick={() => setSelectedRelease(null)}
                className="text-xs text-fg hover:text-fg/80 font-bold bg-bg3 hover:bg-bg3/80 px-4 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useAccounts } from '../hooks/useAccounts.jsx'
import { useToast } from '../hooks/useToast.jsx'
import { formatBytes, formatRelative } from '../utils/format.js'
import {
  Play, Stop, Plus, Copy, Trash, CaretDown,
  Stack, GameController, CircleNotch, Check,
} from '@phosphor-icons/react'
import { PageHeader, Card, Button, Badge, ProgressBar } from './ui.jsx'
import LoaderIcon from './LoaderIcon.jsx'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

const LEVEL_STYLES = {
  INFO:  'text-fgdim',
  WARN:  'text-warn',
  ERROR: 'text-error',
  DEBUG: 'text-info',
}

const MAX_LINES = 5000

export default function PlayPage({ profiles, selectedProfileId, onNavigate, reload, onSelectProfile, logs, setLogs, state, setState, startedAtRef }) {
  const { selectedAccount } = useAccounts()
  const toast = useToast()
  const profile = profiles.find((p) => p.id === selectedProfileId) || profiles[0]

  const [filter, setFilter] = useState('ALL')
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const logBoxRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  // Elapsed ticker when running
  useEffect(() => {
    if (state !== 'running') {
      setElapsed(0)
      return
    }
    const t = setInterval(() => {
      if (startedAtRef?.current) setElapsed(Date.now() - startedAtRef.current)
    }, 500)
    return () => clearInterval(t)
  }, [state, startedAtRef])

  useEffect(() => {
    if (autoScroll && logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight
    }
  }, [logs, autoScroll])

  const play = useCallback(async () => {
    if (!profile) { toast.push({ type: 'warn', title: 'Chưa có profile', message: 'Tạo profile trước khi chơi.' }); return }
    if (!selectedAccount) {
      toast.push({ type: 'warn', title: 'Chưa đăng nhập', message: 'Vào Tài khoản để đăng nhập Microsoft.' })
      onNavigate?.('accounts')
      return
    }
    setLogs([])
    // Optimistic: shows the spinner immediately. Main process will
    // overwrite this with 'launching' / 'running' / 'idle' as it works.
    setState('preparing')
    const r = await window.electronAPI.launchProfile(profile.id)
    if (r?.error) {
      setState('idle')
      toast.push({ type: 'error', title: 'Không khởi chạy được', message: r.error, timeout: 6000 })
    }
    // Don't setState('launching') here — the main process emits its own
    // state events and would race with this one, causing the UI to get
    // stuck on "Đang chuẩn bị…" forever.
  }, [profile, selectedAccount, onNavigate, toast, setLogs, setState])

  const kill = useCallback(async () => {
    await window.electronAPI.killGame()
    toast.push({ type: 'info', message: 'Đã gửi tín hiệu dừng Minecraft.' })
  }, [toast])

  const copyLogs = useCallback(async () => {
    const text = logs.map((l) => `[${l.level || 'INFO'}] ${l.raw ?? l.msg}`).join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast.push({ type: 'warn', message: 'Không copy được. Hãy Ctrl+C trực tiếp trong log.' })
    }
  }, [logs, toast])

  const filtered = filter === 'ALL' ? logs : logs.filter((l) => l.level === filter)
  const counts = logs.reduce((acc, l) => {
    acc[l.level] = (acc[l.level] || 0) + 1
    return acc
  }, {})

  const isRunning = state === 'running'
  const isLaunching = state === 'launching' || state === 'preparing'

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader
        eyebrow="Chơi"
        title="Khởi chạy & Logs"
        subtitle="Khởi chạy Minecraft và theo dõi log trực tiếp."
      >
        <ProfileSwitcher
          profiles={profiles}
          current={profile}
          onChange={async (id) => { await onSelectProfile?.(id); reload?.() }}
          onNavigateCreate={() => onNavigate?.('profiles')}
        />
      </PageHeader>

      {/* Play panel */}
      <div className="px-8 pt-6 pb-4">
        <Card className="p-5 flex items-center gap-5">
          <div className="w-12 h-12 rounded-lg bg-bg2 ring-1 ring-line flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile ? (
              profile.importIconUrl ? (
                <img src={profile.importIconUrl} className="w-full h-full object-cover" alt="" />
              ) : (
                <LoaderIcon loader={profile.loader} className="w-full h-full" />
              )
            ) : (
              <GameController size={24} weight="regular" className="text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-fg truncate text-base">{profile ? profile.name : 'Chưa có profile'}</div>
            <div className="text-xs text-fgfaint mt-1 flex items-center gap-2 flex-wrap">
              {profile && (<>
                <Badge tone="accent">{profile.loader}</Badge>
                <span className="font-mono">{profile.gameVersion}</span>
                <span className="text-fgfaint">·</span>
                <span className="flex items-center gap-1"><Stack size={11} /> {formatBytes(profile.sizeBytes)}</span>
                <span className="text-fgfaint">·</span>
                <span>Chơi lần cuối {formatRelative(profile.lastPlayed)}</span>
              </>)}
            </div>
            {isRunning && (
              <div className="mt-2 flex items-center gap-2 text-xs text-accent font-mono tabular-nums">
                <span className="pulse-dot inline-block w-2 h-2 rounded-full bg-accent" />
                Đang chạy · {formatElapsed(elapsed)}
              </div>
            )}
            {isLaunching && (
              <div className="mt-2 flex items-center gap-2 text-xs text-fgdim">
                <CircleNotch size={12} className="animate-spin text-accent" />
                {state === 'preparing' ? 'Đang chuẩn bị tài nguyên…' : 'Đang khởi chạy…'}
              </div>
            )}
          </div>

          {state === 'idle' && (
            <Button
              variant="primary"
              size="lg"
              disabled={!profile || !selectedAccount}
              onClick={play}
            >
              <Play size={16} weight="fill" />
              Chơi
            </Button>
          )}
          {(state === 'preparing' || state === 'launching') && (
            <div className="flex items-center gap-2 text-sm text-fgdim px-4">
              <CircleNotch size={16} className="animate-spin text-accent" />
              Đang chuẩn bị…
            </div>
          )}
          {state === 'running' && (
            <Button variant="danger" size="lg" onClick={kill}>
              <Stop size={14} weight="fill" />
              Đang chạy — Dừng
            </Button>
          )}
        </Card>
      </div>

      {/* Logs */}
      <div className="flex-1 min-h-0 px-8 pb-6 flex flex-col">
        <Card className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-3 py-2 bg-bg2 flex-shrink-0">
            <div className="flex items-center gap-1">
              {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((lv) => (
                <button
                  key={lv}
                  onClick={() => setFilter(lv)}
                  className={[
                    'text-xs px-2.5 py-1 rounded-md font-medium transition-colors',
                    filter === lv ? 'bg-bg3 text-fg' : 'text-fgdim hover:bg-bg3 hover:text-fg',
                  ].join(' ')}
                >
                  {lv}{lv !== 'ALL' && counts[lv] ? ` (${counts[lv]})` : ''}
                </button>
              ))}
              <span className="text-[11px] text-fgfaint ml-2 hidden sm:inline tabular-nums">
                {logs.length} dòng{filtered.length !== logs.length ? `, hiển thị ${filtered.length}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-fgdim cursor-pointer select-none">
                <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="accent-accent" />
                Auto-scroll
              </label>
              <Button variant="subtle" size="sm" onClick={copyLogs} disabled={logs.length === 0}>
                {copied ? <><Check size={12} /> Đã copy</> : <><Copy size={12} /> Copy</>}
              </Button>
              <Button variant="danger-soft" size="sm" onClick={() => setLogs([])} disabled={logs.length === 0}>
                <Trash size={12} />
                Clear
              </Button>
            </div>
          </div>
          <div ref={logBoxRef} className="flex-1 overflow-auto p-3 font-mono-mc text-[12.5px] leading-5 bg-bg0">
            {filtered.length === 0 ? (
              <div className="text-fgfaint text-xs h-full flex items-center justify-center select-none">
                {logs.length === 0 ? 'Chưa có log. Nhấn Chơi để khởi chạy Minecraft.' : 'Không có dòng nào khớp bộ lọc.'}
              </div>
            ) : (
              filtered.map((l) => (
                <div key={l.id} className="flex items-start gap-2 px-1 hover:bg-bg1/50 rounded">
                  <span className="text-fgfaint flex-shrink-0 tabular-nums">{formatTs(l.ts)}</span>
                  <span className={[
                    'flex-shrink-0 w-12 text-right font-bold text-[11px]',
                    LEVEL_STYLES[l.level] || 'text-fgdim',
                  ].join(' ')}>
                    [{l.level || 'INFO'}]
                  </span>
                  <span className={LEVEL_STYLES[l.level] || 'text-fg'}>{l.raw ?? l.msg}</span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

function formatTs(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3,'0')}`
}

function formatElapsed(ms) {
  if (ms < 1000) return '0s'
  const s = Math.floor(ms / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h) return `${h}h ${m}m ${sec}s`
  if (m) return `${m}m ${sec}s`
  return `${sec}s`
}

function ProfileSwitcher({ profiles, current, onChange, onNavigateCreate }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    if (open) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 rounded-md bg-bg2 hover:bg-bg3 ring-1 ring-line text-sm text-fg transition-colors flex items-center gap-2"
      >
        <span className="font-medium">{current ? current.name : 'Chọn profile'}</span>
        <CaretDown size={12} weight="bold" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-bg1 border border-line shadow-2xl z-30 overflow-hidden">
          <div className="max-h-72 overflow-auto">
            {profiles.length === 0 ? (
              <div className="p-4 text-xs text-fgdim">Chưa có profile.</div>
            ) : profiles.map((p) => (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false) }}
                className={[
                  'w-full text-left px-3 py-2 flex items-center gap-2 transition-colors',
                  p.id === current?.id ? 'bg-accentsoft' : 'hover:bg-bg2',
                ].join(' ')}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-fg">{p.name}</div>
                  <div className="text-[11px] text-fgfaint">{p.loader} • {p.gameVersion}</div>
                </div>
                {p.id === current?.id && <Check size={13} className="text-accent" />}
              </button>
            ))}
          </div>
          <button
            onClick={() => { onNavigateCreate(); setOpen(false) }}
            className="w-full text-left px-3 py-2.5 border-t border-line bg-bg0 hover:bg-bg2 text-accent text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={13} weight="bold" />
            Tạo profile mới
          </button>
        </div>
      )}
    </div>
  )
}
import React, { useCallback, useEffect, useState, useRef } from 'react'
import TitleBar from './components/TitleBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import HomePage from './components/HomePage.jsx'
import ProfilesPage from './components/ProfilesPage.jsx'
import AccountsPage from './components/AccountsPage.jsx'
import SettingsPage from './components/SettingsPage.jsx'
import PlayPage from './components/PlayPage.jsx'
import ModsPage from './components/ModsPage.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { AccountsProvider } from './hooks/useAccounts.jsx'
import { ToastProvider, useToast } from './hooks/useToast.jsx'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

function AppInner() {
  const [activePage, setActivePage] = useState('home')
  const [profilesData, setProfilesData] = useState({ profiles: [], selectedProfileId: null })
  const [loading, setLoading] = useState(true)
  const [pageContext, setPageContext] = useState(null)
  // Persist launch logs + state at App level so navigating away/back to
  // the Play tab keeps the running instance, log buffer, and elapsed timer.
  const [playLogs, setPlayLogs] = useState([])
  const [playState, setPlayState] = useState('idle')
  const [runningProfileId, setRunningProfileId] = useState(null)
  const startedAtRef = useRef(null)
  const toast = useToast()

  useEffect(() => {
    if (!isElectron) return
    const offLog = window.electronAPI.onLog((line) => {
      setPlayLogs((prev) => {
        const next = [...prev, { id: prev.length + 1, ts: Date.now(), ...line }]
        return next.length > 5000 ? next.slice(next.length - 5000) : next
      })
    })
    const offState = window.electronAPI.onGameState((s) => {
      setPlayState(s.phase || 'idle')
      setRunningProfileId(s.profileId || null)
      if (s.phase === 'running') startedAtRef.current = startedAtRef.current || Date.now()
      if (s.phase === 'idle')   { startedAtRef.current = null }
    })
    window.electronAPI.getLaunchState?.().then((s) => {
      if (s?.phase) {
        setPlayState(s.phase)
        setRunningProfileId(s.profileId || null)
      }
    }).catch(() => {})
    return () => {
      try { offLog && offLog() } catch {}
      try { offState && offState() } catch {}
    }
  }, [])

  const navigate = useCallback((page, context = null) => {
    setActivePage(page)
    setPageContext(context)
  }, [])

  const reload = useCallback(async () => {
    if (!isElectron) { setLoading(false); return }
    try {
      const r = await window.electronAPI.getProfiles()
      setProfilesData(r || { profiles: [], selectedProfileId: null })
    } catch (ex) {
      toast.push({ type: 'error', title: 'Lỗi tải profiles', message: ex.message })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { reload() }, [reload])

  // When the main process updates a profile (e.g. stamps lastPlayed on
  // game exit), the renderer must re-fetch so the UI shows fresh data.
  useEffect(() => {
    if (!isElectron || !window.electronAPI.onProfilesChanged) return
    const off = window.electronAPI.onProfilesChanged(() => { reload() })
    return off
  }, [reload])

  // Update Discord Rich Presence state on navigation or game exit
  useEffect(() => {
    if (!isElectron) return
    if (playState !== 'running' && playState !== 'launching') {
      window.electronAPI.setDiscordActivity?.(activePage).catch(() => {})
    }
  }, [activePage, playState])

  const onSelectProfile = useCallback(async (id) => {
    const r = await window.electronAPI.selectProfile(id)
    if (r?.error) toast.push({ type: 'error', message: r.error })
    await reload()
  }, [reload, toast])

  const onPlay = useCallback(async (id) => {
    const profileId = id || profilesData.selectedProfileId
    if (!profileId) {
      toast.push({ type: 'warn', message: 'Chọn profile trước khi chơi.' })
      setActivePage('profiles')
      return
    }
    if (id && id !== profilesData.selectedProfileId) {
      await onSelectProfile(id)
    }
    setActivePage('play')
  }, [profilesData, onSelectProfile, toast])

  const render = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center text-white/50">
          <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
          Đang tải…
        </div>
      )
    }
    switch (activePage) {
      case 'home':
        return (
          <HomePage
            profiles={profilesData.profiles}
            selectedProfileId={profilesData.selectedProfileId}
            onPlay={onPlay}
            onNavigate={setActivePage}
          />
        )
      case 'profiles':
        return (
          <ProfilesPage
            profiles={profilesData.profiles}
            selectedProfileId={profilesData.selectedProfileId}
            reload={reload}
            onSelect={onSelectProfile}
            onPlay={onPlay}
            navigate={navigate}
            runningProfileId={runningProfileId}
            playState={playState}
          />
        )
      case 'accounts':
        return <AccountsPage />
      case 'settings':
        return <SettingsPage />
      case 'play':
        return (
          <PlayPage
            profiles={profilesData.profiles}
            selectedProfileId={profilesData.selectedProfileId}
            onNavigate={setActivePage}
            reload={reload}
            onSelectProfile={onSelectProfile}
            logs={playLogs}
            setLogs={setPlayLogs}
            state={playState}
            setState={setPlayState}
            startedAtRef={startedAtRef}
          />
        )
      case 'mods':
        return (
          <ModsPage
            profiles={profilesData.profiles}
            selectedProfileId={pageContext?.profileId || profilesData.selectedProfileId}
            pageContext={pageContext}
            setPageContext={setPageContext}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-bg0 text-white relative overflow-hidden">
      {/* Moving Ambient Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute w-[40vw] h-[40vw] rounded-full bg-rose-400/10 blur-[100px] animate-blob1 top-[-10%] left-[-10%]" />
        <div className="absolute w-[35vw] h-[35vw] rounded-full bg-pink-500/8 blur-[100px] animate-blob2 bottom-[-10%] right-[-10%]" />
        <div className="absolute w-[30vw] h-[30vw] rounded-full bg-fuchsia-400/6 blur-[80px] animate-blob3 top-[40%] left-[50%]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col min-h-0">
        <TitleBar />
        <div className="flex-1 flex min-h-0">
          <Sidebar active={activePage} onChange={(id) => { setActivePage(id); setPageContext(null) }} />
          {render()}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AccountsProvider>
          <AppInner />
        </AccountsProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

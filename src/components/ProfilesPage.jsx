import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useToast } from '../hooks/useToast.jsx'
import { formatBytes, formatRelative } from '../utils/format.js'
import {
  Plus, FolderOpen, Trash, Play, Stop, Check, Stack, Clock, Cpu,
  PuzzlePiece, PencilSimple, DownloadSimple, CircleNotch,
  CaretDown, CaretRight, Gear, Terminal, X, MagnifyingGlass,
  ArrowLeft, ToggleLeft, ToggleRight,
} from '@phosphor-icons/react'
import {
  PageHeader, Card, Button, Badge, Stat, Modal, Field, TextInput, Select,
  EmptyState, ProgressBar,
} from './ui.jsx'
import LoaderIcon from './LoaderIcon.jsx'
import { getVersionImage, getVersionGroups, getMajorVersion } from './versionGroups.js'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

export default function ProfilesPage({ profiles, selectedProfileId, reload, onSelect, onPlay, navigate, runningProfileId, playState, installs = {}, doInstall }) {
  const toast = useToast()
  const [showCreate, setShowCreate] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [editId, setEditId] = useState(null)
  const [managingProfileId, setManagingProfileId] = useState(null)

  const doDelete = async (id) => {
    const r = await window.electronAPI.deleteProfile(id)
    if (r?.error) { toast.push({ type: 'error', title: 'Xoá thất bại', message: r.error }); return }
    toast.push({ type: 'success', message: 'Đã xoá profile.' })
    setDeleteId(null)
    await reload()
  }

  const managingProfile = profiles.find(p => p.id === managingProfileId)

  if (managingProfile) {
    return (
      <ProfileDetailView
        profile={managingProfile}
        onBack={() => setManagingProfileId(null)}
        navigate={navigate}
        onPlay={onPlay}
        reload={reload}
      />
    )
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-shrink-0">
        <PageHeader
          eyebrow="Profiles"
          title="Quản lý Profiles"
          subtitle="Mỗi profile có loader, phiên bản, mods và cài đặt riêng. Hỗ trợ Vanilla, Fabric, Forge."
        >
          <Button variant="primary" onClick={() => setShowCreate(true)}>
            <Plus size={14} weight="bold" />
            Tạo profile
          </Button>
        </PageHeader>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-5 pt-6">
        {profiles.length === 0 ? (
          <EmptyState
            icon={<PuzzlePiece size={24} weight="duotone" />}
            title="Chưa có profile nào"
            desc="Tạo profile Minecraft đầu tiên của bạn. Hỗ trợ Vanilla, Fabric và Forge."
            action={
              <Button variant="primary" size="lg" onClick={() => setShowCreate(true)}>
                <Plus size={16} weight="bold" />
                Tạo profile đầu tiên
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-5xl items-start">
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                isSelected={p.id === selectedProfileId}
                onSelect={async () => {
                  const r = await window.electronAPI.selectProfile(p.id)
                  if (!r?.error) { await reload(); onSelect?.(p.id) }
                }}
                onPlay={() => onPlay(p.id)}
                onEdit={() => setEditId(p.id)}
                onInstall={() => doInstall(p.id)}
                installState={installs[p.id]}
                onOpenFolder={() => window.electronAPI.openProfileFolder(p.id)}
                onDelete={() => setDeleteId(p.id)}
                onManageMods={() => setManagingProfileId(p.id)}
                runningProfileId={runningProfileId}
                playState={playState}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateProfileModal
          onClose={() => setShowCreate(false)}
          onCreated={async (newId) => {
            await reload()
            setShowCreate(false)
            if (newId) doInstall(newId)
          }}
        />
      )}
      {deleteId && (
        <ConfirmDeleteModal
          name={profiles.find((p) => p.id === deleteId)?.name}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => doDelete(deleteId)}
        />
      )}
      {editId && (
        <EditProfileModal
          profile={profiles.find((p) => p.id === editId)}
          onClose={() => setEditId(null)}
          onSaved={async () => { await reload(); setEditId(null) }}
        />
      )}
    </div>
  )
}

const PHASE_LABEL = {
  starting: 'Đang khởi động…',
  manifests: 'Đang tải manifest…',
  libraries: 'Tải thư viện…',
  assets: 'Tải assets…',
  client: 'Tải client.jar…',
  forge: 'Forge installer…',
  fabric: 'Fabric loader…',
  patching: 'Đang patch…',
}

function ProfileCard({ profile, isSelected, onSelect, onPlay, onEdit, onInstall, installState, onOpenFolder, onDelete, onManageMods, runningProfileId, playState }) {
  const isInstalling = !!installState && !profile.installedAt
  const percent = installState?.percent ?? 0
  const phaseLabel = installState ? (installState.label || PHASE_LABEL[installState.phase] || installState.phase) : ''
  const showIndet = installState && (installState.phase === 'starting' || installState.phase === 'manifests') && percent === 0
  const isInstalled = !!profile.installedAt
  const isRunningThis = runningProfileId === profile.id && playState === 'running'
  const isPreparingThis = isSelected && (playState === 'preparing' || playState === 'launching')
  const isBusyThis = isRunningThis || isPreparingThis

  return (
    <Card className={[
      'p-5 transition-colors relative flex flex-col gap-4',
      isSelected ? 'border-accent/60 bg-accentsoft/30' : 'hover:border-linestrong',
    ].join(' ')}>

      {/* ─── 1. Header — icon, name, badges ─────────────────────────── */}
      <div className="flex items-start gap-3">
        <div className={[
          'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ring-1 overflow-hidden',
          isSelected ? 'bg-accentsoft ring-accent/40' : 'bg-bg2 ring-line',
        ].join(' ')}>
          {profile.importIconUrl ? (
            <img src={profile.importIconUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <LoaderIcon loader={profile.loader} className="w-full h-full" />
          )}
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <div className="font-bold text-fg truncate text-[15px]" title={profile.name}>{profile.name}</div>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <Badge tone="accent">{profile.loader}</Badge>
            <Badge mono tone="neutral">{profile.gameVersion}</Badge>
            {profile.loaderVersion && <Badge mono tone="neutral">{profile.loaderVersion}</Badge>}
          </div>
        </div>
      </div>

      {/* ─── 2. Stats grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<Stack size={11} />}  label="Dung lượng" value={formatBytes(profile.sizeBytes)} />
        <Stat icon={<Cpu size={11} />}    label="RAM"        value={`${profile.ramGb || 4} GB`} />
        <Stat icon={<Clock size={11} />}  label="Lần cuối"   value={formatRelative(profile.lastPlayed)} />
      </div>

      {/* ─── 3. Install progress ────────────────────────────────────── */}
      {isInstalling && (
        <div className="rounded-lg bg-bg0 ring-1 ring-line p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs text-fgdim min-w-0 flex-1">
              <CircleNotch size={12} className="animate-spin text-accent shrink-0" />
              <span className="truncate">{phaseLabel}</span>
            </div>
          </div>
          <ProgressBar value={0} indeterminate={true} />
          {installState.total > 0 && (
            <div className="text-[10px] text-fgfaint font-mono tabular-nums mt-1.5">
              {installState.current.toLocaleString()} / {installState.total.toLocaleString()} file
            </div>
          )}
        </div>
      )}

      {/* ─── 4. Actions — 2 rows, color-coded ─────────────────────────
         *   Row 1 — primary intents (Install/Update + Play)
         *           • not installed → success (green)  "Cài đặt"
         *           • installed    → info    (blue)   "Cập nhật"
         *           • Play always   → primary (orange) "Play"
         *   Row 2 — secondary (Select, Edit, Folder, Delete) ────────── */}
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex gap-2">
          {isBusyThis ? (
            <Button
              variant="danger"
              size="md"
              onClick={async (e) => {
                e.stopPropagation()
                await window.electronAPI.killGame?.()
              }}
              title="Dừng game"
              className="w-full"
            >
              <Stop size={13} weight="fill" />
              {isRunningThis ? 'Đang chơi — Dừng' : 'Đang chuẩn bị — Dừng'}
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              disabled={isInstalling}
              onClick={onPlay}
              title="Khởi chạy Minecraft"
              className="w-full"
            >
              <Play size={13} weight="fill" />
              {isInstalling ? 'Đang tự động cài đặt...' : 'Chơi'}
            </Button>
          )}
        </div>

        <div className="flex gap-1.5">
          <Button variant="subtle" size="sm" onClick={onManageMods} title="Quản lý mod" className="flex-1 font-semibold text-accent bg-accentsoft/10 ring-accent/20 hover:bg-accentsoft/25">
            <PuzzlePiece size={14} weight="fill" />
            Mods
          </Button>
          <Button variant="subtle" size="sm" onClick={onEdit} title="Chỉnh sửa" className="px-2.5">
            <PencilSimple size={14} weight="bold" />
          </Button>
          <Button variant="subtle" size="sm" onClick={onOpenFolder} title="Mở thư mục instance" className="px-2.5">
            <FolderOpen size={14} />
          </Button>
          <Button variant="danger-soft" size="sm" onClick={onDelete} title="Xoá profile" className="px-2.5">
            <Trash size={14} />
          </Button>
        </div>
      </div>
    </Card>
  )
}

function ConfirmDeleteModal({ name, onCancel, onConfirm }) {
  return (
    <Modal onClose={onCancel} title="Xoá profile?">
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-errorsoft ring-1 ring-error/30 flex items-center justify-center flex-shrink-0">
          <Trash size={20} className="text-error" />
        </div>
        <p className="text-sm text-fgdim">
          Bạn sắp xoá <span className="font-semibold text-fg">"{name}"</span>. Toàn bộ thư mục instance,
          mods, saves và logs của profile này sẽ bị xoá. Hành động này không thể hoàn tác.
        </p>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="subtle" onClick={onCancel}>Huỷ</Button>
        <Button variant="danger" onClick={onConfirm}>
          <Trash size={13} />
          Xoá
        </Button>
      </div>
    </Modal>
  )
}

/* Collapsible "Tùy chọn nâng cao" — similar to CurseForge's "Show more options".
 * Lets the user attach extra JVM args, pick a release channel, or override
 * the Java executable path. All fields are optional. */
function AdvancedSection({ values, onChange }) {
  const [open, setOpen] = useState(!!(
    (values.jvmArgs && values.jvmArgs.trim()) ||
    values.releaseChannel === 'beta' ||
    (values.javaPath && values.javaPath.trim())
  ))
  const update = (patch) => onChange({ ...values, ...patch })

  return (
    <div className="rounded-lg ring-1 ring-line overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-bg2 hover:bg-bg3 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-xs font-semibold text-fg">
          <Gear size={13} />
          Tùy chọn nâng cao
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-fgdim">
          {!open && (values.jvmArgs || values.releaseChannel === 'beta' || values.javaPath)
            ? <Badge tone="accent">Đã đặt</Badge>
            : <span className="text-fgfaint">không bắt buộc</span>}
          <CaretDown
            size={12}
            className={['transition-transform', open ? 'rotate-180' : ''].join(' ')}
          />
        </span>
      </button>

      {open && (
        <div className="p-3 space-y-3 bg-bg0 border-t border-line">
          <Field
            label="Additional JVM Arguments"
            hint={
              <span className="flex items-start gap-1.5">
                <Terminal size={11} className="mt-0.5 shrink-0" />
                <span>Mỗi dòng là một arg. Hỗ trợ quote, ví dụ: <code className="font-mono text-fgdim">-XX:+UseG1GC</code></span>
              </span>
            }
          >
            <textarea
              value={values.jvmArgs || ''}
              onChange={(e) => update({ jvmArgs: e.target.value })}
              rows={4}
              placeholder={`# Ví dụ:\n-XX:+UseG1GC\n-XX:MaxGCPauseMillis=50\n-Dfile.encoding=UTF-8`}
              className="w-full px-3 py-2 bg-bg1 border border-line rounded-lg focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 text-[12px] font-mono text-fg placeholder:text-fgfaint transition resize-y min-h-[80px]"
              spellCheck={false}
            />
          </Field>

          <Field label="Release Channel">
            <Select value={values.releaseChannel || 'release'} onChange={(e) => update({ releaseChannel: e.target.value })}>
              <option value="release">Release (ổn định)</option>
              <option value="beta">Beta (thử nghiệm)</option>
            </Select>
          </Field>

          <Field
            label="Java Executable (nâng cao)"
            hint={
              <span>Để trống sẽ dùng runtime phù hợp với phiên bản Minecraft. Chỉ định đường dẫn tuyệt đối tới javaw.exe / java.</span>
            }
          >
            <TextInput
              value={values.javaPath || ''}
              onChange={(e) => update({ javaPath: e.target.value })}
              placeholder="C:\Program Files\Java\jdk-17\bin\javaw.exe"
              className="font-mono"
            />
          </Field>
        </div>
      )}
    </div>
  )
}

function EditProfileModal({ profile, onClose, onSaved }) {
  const toast = useToast()
  const [name, setName] = useState(profile?.name || '')
  const [ram, setRam] = useState(profile?.ramGb || 4)
  const [advanced, setAdvanced] = useState({
    jvmArgs:        profile?.jvmArgs        || '',
    releaseChannel: profile?.releaseChannel || 'release',
    javaPath:       profile?.javaPath       || '',
  })
  const [saving, setSaving] = useState(false)

  if (!profile) return null

  const save = async () => {
    setSaving(true)
    const patch = {
      name: name.trim() || profile.name,
      ramGb: ram,
      jvmArgs: advanced.jvmArgs,
      releaseChannel: advanced.releaseChannel,
      javaPath: advanced.javaPath,
    }
    const r = await window.electronAPI.updateProfile(profile.id, patch)
    setSaving(false)
    if (r?.error) { toast.push({ type: 'error', title: 'Lỗi', message: r.error }); return }
    toast.push({ type: 'success', message: 'Đã cập nhật profile.' })
    onSaved()
  }

  return (
    <Modal onClose={onClose} title="Chỉnh sửa profile" wide>
      <div className="space-y-4">
        <Field label="Tên profile">
          <TextInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={profile.name}
          />
        </Field>

        <Field label={`RAM: ${ram} GB`}>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="16"
              value={ram}
              onChange={(e) => setRam(parseInt(e.target.value, 10))}
              className="flex-1 accent-accent"
            />
            <div className="font-mono text-sm text-fg bg-bg2 ring-1 ring-line px-2.5 py-1 rounded-md w-16 text-center tabular-nums">
              {ram} GB
            </div>
          </div>
        </Field>

        <AdvancedSection values={advanced} onChange={setAdvanced} />
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-line">
        <Button variant="subtle" onClick={onClose}>Huỷ</Button>
        <Button variant="primary" loading={saving} onClick={save}>
          {!saving && <Check size={13} weight="bold" />}
          Lưu thay đổi
        </Button>
      </div>
    </Modal>
  )
}

const LOADERS = [
  { id: 'vanilla',  label: 'Vanilla',  desc: 'Minecraft gốc, không mod loader.' },
  { id: 'fabric',   label: 'Fabric',   desc: 'Mod loader nhẹ, hiện đại.' },
  { id: 'forge',    label: 'Forge',    desc: 'Mod loader phổ biến nhất.' },
]

function CreateProfileModal({ onClose, onCreated }) {
  const toast = useToast()
  const [loader, setLoader] = useState('vanilla')
  const [version, setVersion] = useState('')
  const [loaderVersion, setLoaderVersion] = useState('')
  const [name, setName] = useState('')
  const [ram, setRam] = useState(4)
  const [advanced, setAdvanced] = useState({
    jvmArgs: '',
    releaseChannel: 'release',
    javaPath: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [versionGroups, setVersionGroups] = useState({ releaseGroups: [], vanillaGroups: [] })
  const [loadingMc, setLoadingMc] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoadingMc(true)
    getVersionGroups().then((g) => {
      if (cancelled) return
      setVersionGroups(g)
      const first = (g.releaseGroups?.[0]?.versions || [])[0]
      setVersion(first || '')
      setLoadingMc(false)
    }).catch(() => setLoadingMc(false))
    return () => { cancelled = true }
  }, [])

  const loaderLabel = LOADERS.find((l) => l.id === loader)?.label || loader

  const submit = async () => {
    if (!version) { toast.push({ type: 'warn', title: 'Chọn phiên bản', message: 'Vui lòng chọn phiên bản Minecraft.' }); return }
    if ((loader === 'forge' || loader === 'fabric') && !loaderVersion) {
      toast.push({ type: 'warn', title: 'Thiếu phiên bản loader', message: `Vui lòng chọn phiên bản ${loaderLabel}.` }); return
    }
    setSubmitting(true)
    const payload = {
      name: name.trim(),
      loader,
      gameVersion: version,
      ramGb: ram,
      jvmArgs: advanced.jvmArgs,
      releaseChannel: advanced.releaseChannel,
      javaPath: advanced.javaPath,
    }
    if (loader === 'forge' || loader === 'fabric') payload.loaderVersion = loaderVersion
    const r = await window.electronAPI.createProfile(payload)
    setSubmitting(false)
    if (r?.error) { toast.push({ type: 'error', title: 'Lỗi', message: r.error }); return }
    toast.push({ type: 'success', message: `Đã tạo profile ${loaderLabel}.` })
    onCreated(r?.profile?.id)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div
        className="rounded-2xl bg-bg1 ring-1 ring-line shadow-2xl flex flex-col"
        style={{ width: 'min(960px, 96vw)', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-line">
          <div>
            <h2 className="text-base font-bold text-fg">Tạo profile</h2>
            <p className="text-xs mt-0.5 text-fgdim">
              {loaderLabel}{version ? ` · ${version}` : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-fgfaint hover:text-fg hover:bg-bg2 transition-all ml-4"
            title="Đóng"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex">
            {/* Left — form */}
            <div className="flex flex-col gap-5 p-6 border-r border-line" style={{ width: 340 }}>
              {/* Hero preview — MC version image */}
              <div className="rounded-xl overflow-hidden ring-1 ring-line bg-bg0" style={{ height: 120 }}>
                <img
                  src={getVersionImage(version)}
                  alt={version || 'preview'}
                  className="w-full h-full object-cover"
                  draggable={false}
                />
              </div>

              <Field label="Tên profile" hint="Để trống sẽ tự đặt theo loader và phiên bản.">
                <TextInput
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={`${loaderLabel} ${version || '1.21'}`}
                  maxLength={64}
                />
              </Field>

              <Field label="RAM (GB)">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={ram}
                    onChange={(e) => setRam(parseInt(e.target.value, 10))}
                    className="flex-1 accent-accent"
                  />
                  <div className="font-mono text-sm text-fg bg-bg2 ring-1 ring-line px-2.5 py-1 rounded-md w-16 text-center tabular-nums">
                    {ram} GB
                  </div>
                </div>
              </Field>

              <AdvancedSection values={advanced} onChange={setAdvanced} />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-fgfaint font-semibold uppercase tracking-wider">
                  Loader
                </label>
                <div className="flex gap-2">
                  {LOADERS.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLoader(l.id)}
                      className={[
                        'flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl ring-1 transition-all',
                        loader === l.id
                          ? 'bg-accentsoft/60 ring-accent/40 text-fg'
                          : 'bg-bg0 ring-line text-fgdim hover:bg-bg2 hover:text-fg',
                      ].join(' ')}
                      title={l.desc}
                    >
                      <LoaderIcon loader={l.id} className="w-6 h-6" />
                      <span className="text-xs font-semibold">{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right — version picker */}
            <div className="flex-1 min-w-0 overflow-y-auto px-6 py-5">
              {loader === 'vanilla' ? (
                <VanillaVersionAccordion
                  selectedVersion={version}
                  onSelect={(v) => setVersion(v)}
                  groups={versionGroups.vanillaGroups ?? versionGroups.releaseGroups.map((g) => ({ major: g.major, sections: [{ label: 'Release', versions: g.versions }] }))}
                  loading={loadingMc}
                />
              ) : !version ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-bg3 ring-1 ring-line flex items-center justify-center text-[10px] font-bold text-fg">1</div>
                    <p className="text-xs font-semibold text-fgdim">Chọn phiên bản Minecraft</p>
                  </div>
                  <VanillaVersionAccordion
                    selectedVersion={version}
                    onSelect={(v) => setVersion(v)}
                    groups={versionGroups.releaseGroups}
                    loading={loadingMc}
                  />
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => { setVersion(''); setLoaderVersion('') }}
                    className="flex items-center gap-1.5 text-xs text-fgfaint hover:text-fg mb-4 transition-colors"
                  >
                    <CaretRight size={12} weight="bold" className="rotate-180" />
                    Quay lại chọn phiên bản Minecraft
                  </button>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-full bg-accentsoft ring-1 ring-accent/40 flex items-center justify-center text-[10px] font-bold text-accent">2</div>
                    <p className="text-xs font-semibold text-fgdim">Chọn phiên bản {loaderLabel}</p>
                  </div>
                  <LoaderVersionList
                    loader={loader}
                    gameVersion={version}
                    selectedVersion={loaderVersion}
                    onSelect={setLoaderVersion}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-2 px-6 py-4 border-t border-line">
          <Button variant="subtle" onClick={onClose}>Huỷ</Button>
          <Button
            variant="primary"
            loading={submitting}
            disabled={submitting || loadingMc || !version}
            onClick={submit}
            size="lg"
          >
            {!submitting && <Plus size={14} weight="bold" />}
            Tạo profile
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ===== Version accordion / list (VoxelX-style) ======================== */

const TAB_COLORS = {
  'Release':          'bg-accentsoft text-accent ring-accent/40',
  'Pre-release / RC': 'bg-amber-500/15 text-amber-400 ring-amber-500/40',
  'Snapshot':         'bg-sky-500/15 text-sky-400 ring-sky-500/40',
}

function GroupContent({ group, selectedVersion, onSelect }) {
  const sections = group.sections || [{ label: 'Release', versions: group.versions || [] }]
  const [activeTab, setActiveTab] = useState(sections[0]?.label || 'Release')
  const currentTab = sections.find((s) => s.label === activeTab) ? activeTab : sections[0]?.label
  const currentVersions = sections.find((s) => s.label === currentTab)?.versions || []

  return (
    <div className="rounded-xl bg-bg0 ring-1 ring-line overflow-hidden">
      {sections.length > 1 && (
        <div className="flex gap-1.5 px-3 pt-3 pb-2">
          {sections.map((sec) => {
            const isActive = sec.label === currentTab
            const colorClass = TAB_COLORS[sec.label] || 'bg-bg2 text-fg ring-line'
            return (
              <button
                key={sec.label}
                onClick={() => setActiveTab(sec.label)}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold ring-1 transition-all',
                  isActive
                    ? colorClass
                    : 'bg-transparent text-fgfaint ring-transparent hover:text-fgdim',
                ].join(' ')}
              >
                {sec.label}
                <span className={[
                  'text-[9px] font-bold px-1.5 py-0.5 rounded min-w-[18px] text-center tabular-nums',
                  isActive ? 'bg-bg0/30' : 'bg-bg2 text-fgfaint',
                ].join(' ')}>
                  {sec.versions.length > 99 ? '99+' : sec.versions.length}
                </span>
              </button>
            )
          })}
        </div>
      )}
      <div className="px-3 pt-3 pb-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {currentVersions.map((v) => {
          const active = selectedVersion === v
          return (
            <button
              key={v}
              onClick={() => onSelect(v)}
              className={[
                'text-left px-2.5 py-1.5 rounded-lg text-[12px] font-mono tabular-nums transition-colors ring-1',
                active
                  ? 'bg-accentsoft ring-accent/40 text-accent font-bold'
                  : 'bg-bg2 ring-line text-fgdim hover:bg-bg3 hover:text-fg',
              ].join(' ')}
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function VanillaVersionAccordion({ groups, selectedVersion, onSelect, loading }) {
  const [openMajors, setOpenMajors] = useState(() => {
    const first = groups?.find((g) => {
      const v = g.sections?.[0]?.versions || g.versions || []
      return v.length > 0
    })
    return first ? new Set([first.major]) : new Set()
  })

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-fgfaint">
        <CircleNotch size={14} className="animate-spin" />
        Đang tải danh sách phiên bản…
      </div>
    )
  }
  if (!groups || groups.length === 0) {
    return <p className="text-xs text-fgfaint">Không có phiên bản nào.</p>
  }

  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const open = openMajors.has(g.major)
        const flatVersions = (g.sections || [{ label: 'Release', versions: g.versions || [] }])
          .reduce((acc, s) => acc.concat(s.versions || []), [])
        const isCurrent = flatVersions.includes(selectedVersion)
        const majorKey = g.major
        return (
          <div key={g.major} className="rounded-xl bg-bg0 ring-1 ring-line overflow-hidden">
            <button
              type="button"
              onClick={() => {
                setOpenMajors((prev) => {
                  const next = new Set(prev)
                  next.has(g.major) ? next.delete(g.major) : next.add(g.major)
                  return next
                })
              }}
              className={[
                'w-full flex items-center justify-between px-4 py-3 transition-colors',
                isCurrent ? 'bg-accentsoft/40' : 'hover:bg-bg2',
              ].join(' ')}
            >
              <span className="flex items-center gap-3">
                <img
                  src={getVersionImage(majorKey === 'Beta' || majorKey === 'Alpha' ? '' : majorKey)}
                  alt=""
                  className="w-10 h-10 rounded-md object-cover ring-1 ring-line"
                  draggable={false}
                />
                <span className="text-left">
                  <span className="block text-sm font-bold text-fg">
                    Minecraft {majorKey === '26' ? `26.x` : majorKey}
                  </span>
                  <span className="block text-[10px] text-fgfaint mt-0.5">
                    {flatVersions.length} phiên bản
                    {g.sections?.length > 1 ? ` · ${g.sections.length} loại` : ''}
                  </span>
                </span>
              </span>
              <CaretRight
                size={12}
                weight="bold"
                className={['text-fgfaint transition-transform shrink-0', open ? 'rotate-90' : ''].join(' ')}
              />
            </button>
            {open && (
              <div className="border-t border-line">
                <GroupContent group={g} selectedVersion={selectedVersion} onSelect={onSelect} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function LoaderVersionList({ loader, gameVersion, selectedVersion, onSelect }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isElectron || !gameVersion) { setList([]); return }
    setLoading(true)
    setList([])
    window.electronAPI.listLoaderVersions(loader, gameVersion).then((r) => {
      setLoading(false)
      if (r?.ok) setList(r.versions || [])
    }).catch(() => setLoading(false))
  }, [loader, gameVersion])

  useEffect(() => {
    if (list.length > 0 && !selectedVersion) {
      const stable = list.find((v) => v.stable || v.recommended || v.latest)
      onSelect((stable || list[0]).version)
    }
  }, [list])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-fgfaint">
        <CircleNotch size={14} className="animate-spin" />
        Đang tải danh sách {loader}…
      </div>
    )
  }
  if (list.length === 0) {
    return <p className="text-xs text-fgfaint">Không có phiên bản {loader} nào cho Minecraft {gameVersion}.</p>
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {list.map((v) => {
        const active = selectedVersion === v.version
        const tag = v.recommended ? 'Khuyến nghị' : v.latest ? 'Mới nhất' : null
        return (
          <button
            key={v.version}
            onClick={() => onSelect(v.version)}
            className={[
              'text-left px-2.5 py-2 rounded-lg text-[12px] font-mono tabular-nums transition-colors ring-1 flex items-center justify-between gap-2',
              active
                ? 'bg-accentsoft ring-accent/40 text-accent font-bold'
                : 'bg-bg2 ring-line text-fgdim hover:bg-bg3 hover:text-fg',
            ].join(' ')}
          >
            <span className="truncate">{v.version}</span>
            {tag && (
              <span className={[
                'text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0',
                active ? 'bg-bg0/30' : 'bg-bg0 text-fgfaint',
              ].join(' ')}>
                {tag}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function ProfileDetailView({ profile, onBack, navigate, onPlay, reload }) {
  const toast = useToast()
  const [mods, setMods] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [deletingModFile, setDeletingModFile] = useState(null)
  const [expandedMod, setExpandedMod] = useState(null)

  const loadMods = useCallback(async () => {
    if (profile.loader === 'vanilla') return
    setLoading(true)
    try {
      const r = await window.electronAPI.listMods(profile.id)
      setMods(r || [])
    } catch (err) {
      toast.push({ type: 'error', message: 'Không thể tải danh sách mod: ' + err.message })
    } finally {
      setLoading(false)
    }
  }, [profile.id, profile.loader, toast])

  useEffect(() => {
    loadMods()
  }, [loadMods])

  const handleToggle = async (mod) => {
    try {
      const nextVal = !mod.enabled
      const r = await window.electronAPI.toggleMod(profile.id, mod.filename, nextVal)
      if (r?.error) {
        toast.push({ type: 'error', message: r.error })
      } else {
        toast.push({
          type: 'success',
          message: `${nextVal ? 'Đã kích hoạt' : 'Đã vô hiệu hóa'} mod ${mod.name}`
        })
        await loadMods()
      }
    } catch (err) {
      toast.push({ type: 'error', message: err.message })
    }
  }

  const handleDelete = async (filename) => {
    try {
      const r = await window.electronAPI.deleteMod(profile.id, filename)
      if (r?.error) {
        toast.push({ type: 'error', message: r.error })
      } else {
        toast.push({ type: 'success', message: 'Đã xóa mod thành công.' })
        await loadMods()
      }
      setDeletingModFile(null)
    } catch (err) {
      toast.push({ type: 'error', message: err.message })
    }
  }

  const filteredMods = mods.filter(mod => {
    const s = search.toLowerCase()
    return mod.name.toLowerCase().includes(s) || 
           mod.filename.toLowerCase().includes(s) || 
           (mod.description && mod.description.toLowerCase().includes(s))
  })

  const isVanilla = profile.loader === 'vanilla'

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-950">
      {/* Detail Header */}
      <div className="flex-shrink-0 px-8 pt-7 pb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-bg2 border border-line text-fgdim hover:text-fg hover:bg-bg3 transition-colors cursor-pointer"
              title="Quay lại danh sách"
            >
              <ArrowLeft size={16} weight="bold" />
            </button>
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-1">
                Chi tiết Profile
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-[26px] leading-tight font-bold text-fg tracking-tight">{profile.name}</h1>
                <div className="flex items-center gap-1.5">
                  <Badge tone="accent">{profile.loader}</Badge>
                  <Badge mono tone="neutral">{profile.gameVersion}</Badge>
                  {profile.loaderVersion && <Badge mono tone="neutral">{profile.loaderVersion}</Badge>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="md"
              onClick={() => window.electronAPI.openProfileFolder(profile.id)}
              title="Mở thư mục instance"
            >
              <FolderOpen size={14} />
              Thư mục
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => onPlay(profile.id)}
              title="Khởi chạy Minecraft"
            >
              <Play size={14} weight="fill" />
              Chơi ngay
            </Button>
          </div>
        </div>
        <hr className="mt-5 border-0 h-px bg-line" />
      </div>

      {/* Main detail content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-5">
        {isVanilla ? (
          <div className="max-w-3xl py-12">
            <EmptyState
              icon={<PuzzlePiece size={24} weight="duotone" />}
              title="Vanilla Không Hỗ Trợ Mod"
              desc="Profile Vanilla là bản cài Minecraft gốc không hỗ trợ cài đặt mod. Để sử dụng mod, vui lòng tạo profile mới có cài loader Fabric hoặc Forge."
            />
          </div>
        ) : (
          <div className="max-w-5xl flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4">
              <div className="relative w-72">
                <MagnifyingGlass
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-fgfaint pointer-events-none"
                />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm mod trong máy..."
                  className="w-full pl-9 pr-4 py-1.5 text-xs bg-bg2 rounded-lg ring-1 ring-line text-fg placeholder:text-fgfaint focus:outline-none focus:ring-accent/50 transition-colors"
                />
              </div>

              <Button
                variant="success"
                size="sm"
                onClick={() => navigate('mods', {
                  profileId: profile.id,
                  loader: profile.loader,
                  gameVersion: profile.gameVersion,
                  profileName: profile.name
                })}
                title="Tải thêm mod mới"
              >
                <Plus size={12} weight="bold" />
                Tìm thêm mod
              </Button>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-16 text-white/50 text-sm">
                <CircleNotch size={18} className="animate-spin text-accent mr-2" />
                Đang quét thư mục mod…
              </div>
            ) : mods.length === 0 ? (
              <EmptyState
                icon={<PuzzlePiece size={24} />}
                title="Thư mục mod trống"
                desc="Chưa có mod nào trong profile này. Hãy nhấn tìm thêm mod để tải các mod phù hợp với phiên bản này."
                action={
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => navigate('mods', {
                      profileId: profile.id,
                      loader: profile.loader,
                      gameVersion: profile.gameVersion,
                      profileName: profile.name
                    })}
                  >
                    <Plus size={14} weight="bold" />
                    Tải mod đầu tiên
                  </Button>
                }
              />
            ) : filteredMods.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-line rounded-xl bg-bg1/20 text-fgdim text-sm">
                Không tìm thấy mod nào khớp với "{search}"
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="divide-y divide-line">
                  {filteredMods.map((mod) => {
                    const isExpanded = expandedMod === mod.filename
                    return (
                      <div
                        key={mod.filename}
                        className={[
                          'p-4 transition-colors flex flex-col gap-2',
                          mod.enabled ? 'bg-bg1/20' : 'bg-bg0/40 opacity-70'
                        ].join(' ')}
                      >
                        {/* Summary row */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {/* Toggle switch */}
                            <button
                              onClick={() => handleToggle(mod)}
                              className="text-fgfaint hover:text-fg transition-colors shrink-0 cursor-pointer"
                              title={mod.enabled ? 'Tắt mod' : 'Bật mod'}
                            >
                              {mod.enabled ? (
                                <ToggleRight size={24} className="text-success" weight="fill" />
                              ) : (
                                <ToggleLeft size={24} className="text-fgfaint" />
                              )}
                            </button>

                            <div
                              onClick={() => setExpandedMod(isExpanded ? null : mod.filename)}
                              className="cursor-pointer min-w-0 flex-1"
                            >
                              <div className="font-semibold text-[14px] text-fg hover:text-accent transition-colors truncate">
                                {mod.name}
                              </div>
                              <div className="text-[10px] text-fgfaint font-mono truncate mt-0.5" title={mod.filename}>
                                {mod.filename}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Badge tone="neutral" mono>{mod.version}</Badge>
                            <span className="text-[11px] text-fgfaint font-mono">
                              {formatBytes(mod.sizeBytes)}
                            </span>
                            <button
                              onClick={() => setDeletingModFile(mod.filename)}
                              className="p-1.5 rounded bg-bg2 hover:bg-errorsoft hover:text-error text-fgdim transition-colors cursor-pointer"
                              title="Xóa mod"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Description / Detail row */}
                        {isExpanded && (
                          <div className="pl-9 pr-4 py-2 text-[12px] text-fgdim leading-relaxed border-t border-line/30 mt-2 bg-bg0/30 rounded-lg">
                            <div className="font-semibold text-fg mb-1">Mô tả:</div>
                            <p>{mod.description || 'Không có mô tả cho mod này.'}</p>
                            <div className="mt-2 text-[10px] text-fgfaint flex items-center gap-3">
                              <span>Loader: <b className="text-fgdim uppercase">{mod.loader}</b></span>
                              <span>•</span>
                              <span>Ngày cập nhật: <b>{new Date(mod.updatedAt).toLocaleDateString()}</b></span>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {deletingModFile && (
        <Modal onClose={() => setDeletingModFile(null)} title="Xóa Mod?">
          <div className="flex items-start gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-errorsoft ring-1 ring-error/30 flex items-center justify-center flex-shrink-0">
              <Trash size={20} className="text-error" />
            </div>
            <p className="text-sm text-fgdim">
              Bạn có chắc muốn xóa vĩnh viễn mod <span className="font-semibold text-fg">"{deletingModFile}"</span>? Hành động này không thể khôi phục.
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="subtle" onClick={() => setDeletingModFile(null)}>Huỷ</Button>
            <Button variant="danger" onClick={() => handleDelete(deletingModFile)}>
              <Trash size={13} />
              Xoá
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
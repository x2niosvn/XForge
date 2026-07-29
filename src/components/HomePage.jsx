import React from 'react'
import { useAccounts } from '../hooks/useAccounts.jsx'
import { formatBytes, formatRelative } from '../utils/format.js'
import {
  PuzzlePiece, UserCircle, HardDrive, CaretRight,
  Play, GameController, Plus, FolderOpen,
} from '@phosphor-icons/react'
import { PageHeader, Card, Button, Badge, Stat, EmptyState } from './ui.jsx'
import PlayerHead from './PlayerHead.jsx'
import LoaderIcon from './LoaderIcon.jsx'

export default function HomePage({ profiles, selectedProfileId, onPlay, onNavigate }) {
  const { selectedAccount, accounts } = useAccounts()
  const current = profiles.find((p) => p.id === selectedProfileId) || profiles[0]
  const totalSize = profiles.reduce((s, p) => s + (p.sizeBytes || 0), 0)

  return (
    <div className="flex-1 overflow-auto">
      <PageHeader
        eyebrow="Trang chủ"
        title={selectedAccount ? `Chào ${selectedAccount.username}` : 'Xin chào'}
        subtitle="Sẵn sàng quản lý profile và khởi chạy Minecraft."
      />

      <div className="px-8 pt-6 pb-8 max-w-6xl">
        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <Stat icon={<PuzzlePiece size={11} />} label="Profiles" value={profiles.length} />
          <Stat icon={<UserCircle size={11} />}   label="Tài khoản" value={accounts.length} />
          <Stat icon={<HardDrive size={11} />}    label="Tổng dung lượng" value={formatBytes(totalSize)} />
        </div>

        {/* Current profile card */}
        <Card className="p-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-xl bg-bg2 ring-1 ring-line flex items-center justify-center flex-shrink-0 overflow-hidden">
              {current ? (
                current.importIconUrl ? (
                  <img src={current.importIconUrl} className="w-full h-full object-cover" alt="" />
                ) : (
                  <LoaderIcon loader={current.loader} className="w-full h-full" />
                )
              ) : (
                <GameController size={26} weight="regular" className="text-accent" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-fgfaint mb-1 font-medium">
                Profile hiện tại
              </div>
              <h2 className="text-xl font-bold text-fg truncate">
                {current ? current.name : 'Chưa có profile nào'}
              </h2>
              {current ? (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <Badge tone="accent">{current.loader}</Badge>
                  <Badge mono tone="neutral">{current.gameVersion}</Badge>
                  <Badge mono tone="neutral">{current.ramGb || 4} GB RAM</Badge>
                  <Badge mono tone="neutral">{formatBytes(current.sizeBytes)}</Badge>
                  <span className="text-xs text-fgfaint ml-1">
                    · Chơi lần cuối {formatRelative(current.lastPlayed)}
                  </span>
                </div>
              ) : (
                <p className="text-sm text-fgdim mt-2">
                  Tạo profile vanilla đầu tiên để bắt đầu.
                </p>
              )}
            </div>

            {selectedAccount ? (
              <div className="flex items-center gap-2.5 bg-bg2 rounded-xl px-3.5 py-2 ring-1 ring-line">
                <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={36} />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-fgfaint">Đang chơi với</div>
                  <div className="text-sm font-bold text-fg truncate max-w-[120px]">
                    {selectedAccount.username}
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="subtle"
                onClick={() => onNavigate('accounts')}
              >
                <UserCircle size={16} />
                Chưa đăng nhập
              </Button>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-line flex items-center gap-2 flex-wrap">
            <Button
              variant="primary"
              size="lg"
              disabled={!current || !selectedAccount}
              onClick={() => onPlay(current?.id)}
            >
              <Play size={16} weight="fill" />
              Chơi ngay
            </Button>
            <Button variant="ghost" onClick={() => onNavigate('profiles')}>
              Quản lý profiles
              <CaretRight size={14} />
            </Button>
            {profiles.length === 0 && (
              <Button variant="subtle" onClick={() => onNavigate('profiles')}>
                <Plus size={14} weight="bold" />
                Tạo profile đầu tiên
              </Button>
            )}
          </div>
        </Card>

        {/* Quick actions */}
        {profiles.length > 0 && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => current && window.electronAPI.openProfileFolder(current.id)}
              className="text-left rounded-xl bg-bg1 border border-line p-4 hover:bg-bg2 hover:border-linestrong transition-colors flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-bg2 ring-1 ring-line flex items-center justify-center flex-shrink-0 text-fgdim group-hover:text-fg">
                <FolderOpen size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-fg">Mở thư mục instance</div>
                <div className="text-xs text-fgfaint mt-0.5 truncate font-mono">{current ? current.instancePath : '—'}</div>
              </div>
              <CaretRight size={14} className="text-fgfaint self-center" />
            </button>
            <button
              onClick={() => onNavigate('profiles')}
              className="text-left rounded-xl bg-bg1 border border-line p-4 hover:bg-bg2 hover:border-linestrong transition-colors flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-bg2 ring-1 ring-line flex items-center justify-center flex-shrink-0 text-fgdim group-hover:text-fg">
                <Plus size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-fg">Tạo profile mới</div>
                <div className="text-xs text-fgfaint mt-0.5">Vanilla, Fabric hoặc Forge — chọn phiên bản bất kỳ</div>
              </div>
              <CaretRight size={14} className="text-fgfaint self-center" />
            </button>
          </div>
        )}

        {profiles.length === 0 && (
          <div className="mt-5">
            <EmptyState
              icon={<PuzzlePiece size={24} weight="duotone" />}
              title="Chưa có profile nào"
              desc="Tạo profile Minecraft đầu tiên để bắt đầu cài đặt và chơi."
              action={
                <Button variant="primary" size="lg" onClick={() => onNavigate('profiles')}>
                  <Plus size={16} weight="bold" />
                  Tạo profile đầu tiên
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
import React from 'react'
import {
  House, Play, UserCircle, Gear, PuzzlePiece, Cube, Package,
} from '@phosphor-icons/react'

import { useAccounts } from '../hooks/useAccounts.jsx'
import PlayerHead from './PlayerHead.jsx'

const NAV = [
  { id: 'home',     label: 'Trang chủ',   desc: 'Tổng quan',          Icon: House },
  { id: 'play',     label: 'Chơi',        desc: 'Khởi chạy & logs',   Icon: Play },
  { id: 'profiles', label: 'Profiles',    desc: 'Quản lý bản cài',    Icon: PuzzlePiece },
  { id: 'mods',     label: 'Mods',        desc: 'Quản lý mod',        Icon: Package },
  { id: 'accounts', label: 'Tài khoản',   desc: 'Tài khoản & Skin',   Icon: UserCircle },
  { id: 'settings', label: 'Cài đặt',     desc: 'Cấu hình hệ thống',   Icon: Gear },
]

export default function Sidebar({ active, onChange }) {
  const { selectedAccount } = useAccounts()

  return (
    <aside className="w-64 flex-shrink-0 p-4 pr-2 flex flex-col h-full z-20 select-none">
      <div className="flex-1 bg-bg1/60 border border-line rounded-2xl flex flex-col overflow-hidden shadow-2xl backdrop-blur-xl">
        {/* Profile / Account Header */}
        <button
          onClick={() => onChange('accounts')}
          className="h-16 px-4.5 flex items-center gap-3 border-b border-line hover:bg-white/4 transition-all duration-150 text-left w-full group cursor-pointer"
        >
          {selectedAccount ? (
            <>
              <div className="flex-shrink-0 ring-1 ring-accent/30 rounded-lg overflow-hidden group-hover:ring-accent/50 transition-all">
                <PlayerHead uuid={selectedAccount.uuid} username={selectedAccount.username} size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-fg truncate group-hover:text-accent transition-colors leading-none">
                  {selectedAccount.username}
                </div>
                <div className="text-[9px] uppercase tracking-wider text-accent font-extrabold mt-1.5 leading-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  Sẵn sàng chơi
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 rounded-lg bg-bg2 border border-line flex items-center justify-center text-fgdim group-hover:border-accent/40 group-hover:text-accent transition-all shrink-0">
                <UserCircle size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-fgdim group-hover:text-accent transition-colors leading-none">
                  Chưa đăng nhập
                </div>
                <div className="text-[9px] uppercase tracking-wider text-fgfaint font-bold mt-1.5 leading-none">
                  Bấm để kết nối
                </div>
              </div>
            </>
          )}
        </button>

        {/* Nav */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {NAV.map((it) => {
            const isActive = active === it.id
            return (
              <button
                key={it.id}
                onClick={() => onChange(it.id)}
                className={[
                  'group w-full flex items-center gap-3.5 pl-4 pr-3.5 h-12 rounded-xl transition-all text-left relative overflow-hidden',
                  isActive
                    ? 'bg-accentsoft border border-accent/25 text-fg font-bold shadow-[0_4px_12px_rgba(244,114,182,0.06)]'
                    : 'border border-transparent text-fgdim hover:bg-white/4 hover:text-fg',
                ].join(' ')}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[45%] rounded-r bg-accent shadow-[0_0_10px_var(--color-accent)]" />
                )}
                <it.Icon
                  size={18}
                  weight={isActive ? 'fill' : 'regular'}
                  className={isActive ? 'text-accent' : 'text-fgdim group-hover:text-fg transition-colors'}
                />
                <div className="flex-1 min-w-0 leading-normal">
                  <div className="text-xs font-bold leading-tight">{it.label}</div>
                  <div className="text-[10.5px] text-fgfaint truncate mt-1 leading-normal">{it.desc}</div>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-5 border-t border-line bg-bg0/25">
          <div className="text-[10px] text-fgfaint leading-relaxed font-semibold">
            <div className="font-bold text-fgdim mb-0.5">XForge v0.1.4</div>
            Minecraft Client & Profile Manager.
          </div>
        </div>
      </div>
    </aside>
  )
}
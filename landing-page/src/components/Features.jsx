import React from 'react';
import { PaintBrush, Cpu, Folder, PuzzlePiece, User, Terminal } from '@phosphor-icons/react';

const features = [
  {
    icon: <PaintBrush size={32} className="text-[#45f3ff]" weight="duotone" />,
    title: "Giao diện Glassmorphism & Video Nền",
    description: "Thiết kế xuyên thấu mờ sang trọng với video động chạy dưới nền. Có cơ chế tự động đổi video ngẫu nhiên mượt mà."
  },
  {
    icon: <Cpu size={32} className="text-[#00a8ff]" weight="duotone" />,
    title: "Tự động quản lý Java JRE",
    description: "Quét phiên bản Minecraft yêu cầu và tự động tải đúng JRE Mojang tương thích (Java 8, 17, 21, 25) về máy."
  },
  {
    icon: <Folder size={32} className="text-[#bd00ff]" weight="duotone" />,
    title: "Quản lý Profile & Instance độc lập",
    description: "Tạo các bản cài đặt riêng biệt, tự động tải xuống client jar, assets và libraries trực tiếp từ hệ thống Mojang."
  },
  {
    icon: <PuzzlePiece size={32} className="text-[#ff5f56]" weight="duotone" />,
    title: "Tải Mods & Modpacks trực tiếp",
    description: "Tìm kiếm và tải trực tiếp các bản Mod, Resource Pack từ Modrinth và CurseForge về instance cực kỳ nhanh chóng."
  },
  {
    icon: <User size={32} className="text-[#27c93f]" weight="duotone" />,
    title: "Xác thực Microsoft & Skin 3D",
    description: "Đăng nhập tài khoản Microsoft bản quyền hoặc Offline bảo mật. Tích hợp màn hình xem trước Skin 3D tương tác."
  },
  {
    icon: <Terminal size={32} className="text-[#ffbd2e]" weight="duotone" />,
    title: "Discord Rich Presence & Live Logs",
    description: "Hiển thị trạng thái chơi game trực tiếp trên Discord. Tích hợp bộ xem log thời gian thực có lọc màu và tìm kiếm."
  }
];

export default function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Trải nghiệm tối tân, 
            <span className="block mt-2 bg-gradient-to-r from-[#45f3ff] to-[#00a8ff] bg-clip-text text-transparent">
              Đầy đủ mọi tính năng bạn cần
            </span>
          </h2>
          <p className="mt-4 text-slate-400">
            XForge không chỉ đơn thuần là một launcher. Nó là người trợ lý đắc lực đồng hành cùng bạn trong thế giới khối vuông.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx}
              className="glass glass-hover p-8 rounded-2xl flex flex-col items-start"
            >
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-6">
                {feature.icon}
              </div>
              <h3 className="font-display font-semibold text-lg sm:text-xl text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

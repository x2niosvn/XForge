import React from 'react';
import { DownloadSimple, FileZip, Laptop, CheckCircle } from '@phosphor-icons/react';

export default function Download() {
  return (
    <section id="download" className="py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
            Sẵn Sàng Trải Nghiệm 
            <span className="block mt-2 bg-gradient-to-r from-[#45f3ff] to-[#bd00ff] bg-clip-text text-transparent">
              Minecraft Theo Cách Mới?
            </span>
          </h2>
          <p className="mt-4 text-slate-400">
            Tải XForge ngay hôm nay hoàn toàn miễn phí và bắt đầu hành trình sinh tồn của bạn.
          </p>
        </div>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Card 1: Setup Installer */}
          <div className="glass p-8 sm:p-10 rounded-2xl border-white/10 relative flex flex-col justify-between hover:border-[#45f3ff]/40 transition-all duration-300 group">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#45f3ff]/10 border border-[#45f3ff]/20 text-[#45f3ff] text-[10px] font-bold uppercase tracking-wider">
              Khuyên dùng
            </div>
            
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#45f3ff]/10 flex items-center justify-center text-[#45f3ff] mb-6">
                <Laptop size={28} weight="duotone" />
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
                Setup Installer
              </h3>
              <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
                Tự động cài đặt và cấu hình môi trường. Tích hợp sẵn cơ chế tự động cập nhật phiên bản mới nhất khi khởi chạy.
              </p>
              
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#45f3ff]" weight="fill" />
                  Hỗ trợ Windows 10 & 11 (64-bit)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#45f3ff]" weight="fill" />
                  Tự động cập nhật (Auto-updater)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#45f3ff]" weight="fill" />
                  Dung lượng file: ~85 MB
                </li>
              </ul>
            </div>

            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Liên kết tải xuống sẽ khả dụng sau khi bạn hoàn tất build release trong Electron.'); }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-[#45f3ff] to-[#00a8ff] text-[#0b0c10] font-bold hover:shadow-[0_0_25px_rgba(69,243,255,0.4)] transition-all"
            >
              <DownloadSimple size={20} weight="bold" />
              Tải Installer (.exe)
            </a>
          </div>

          {/* Card 2: Portable Version */}
          <div className="glass p-8 sm:p-10 rounded-2xl border-white/10 flex flex-col justify-between hover:border-[#bd00ff]/40 transition-all duration-300 group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#bd00ff]/10 flex items-center justify-center text-[#bd00ff] mb-6">
                <FileZip size={28} weight="duotone" />
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
                Portable Version
              </h3>
              <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
                Giải nén là chạy ngay không cần cài đặt. Phù hợp để lưu trữ trong USB hoặc chạy nhanh trên mọi thiết bị.
              </p>
              
              <ul className="space-y-3 mb-8 text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#bd00ff]" weight="fill" />
                  Không cần quyền Administrator
                  </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#bd00ff]" weight="fill" />
                  Giữ nguyên dữ liệu tại chỗ
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#bd00ff]" weight="fill" />
                  Dung lượng file: ~90 MB
                </li>
              </ul>
            </div>

            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Liên kết tải xuống sẽ khả dụng sau khi bạn hoàn tất build release trong Electron.'); }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl glass border-white/15 text-white font-bold hover:border-[#bd00ff]/40 hover:bg-white/5 transition-all"
            >
              <DownloadSimple size={20} weight="bold" />
              Tải Portable (.zip)
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}

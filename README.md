# 🌟 XForge - Minecraft Client & Profile Manager

<p align="center">
  <img src="src/assets/forge-M5Wm9INk.png" width="120" alt="XForge Logo" />
</p>

<p align="center">
  <strong>XForge</strong> là trình quản lý và khởi chạy Minecraft thế hệ mới được xây dựng trên nền tảng <strong>Electron + React</strong>. Ứng dụng mang lại trải nghiệm tối giản, hiện đại và đậm chất gaming với thiết kế <strong>kính mờ (Glassmorphism)</strong> xuyên thấu kết hợp <strong>hình nền video động (Animated Video Backgrounds)</strong> cực kỳ sống động.
</p>

---

## 📸 Trải nghiệm Giao diện (Screenshots)

<p align="center">
  <img src="IMAGE_LAUCHER/01.png" width="48%" alt="Trang chủ & Khởi chạy" />
  <img src="IMAGE_LAUCHER/02.png" width="48%" alt="Quản lý Profiles" />
</p>
<p align="center">
  <img src="IMAGE_LAUCHER/03.png" width="48%" alt="Khám phá & Tải Mods" />
  <img src="IMAGE_LAUCHER/04.png" width="48%" alt="Quản lý Tài khoản & Skin 3D" />
</p>
<p align="center">
  <img src="IMAGE_LAUCHER/05.png" width="48%" alt="Cài đặt hệ thống & Java" />
  <img src="IMAGE_LAUCHER/06.png" width="48%" alt="Trình quản lý Mod chi tiết" />
</p>

---

## 🚀 Tính năng nổi bật

### 1. 🎬 Hình nền động & Giao diện Kính mờ (Glassmorphism)
* **Video hoạt cảnh động:** Tự động phát video hoạt cảnh Minecraft dưới nền ứng dụng. Hỗ trợ thay đổi linh hoạt giữa 4 video chất lượng cao hoặc tắt/bật dễ dàng trong Cài đặt.
* **Cơ chế Tự động chuyển (Random):** Tự động thay đổi ngẫu nhiên video hình nền mỗi khi mở app hoặc tự động chuyển tiếp sang video tiếp theo khi video hiện tại kết thúc (`onEnded` trigger).
* **Kính mờ xuyên thấu:** Toàn bộ thanh bên (Sidebar), bảng Bộ lọc (Mod Filters) và hộp hiển thị log (Log box) đều được thiết kế dạng kính mờ (`backdrop-blur`) trong suốt, để lộ hoạt cảnh video chạy phía sau một cách vô cùng chuyên nghiệp.

### 2. 📂 Trình quản lý Multi-Profile & Tự động cài đặt Game
* **Quản lý không giới hạn:** Tạo, lựa chọn và xóa các phiên bản game khác nhau một cách dễ dàng.
* **Tự động tải game:** XForge tự động tải trực tiếp client jar, asset index và libraries chính thức từ máy chủ Mojang.
* **Lọc phiên bản & Loader:** Hỗ trợ cài đặt Vanilla, Forge, Fabric, NeoForge và OptiFine.

### 3. ☕ Tự động cài đặt Java Runtime (Mojang Official)
* **Tự động quét & tải:** Phân tích phiên bản Minecraft được chọn và tự động tải đúng phiên bản JRE tương thích (Java 8 cho $\le$ 1.16, Java 17 cho 1.17 - 1.20, Java 21 cho 1.21+).
* **Quản lý JRE:** Cho phép cài đặt thủ công, gỡ bỏ hoặc sao chép nhanh đường dẫn Java ngay trong trang cài đặt.

### 4. 🧭 Khám phá & Quản lý Mod trực tiếp
* **Tích hợp Modrinth & CurseForge:** Tìm kiếm, xem chi tiết và tải trực tiếp Mod, Modpack, Shader, Resource Pack hay Datapack về máy chỉ với một click.
* **Căn lề đối xứng hoàn hảo:** Thiết kế tối ưu hóa không gian hiển thị, gộp thanh tìm kiếm, bộ lọc và số lượng kết quả trùng khớp một cách tinh tế.
* **Quản lý Mods của Profile:** Bật/Tắt (Enable/Disable) hoặc Xóa các tệp Mod đã cài đặt trực tiếp trên giao diện XForge.

### 5. 🔑 Đăng nhập Microsoft OAuth2 & Quản lý Account
* **Tài khoản Online & Offline:** Đăng nhập an toàn qua tài khoản Microsoft (OAuth2 chính thức, tự động refresh token) hoặc tạo nhanh tài khoản Offline.
* **Tùy chỉnh Skin:** Quản lý danh sách skin tùy chỉnh và xem trực tiếp mô hình nhân vật 3D tương tác xoay/lật thời gian thực.

### 6. 🎮 Discord Rich Presence (RPC) & Logs
* **Discord RPC cực ngầu:** Tự động hiển thị trạng thái hoạt động (đang chơi game, đang xem danh sách mod, tên người chơi, modpack đang chạy và thời gian đã chơi) trên Discord cá nhân.
* **Đầu đọc Log thời gian thực:** Phân loại màu sắc rõ ràng (INFO, WARN, ERROR, DEBUG), tự động cuộn (Auto-scroll), tìm kiếm và sao chép toàn bộ log.

---

## 💻 Tech Stack

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Giao diện (Frontend)** | React 19 + Vite 8 + Javascript |
| **Bố cục & Styling** | Vanilla CSS + Tailwind CSS 4 (`@tailwindcss/vite`) |
| **Biểu tượng (Icons)** | `@phosphor-icons/react` |
| **Khung ứng dụng (Core)** | Electron 42 (Frameless window + IPC communication) |
| **Đăng nhập & Xác thực** | MSAL OAuth2 $\rightarrow$ Xbox Live $\rightarrow$ XSTS $\rightarrow$ Minecraft API |
| **Mô phỏng 3D** | Three.js / React Three Fiber (Mô hình nhân vật Minecraft) |

---

## 🛠 Phát triển & Đóng gói (Build)

### 1. Cài đặt các thư viện cần thiết:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development):
Lệnh này sẽ khởi chạy Vite dev server kết hợp Electron hỗ trợ Hot Module Replacement (HMR):
```bash
npm run electron:dev
```

### 3. Biên dịch và Đóng gói (Build Installer):
Đóng gói ứng dụng thành file cài đặt Windows tự động (`Setup.exe`) và bản Portable chạy ngay:

* **Chạy bằng Command Prompt (cmd):**
  ```cmd
  npm run electron:build
  ```
* **Chạy bằng PowerShell:**
  ```powershell
  cmd /c "npm run electron:build"
  ```

Sau khi đóng gói hoàn tất, thư mục `dist-electron/` sẽ xuất hiện:
* `XForge Setup 0.1.3.exe`: Bộ cài đặt Windows (NSIS, tự động nhắc xóa sạch dữ liệu game khi gỡ cài đặt).
* `XForge 0.1.3.exe`: Phiên bản Portable chạy ngay không cần cài đặt.

---

## 🔒 Lưu trữ dữ liệu & Bảo mật

Mọi dữ liệu của XForge được lưu trữ tách biệt hoàn toàn tại `%APPDATA%/XForge/`:
* `profiles.json`: Danh sách các profile game và cấu hình phiên bản.
* `accounts.json`: Lưu trữ thông tin đăng nhập. Các mã thông báo bí mật (access token, refresh token) **không bao giờ** được gửi ra frontend, chỉ được xử lý ở main process của Electron và mã hóa bảo vệ.
* `settings.json`: Lưu trữ tùy chỉnh launcher (RAM, JRE, Discord RPC, hình nền video).
* `instances/`: Thư mục game `.minecraft` tách biệt cho từng profile.
* `runtimes/`: Nơi lưu trữ các bộ Java Runtime cài tự động.

---

## 🤝 Credits & Bản quyền

* Minecraft thuộc bản quyền của **Mojang Studios / Microsoft**. Dự án này là một trình quản lý bên thứ ba và không liên kết với Mojang.
* Luồng xác thực tài khoản Microsoft thích ứng từ tài liệu API Xbox Live công khai.
* Bản quyền dự án: **Private / Unlicensed** — Không tự ý phân phối lại khi chưa có sự đồng ý của tác giả.

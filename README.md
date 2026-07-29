# XForge

> **Minecraft Client & Profile Manager** — Quản lý profile, tài khoản Microsoft, Java auto-install và real-time logs.

## Tech stack

| Layer       | Tech                                                 |
| ----------- | ---------------------------------------------------- |
| UI          | React 19 + Vite 8                                    |
| Styling     | Tailwind CSS 4 (`@tailwindcss/vite`)                 |
| Icons       | `@phosphor-icons/react`                              |
| Desktop     | Electron 42 (frameless window + IPC)                 |
| Microsoft   | MSAL-style OAuth2 → XBL → XSTS → Minecraft token     |
| Minecraft   | Vanilla launcher (client jar + asset index download) |
| Java        | Mojang runtime auto-install (legacy 8 / gamma 17 / delta 21) |

## Cấu trúc thư mục

```
XForge/
├─ electron/
│  ├─ main.cjs                  # Window + IPC registration
│  ├─ preload.cjs               # Context-isolated bridge → window.electronAPI
│  ├─ profileManager.cjs        # Profile CRUD
│  ├─ accountManager.cjs        # Microsoft accounts CRUD
│  ├─ msAuth.cjs                # OAuth2 → XBL → XSTS → MC pipeline
│  └─ launcher/
│     ├─ vanilla/vanillaRunner.cjs   # Asset download, version manifest, game runner
│     └─ java/javaManager.cjs        # Mojang Java runtime install / list / delete
├─ src/
│  ├─ App.jsx, main.jsx, index.css
│  ├─ hooks/   (useAccounts.jsx, useToast.jsx)
│  ├─ utils/   (format.js)
│  └─ components/
│     ├─ TitleBar.jsx, Sidebar.jsx
│     ├─ HomePage.jsx, ProfilesPage.jsx, AccountsPage.jsx
│     ├─ SettingsPage.jsx, PlayPage.jsx
├─ package.json, vite.config.js, index.html
```

## Chức năng đã có (v0.1 — cơ bản)

- ✅ **Multi-Profile** — Tạo / chọn / xoá không giới hạn profile (hiện chỉ vanilla, loader khác sẽ thêm sau)
- ✅ **Microsoft Login (OAuth2)** — Đăng nhập qua cửa sổ modal, lưu refresh token, tự động refresh Minecraft token
- ✅ **Java Auto-Install** — Tự động tải JRE 8 / 17 / 21 từ Mojang runtime khi khởi chạy
- ✅ **Real-Time Logs** — Color-coded INFO / WARN / ERROR / DEBUG, copy, filter, auto-scroll
- ✅ **Discord Rich Presence (RPC)** — Hiển thị trạng thái đang xem tab hoặc đang chơi game (mod/modpack nào, thời gian chơi, tên người chơi) trên Discord. Có tùy chọn bật/tắt trong Cài đặt.
- ✅ **Uninstall Clean Data Option** — Hộp thoại trong trình gỡ cài đặt (NSIS Uninstaller) hỏi người dùng có muốn xóa sạch toàn bộ thư mục dữ liệu game `%APPDATA%/XForge` hay không.
- ✅ **Frameless titlebar** + sidebar + Custom Pink Icon
- ✅ **Toast system** (info / success / warn / error)

## Sẽ thêm

- ⏳ Mod import từ CurseForge & Modrinth (drag-and-drop)
- ⏳ Fabric / Forge / NeoForge loader
- ⏳ Play stats + notifications
- ⏳ Shaders & resource packs

## Phát triển & Đóng gói (Build)

### 1. Cài đặt dependency:
```bash
npm install
```

### 2. Chạy môi trường phát triển (Development):
```bash
npm run electron:dev        # Khởi chạy Vite + Electron với HMR (Hot Module Replacement)
```

### 3. Đóng gói sản phẩm (Build Installer):
Để biên dịch và đóng gói ứng dụng thành file cài đặt Windows (`Setup.exe` và bản `Portable`), sử dụng lệnh sau:

Do chính sách bảo mật PowerShell trên máy của bạn chặn chạy trực tiếp script `npm.ps1`, bạn hãy chạy lệnh đóng gói thông qua Command Prompt (cmd) hoặc dùng hậu tố lệnh đầy đủ:

**Chạy bằng CMD:**
```cmd
npm run electron:build
```

**Hoặc chạy bằng PowerShell:**
```powershell
cmd /c "npm run electron:build"
```

Sau khi chạy xong, kết quả đóng gói sẽ xuất hiện trong thư mục `dist-electron/`:
- `XForge Setup 0.1.0.exe`: Trình cài đặt tự động NSIS (tự hỏi xóa dữ liệu khi Uninstall).
- `XForge 0.1.0.exe`: Bản chạy trực tiếp (Portable).

## Dữ liệu người dùng

Mọi thứ lưu ở `%APPDATA%/XForge/`:

```
profiles.json     — danh sách profile + selectedProfileId
accounts.json     — tài khoản Microsoft (đã strip secrets khi trả về UI)
settings.json     — cài đặt chung (RAM, theme, …)
instances/<id>/   — thư mục riêng của mỗi profile (.minecraft style)
runtimes/         — Mojang Java runtime đã cài
assets/           — asset index + objects (chia sẻ giữa profiles)
libraries/        — libs chung
logs/             — game logs
```

Microsoft access token, refresh token và Minecraft access token **không bao giờ** được gửi lên renderer — chúng chỉ tồn tại trong main process và chỉ ghi vào `accounts.json` (mode 0600).

## Credits

Minecraft is a trademark of Mojang Studios / Microsoft. This project is not affiliated with or endorsed by Mojang.

OAuth2 (XBL → XSTS → Minecraft) flow adapted from publicly documented Microsoft auth endpoints used by all third-party launchers.

## License

Private / unlicensed — do not redistribute.

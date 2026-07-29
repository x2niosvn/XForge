!macro customUnInstall
  MessageBox MB_YESNO|MB_ICONQUESTION "Bạn có muốn xóa toàn bộ dữ liệu cấu hình, profiles và các bản tải Minecraft của XForge khỏi máy tính không?" IDNO +2
  RMDir /r "$APPDATA\XForge"
!macroend

'use strict'

const { contextBridge, ipcRenderer } = require('electron')

const api = {
  // settings
  getSettings:        () => ipcRenderer.invoke('settings:get'),
  setSettings:        (patch) => ipcRenderer.invoke('settings:set', patch),

  // app paths
  getPaths:           () => ipcRenderer.invoke('app:getPaths'),

  // profiles
  getProfiles:        () => ipcRenderer.invoke('profiles:get'),
  createProfile:      (data) => ipcRenderer.invoke('profiles:create', data),
  updateProfile:      (id, patch) => ipcRenderer.invoke('profiles:update', id, patch),
  deleteProfile:      (id) => ipcRenderer.invoke('profiles:delete', id),
  selectProfile:      (id) => ipcRenderer.invoke('profiles:select', id),
  onProfilesChanged:  (cb) => {
    const listener = (_e, payload) => cb(payload)
    ipcRenderer.on('profiles:changed', listener)
    return () => ipcRenderer.removeListener('profiles:changed', listener)
  },
  browseProfilePath:  () => ipcRenderer.invoke('profiles:browse'),
  openProfileFolder:  (id) => ipcRenderer.invoke('profiles:openFolder', id),

  // accounts
  getAccounts:        () => ipcRenderer.invoke('accounts:get'),
  removeAccount:      (id) => ipcRenderer.invoke('accounts:remove', id),
  selectAccount:      (id) => ipcRenderer.invoke('accounts:select', id),
  addAccount:         (account) => ipcRenderer.invoke('accounts:add', account),
  updateAccount:      (id, patch) => ipcRenderer.invoke('accounts:update', { id, patch }),

  // skins
  getSkinPrefs:       (opts) => ipcRenderer.invoke('skin:getPrefs', opts),
  saveSkinPrefs:      (opts) => ipcRenderer.invoke('skin:savePrefs', opts),
  saveSkinLocalFile:  (opts) => ipcRenderer.invoke('skin:saveSkinLocalFile', opts),
  getLocalStatus:     (opts) => ipcRenderer.invoke('skin:getLocalStatus', opts),
  deleteLocalFile:    (opts) => ipcRenderer.invoke('skin:deleteLocalFile', opts),
  uploadSkinToWeb:    (opts) => ipcRenderer.invoke('skin:uploadToWeb', opts),

  // microsoft auth
  loginMicrosoft:     () => ipcRenderer.invoke('ms:login'),
  refreshAccount:     (id) => ipcRenderer.invoke('ms:refresh', id),

  // java
  javaFetchDistros:   () => ipcRenderer.invoke('java:fetchDistros'),
  javaGetInstalled:   () => ipcRenderer.invoke('java:getInstalled'),
  javaInstall:        (pkg) => ipcRenderer.invoke('java:install', pkg),
  javaDelete:         (distro, version) => ipcRenderer.invoke('java:delete', distro, version),
  javaListAvailable:  () => ipcRenderer.invoke('java:listAvailable'),
  javaGetForVersion:  (ver) => ipcRenderer.invoke('java:getForVersion', ver),

  onJavaInstallProgress: (cb) => {
    const listener = (_e, p) => cb(p)
    ipcRenderer.on('java:installProgress', listener)
    return () => ipcRenderer.removeListener('java:installProgress', listener)
  },

  // version list
  listVanillaVersions: () => ipcRenderer.invoke('vanilla:listVersions'),

  // installer hub (multi-loader)
  listLoaderVersions:   (loader, mcVersion) => ipcRenderer.invoke('installer:listLoaderVersions', loader, mcVersion),
  listOptifineVersions: (mcVersion)          => ipcRenderer.invoke('installer:listOptifineVersions', mcVersion),
  prepareInstall:       (profileId)          => ipcRenderer.invoke('installer:prepareInstall', profileId),
  onInstallProgress: (cb) => {
    const listener = (_e, p) => cb(p)
    ipcRenderer.on('install:progress', listener)
    return () => ipcRenderer.removeListener('install:progress', listener)
  },

  // launch
  launchProfile:      (profileId) => ipcRenderer.invoke('launch:start', profileId),
  killGame:           () => ipcRenderer.invoke('launch:kill'),

  onLog: (cb) => {
    const listener = (_e, line) => cb(line)
    ipcRenderer.on('launch:log', listener)
    return () => ipcRenderer.removeListener('launch:log', listener)
  },
  onGameState: (cb) => {
    const listener = (_e, state) => cb(state)
    ipcRenderer.on('launch:state', listener)
    return () => ipcRenderer.removeListener('launch:state', listener)
  },

  // Returns the current launch phase ('idle' | 'preparing' | 'launching'
  // | 'running') so the renderer can re-sync when the window reloads
  // or the user navigates back to Play.
  getLaunchState: () => ipcRenderer.invoke('launch:getState'),

  // window
  minimize:           () => ipcRenderer.invoke('window:minimize'),
  maximize:           () => ipcRenderer.invoke('window:maximize'),
  close:              () => ipcRenderer.invoke('window:close'),
  isMaximized:        () => ipcRenderer.invoke('window:isMaximized'),
  onMaximizedState:   (cb) => {
    const listener = (_e, val) => cb(val)
    ipcRenderer.on('window:maximized-state', listener)
    return () => ipcRenderer.removeListener('window:maximized-state', listener)
  },

  // shell
  openFolder:         (p) => ipcRenderer.invoke('shell:openFolder', p),
  openExternal:       (url) => ipcRenderer.invoke('shell:openExternal', url),

  // mod search (Modrinth, CurseForge)
  modrinthSearch:      (opts) => ipcRenderer.invoke('modrinth:search', opts),
  modrinthProject:     (id) => ipcRenderer.invoke('modrinth:project', id),
  modrinthVersions:    (id, filters) => ipcRenderer.invoke('modrinth:versions', id, filters),
  modrinthGameVersions: () => ipcRenderer.invoke('modrinth:gameVersions'),
  modrinthCategories:   () => ipcRenderer.invoke('modrinth:categories'),
  curseforgeSearch:    (opts) => ipcRenderer.invoke('curseforge:search', opts),
  curseforgeProject:   (id) => ipcRenderer.invoke('curseforge:project', id),
  curseforgeVersions:  (id, filters) => ipcRenderer.invoke('curseforge:versions', id, filters),
  curseforgeCategories: (type) => ipcRenderer.invoke('curseforge:categories', type),

  // install mod
  installMod:          (opts) => ipcRenderer.invoke('mod:install', opts),

  downloadAndImportModpack: (opts) => ipcRenderer.invoke('modpack:downloadAndImport', opts),
  onImportProgress: (cb) => {
    const handler = (_e, data) => cb(data)
    ipcRenderer.on('import:progress', handler)
    return () => ipcRenderer.removeListener('import:progress', handler)
  },

  // local mods management
  listMods:            (profileId) => ipcRenderer.invoke('profiles:listMods', profileId),
  toggleMod:           (profileId, filename, enable) => ipcRenderer.invoke('profiles:toggleMod', profileId, filename, enable),
  deleteMod:           (profileId, filename) => ipcRenderer.invoke('profiles:deleteMod', profileId, filename),

  // discord rpc
  setDiscordActivity:  (page) => ipcRenderer.invoke('discord:setActivity', page),
}

contextBridge.exposeInMainWorld('electronAPI', api)
contextBridge.exposeInMainWorld('isElectron', true)

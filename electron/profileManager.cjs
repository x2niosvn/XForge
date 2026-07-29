'use strict'

const fs = require('fs')
const path = require('path')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readProfiles(file) {
  try {
    if (!fs.existsSync(file)) return { profiles: [], selectedProfileId: null }
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    if (!Array.isArray(data.profiles)) data.profiles = []
    return data
  } catch {
    return { profiles: [], selectedProfileId: null }
  }
}

function writeProfiles(file, data) {
  const tmp = file + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), { mode: 0o600 })
  fs.renameSync(tmp, file)
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function isUuid(id) {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)
}

/**
 * Quick directory size approximation (depth-limited).
 */
function dirSize(dir, depth = 0) {
  if (depth > 4 || !fs.existsSync(dir)) return 0
  try {
    let total = 0
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'natives' || entry.name === 'logs' || entry.name === '.git') continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) total += dirSize(full, depth + 1)
      else {
        try { total += fs.statSync(full).size } catch {}
      }
    }
    return total
  } catch {
    return 0
  }
}

function register({ ipcMain, files, readJson, atomicWriteJson }) {
  const { PROFILES_FILE, INSTANCES_DIR, SETTINGS_FILE } = files

  ipcMain.handle('profiles:get', () => {
    const data = readProfiles(PROFILES_FILE)
    data.profiles = data.profiles.map((p) => ({
      ...p,
      sizeBytes: fs.existsSync(p.instancePath) ? dirSize(p.instancePath) : 0,
    }))
    return data
  })

  ipcMain.handle('profiles:create', (_e, payload) => {
    if (!payload || typeof payload !== 'object') {
      return { error: 'Invalid payload' }
    }
    const loader = payload.loader
    const gameVersion = payload.gameVersion
    // OptiFine H9+ only ships as a Forge mod (no standalone drop-in for
    // modern MC). Hide it from the loader list until Forge+OptiFine flow
    // is wired up; existing profiles keep working for now.
    const SUPPORTED = ['vanilla', 'forge', 'fabric']
    if (!SUPPORTED.includes(loader)) {
      return { error: `Loader "${loader}" chưa được hỗ trợ. Hỗ trợ: ${SUPPORTED.join(', ')}.` }
    }
    if (!gameVersion || typeof gameVersion !== 'string') {
      return { error: 'Vui lòng chọn phiên bản Minecraft' }
    }
    // Loader-specific validation
    if (loader === 'forge' && !payload.loaderVersion) {
      return { error: 'Forge yêu cầu chọn phiên bản loader (loaderVersion).' }
    }
    if (loader === 'fabric' && !payload.loaderVersion) {
      return { error: `${loader} yêu cầu chọn phiên bản loader (loaderVersion).` }
    }
    if (loader === 'optifine' && !payload.optifineVersion) {
      return { error: 'OptiFine yêu cầu chọn phiên bản (optifineVersion, ví dụ HD_U_I7).' }
    }

    const id = generateUUID()
    const now = new Date().toISOString()

    let instancePath = (payload.instancePath || '').trim()
    const isCustomPath = !!instancePath
    if (!isCustomPath) {
      instancePath = path.join(INSTANCES_DIR, id)
    }
    try {
      ensureDir(instancePath)
      // Pre-create expected subdirs so the instance looks "ready"
      ensureDir(path.join(instancePath, 'mods'))
      ensureDir(path.join(instancePath, 'saves'))
      ensureDir(path.join(instancePath, 'logs'))
      ensureDir(path.join(instancePath, 'resourcepacks'))
      ensureDir(path.join(instancePath, 'shaderpacks'))
    } catch (ex) {
      return { error: `Không thể tạo thư mục: ${ex.message}` }
    }

    const loaderLabel = loader.charAt(0).toUpperCase() + loader.slice(1)
    const name = (payload.name && payload.name.trim())
      ? payload.name.trim()
      : `${loaderLabel} ${gameVersion}`

    const settings = readJson(SETTINGS_FILE, { ramGb: 10 })
    const defaultRam = settings?.ramGb || 10

    const profile = {
      id,
      name,
      loader,
      gameVersion,
      loaderVersion:    payload.loaderVersion    || '',
      optifineVersion:  payload.optifineVersion  || '',
      instancePath,
      isCustomPath,
      createdAt: now,
      lastPlayed: null,
      installedAt: null,
      sizeBytes: 0,
      ramGb: payload.ramGb || defaultRam,
      // Advanced settings — optional, defaults applied if missing.
      jvmArgs:        typeof payload.jvmArgs === 'string' ? payload.jvmArgs : '',
      releaseChannel:  payload.releaseChannel === 'beta' ? 'beta' : 'release',
      javaPath:        typeof payload.javaPath === 'string' ? payload.javaPath : '',
    }

    const data = readProfiles(PROFILES_FILE)
    data.profiles.push(profile)
    if (!data.selectedProfileId) data.selectedProfileId = id
    writeProfiles(PROFILES_FILE, data)
    return { ok: true, profile, data }
  })

  ipcMain.handle('profiles:update', (_e, id, patch) => {
    if (!isUuid(id)) return { error: 'ID không hợp lệ' }
    if (!patch || typeof patch !== 'object') return { error: 'Dữ liệu cập nhật không hợp lệ' }
    const data = readProfiles(PROFILES_FILE)
    const profile = data.profiles.find((p) => p.id === id)
    if (!profile) return { error: 'Profile không tồn tại' }

    // Only allow specific keys to be patched
    const allowed = ['name', 'ramGb', 'gameVersion', 'loaderVersion', 'optifineVersion', 'installedAt', 'jvmArgs', 'releaseChannel', 'javaPath', 'lastPlayed']
    for (const k of allowed) {
      if (k in patch) profile[k] = patch[k]
    }
    writeProfiles(PROFILES_FILE, data)
    return { ok: true, profile }
  })

  ipcMain.handle('profiles:delete', (_e, id) => {
    if (!isUuid(id)) return { error: 'ID không hợp lệ' }
    const data = readProfiles(PROFILES_FILE)
    const profile = data.profiles.find((p) => p.id === id)
    if (!profile) return { error: 'Profile không tồn tại' }

    // Don't delete custom-path instances automatically
    if (!profile.isCustomPath) {
      try {
        const normalized = path.resolve(profile.instancePath)
        const root = path.resolve(INSTANCES_DIR)
        if (normalized.startsWith(root) && fs.existsSync(normalized)) {
          fs.rmSync(normalized, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
        }
      } catch {
        try { fs.rmSync(profile.instancePath, { recursive: true, force: true }) } catch {}
      }
    }

    data.profiles = data.profiles.filter((p) => p.id !== id)
    if (data.selectedProfileId === id) {
      data.selectedProfileId = data.profiles[0]?.id ?? null
    }
    writeProfiles(PROFILES_FILE, data)
    return { ok: true, data }
  })

  ipcMain.handle('profiles:select', (_e, id) => {
    if (!isUuid(id)) return { error: 'ID không hợp lệ' }
    const data = readProfiles(PROFILES_FILE)
    if (!data.profiles.find((p) => p.id === id)) return { error: 'Profile không tồn tại' }
    data.selectedProfileId = id
    writeProfiles(PROFILES_FILE, data)
    return { ok: true, data }
  })

  ipcMain.handle('profiles:browse', () => {
    // Defer to main.cjs for dialog access (not directly available here)
    return { ok: true }
  })

  ipcMain.handle('profiles:openFolder', async (_e, id) => {
    if (!isUuid(id)) return { error: 'ID không hợp lệ' }
    const data = readProfiles(PROFILES_FILE)
    const profile = data.profiles.find((p) => p.id === id)
    if (!profile) return { error: 'Profile không tồn tại' }
    const folderPath = profile.instancePath
    if (!fs.existsSync(folderPath)) {
      try { ensureDir(folderPath) } catch {}
    }
    const { shell } = require('electron')
    const err = await shell.openPath(folderPath)
    if (err) return { error: err }
    return { ok: true }
  })
}

module.exports = { register }

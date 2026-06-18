// ── App Configuration ─────────────────────────────────────────
export const APP_CONFIG = {
  name:        import.meta.env.VITE_APP_NAME     || 'SBox System',
  version:     import.meta.env.VITE_APP_VERSION  || '1.0.0',
  apiUrl:      import.meta.env.VITE_API_URL      || '/api',
  socketUrl:   import.meta.env.VITE_SOCKET_URL   || 'http://localhost:5000',
  env:         import.meta.env.VITE_APP_ENV      || 'development',
  supportEmail: 'support@sboxsystem.com',
}

// ── Sidebar config ────────────────────────────────────────────
export const SIDEBAR_WIDTH           = 256
export const SIDEBAR_COLLAPSED_WIDTH = 68
export const HEADER_HEIGHT           = 65

// ── Pagination defaults ───────────────────────────────────────
export const DEFAULT_PAGE_SIZE  = 15
export const PAGE_SIZE_OPTIONS  = [10, 15, 25, 50, 100]

// ── Image limits ──────────────────────────────────────────────
export const MAX_IMAGE_SIZE_MB = 2
export const ACCEPTED_IMAGES   = 'image/jpeg,image/jpg,image/png,image/webp'

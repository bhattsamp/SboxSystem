export const storage = {
  get: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch { return null }
  },
  set: (key: string, value: unknown): void => {
    try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  },
  remove: (key: string): void => {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  },
  clear: (): void => {
    try { localStorage.clear() } catch { /* ignore */ }
  },
}

export const TOKEN_KEY = 'sbox_token'
export const USER_KEY  = 'sbox_user'
export const THEME_KEY = 'sbox_theme'

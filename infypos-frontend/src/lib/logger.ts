const isDev = import.meta.env.DEV

export const logger = {
  log:   (...args: any[]) => { if (isDev) console.log('[SBox System]', ...args) },
  warn:  (...args: any[]) => { if (isDev) console.warn('[SBox System]', ...args) },
  error: (...args: any[]) => { console.error('[SBox System]', ...args) },
  info:  (...args: any[]) => { if (isDev) console.info('[SBox System]', ...args) },
}

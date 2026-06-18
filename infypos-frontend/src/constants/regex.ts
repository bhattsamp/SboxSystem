export const REGEX = {
  EMAIL:    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE:    /^\+?[\d\s\-().]{7,15}$/,
  URL:      /^https?:\/\/.+/,
  SKU:      /^[A-Z0-9\-_]{3,20}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
  BARCODE_EAN13: /^\d{13}$/,
  BARCODE_EAN8:  /^\d{8}$/,
  BARCODE_UPCA:  /^\d{12}$/,
} as const

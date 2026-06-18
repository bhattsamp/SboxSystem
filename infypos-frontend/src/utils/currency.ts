export const formatCurrency = (
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string => {
  if (isNaN(amount)) return '$0.00'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-US').format(n ?? 0)

export const parseCurrency = (str: string): number =>
  parseFloat(str.replace(/[^0-9.-]/g, '')) || 0

import JsBarcode from 'jsbarcode'

export const renderBarcode = (
  el: SVGSVGElement | HTMLCanvasElement,
  value: string,
  options: {
    format?: string
    height?: number
    width?: number
    displayValue?: boolean
    fontSize?: number
    margin?: number
  } = {}
): boolean => {
  if (!value) return false
  try {
    JsBarcode(el, value, {
      format:       options.format || 'CODE128',
      height:       options.height || 40,
      width:        options.width || 1.8,
      displayValue: options.displayValue ?? false,
      fontSize:     options.fontSize || 10,
      margin:       options.margin ?? 4,
      background:   '#ffffff',
      lineColor:    '#000000',
    })
    return true
  } catch {
    return false
  }
}

export const validateBarcodeValue = (value: string, format: string): boolean => {
  if (!value) return false
  const rules: Record<string, RegExp> = {
    EAN13: /^\d{13}$/,
    EAN8:  /^\d{8}$/,
    UPCA:  /^\d{12}$/,
    UPCE:  /^\d{6,8}$/,
    ITF14: /^\d{14}$/,
  }
  return rules[format] ? rules[format].test(value) : true
}

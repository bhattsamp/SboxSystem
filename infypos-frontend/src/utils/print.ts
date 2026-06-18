export const printElement = (elementId: string, title = 'SBox System Print'): void => {
  const el = document.getElementById(elementId)
  if (!el) return
  const win = window.open('', '_blank', 'width=800,height=600')
  if (!win) return
  win.document.write(`
    <html><head>
      <title>${title}</title>
      <style>
        * { box-sizing: border-box; margin: 0; }
        body { font-family: 'Arial', sans-serif; background: white; }
        @media print { .no-print { display: none !important; } }
      </style>
    </head><body>${el.innerHTML}</body></html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print(); win.close() }, 250)
}

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

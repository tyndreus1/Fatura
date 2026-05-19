'use client'
import { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'

interface Props {
  invoiceNumber: string
}

export default function PDFExportButton({ invoiceNumber }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const element = document.getElementById('invoice-preview')
      if (!element) return

      await document.fonts.ready

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ])

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1280,
        onclone: (_doc, clonedEl) => {
          clonedEl.style.width = '794px'
          clonedEl.style.maxWidth = '794px'
          clonedEl.style.minWidth = '794px'
          clonedEl.style.borderRadius = '0'
          clonedEl.style.boxShadow = 'none'
          clonedEl.style.border = 'none'
          clonedEl.style.margin = '0'
        },
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.97)

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pageW = 210
      const pageH = 297
      const marginX = 0
      const marginY = 0
      const contentW = pageW - marginX * 2
      const contentH = (canvas.height / canvas.width) * contentW

      if (contentH <= pageH - marginY * 2) {
        pdf.addImage(imgData, 'JPEG', marginX, marginY, contentW, contentH)
      } else {
        const pageContentH = pageH - marginY * 2
        const scale = canvas.width / contentW
        let srcY = 0
        let remainMm = contentH
        let first = true

        while (remainMm > 0) {
          const sliceMm = Math.min(remainMm, pageContentH)
          const slicePx = Math.round(sliceMm * scale)

          const sliceCanvas = document.createElement('canvas')
          sliceCanvas.width = canvas.width
          sliceCanvas.height = slicePx
          const ctx = sliceCanvas.getContext('2d')!
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height)
          ctx.drawImage(canvas, 0, srcY, canvas.width, slicePx, 0, 0, canvas.width, slicePx)

          if (!first) pdf.addPage()
          pdf.addImage(sliceCanvas.toDataURL('image/jpeg', 0.97), 'JPEG', marginX, marginY, contentW, sliceMm)

          srcY += slicePx
          remainMm -= sliceMm
          first = false
        }
      }

      pdf.save(`${invoiceNumber}.pdf`)
    } catch (err) {
      console.error('PDF hatası:', err)
      alert('PDF oluşturulurken hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleExport} disabled={loading} className="btn-primary">
      {loading
        ? <Loader2 size={15} className="animate-spin" />
        : <FileDown size={15} />}
      {loading ? 'PDF hazırlanıyor...' : 'PDF İndir'}
    </button>
  )
}

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

      // Dynamic page height — content always fits on one page
      const pageW = 210
      const pageH = Math.ceil((canvas.height / canvas.width) * pageW)

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pageW, pageH],
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.97)
      pdf.addImage(imgData, 'JPEG', 0, 0, pageW, pageH)
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

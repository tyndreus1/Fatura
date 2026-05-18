'use client'
import { usePDF } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf-document'
import { FileDown, AlertCircle, Loader2 } from 'lucide-react'
import type { Invoice } from '@/lib/types'

export default function PDFButtonInner({ invoice }: { invoice: Invoice }) {
  const [instance] = usePDF({ document: <InvoicePDF invoice={invoice} /> })

  if (instance.loading) {
    return (
      <button disabled className="btn-primary opacity-60 inline-flex items-center gap-2">
        <Loader2 size={15} className="animate-spin" />
        PDF hazırlanıyor...
      </button>
    )
  }

  if (instance.error || !instance.url) {
    return (
      <button
        title={String(instance.error ?? 'PDF üretilemedi')}
        disabled
        className="inline-flex items-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
      >
        <AlertCircle size={15} />
        PDF hatası
      </button>
    )
  }

  return (
    <a
      href={instance.url}
      download={`${invoice.invoice_number}.pdf`}
      className="btn-primary inline-flex items-center gap-2"
    >
      <FileDown size={15} />
      PDF İndir
    </a>
  )
}

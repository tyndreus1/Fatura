'use client'
import { usePDF } from '@react-pdf/renderer'
import { InvoicePDF } from '@/lib/pdf-document'
import { FileDown } from 'lucide-react'
import type { Invoice } from '@/lib/types'

export default function PDFButtonInner({ invoice }: { invoice: Invoice }) {
  const [instance] = usePDF({ document: <InvoicePDF invoice={invoice} /> })

  if (instance.loading) {
    return (
      <button disabled className="btn-primary opacity-60 inline-flex items-center gap-2">
        <FileDown size={15} />
        PDF hazırlanıyor...
      </button>
    )
  }

  return (
    <a
      href={instance.url ?? '#'}
      download={`${invoice.invoice_number}.pdf`}
      className="btn-primary inline-flex items-center gap-2"
    >
      <FileDown size={15} />
      PDF İndir
    </a>
  )
}

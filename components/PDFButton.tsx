'use client'
import dynamic from 'next/dynamic'
import { FileDown } from 'lucide-react'
import type { Invoice } from '@/lib/types'

const Inner = dynamic(() => import('./PDFButtonInner'), {
  ssr: false,
  loading: () => (
    <button disabled className="btn-primary opacity-60 inline-flex items-center gap-2">
      <FileDown size={15} />
      PDF hazırlanıyor...
    </button>
  ),
})

export default function PDFButton({ invoice }: { invoice: Invoice }) {
  return <Inner invoice={invoice} />
}

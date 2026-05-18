import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getInvoice } from '@/lib/db'
import Navbar from '@/components/Navbar'
import InvoicePreview from '@/components/InvoicePreview'
import DeleteButton from './DeleteButton'
import PrintButton from '@/components/PrintButton'
import { Pencil, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function ViewInvoicePage({ params }: Props) {
  const { id } = await params
  const invoice = getInvoice(Number(id))
  if (!invoice) notFound()

  return (
    <div className="min-h-screen">
      <div className="print:hidden">
        <Navbar />
      </div>
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* Toolbar — gizlenir yazdirmada */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <Link href="/invoices" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="font-mono text-lg font-black text-gray-900">
                {invoice.invoice_number}
              </h1>
              <p className="text-sm text-gray-400">{invoice.customer_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/invoices/${invoice.id}/edit`} className="btn-secondary">
              <Pencil size={15} /> Düzenle
            </Link>
            <PrintButton />
            <DeleteButton id={invoice.id} />
          </div>
        </div>

        {/* Fatura — print modunda tam sayfa */}
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  )
}

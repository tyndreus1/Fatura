import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getInvoice } from '@/lib/db'
import Navbar from '@/components/Navbar'
import InvoicePreview from '@/components/InvoicePreview'
import DeleteButton from './DeleteButton'
import { FileDown, Pencil, ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function ViewInvoicePage({ params }: Props) {
  const { id } = await params
  const invoice = getInvoice(Number(id))
  if (!invoice) notFound()

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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
            <a
              href={`/api/invoices/${invoice.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary"
            >
              <FileDown size={15} /> PDF İndir
            </a>
            <DeleteButton id={invoice.id} />
          </div>
        </div>

        {/* Preview */}
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  )
}

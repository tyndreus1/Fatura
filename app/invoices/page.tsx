import { listInvoices } from '@/lib/db'
import Navbar from '@/components/Navbar'
import InvoiceCard from '@/components/InvoiceCard'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function InvoicesPage() {
  const invoices = listInvoices()

  const proformaCount   = invoices.filter(i => i.invoice_type === 'proforma').length
  const commercialCount = invoices.filter(i => i.invoice_type === 'commercial').length

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Fatura Arşivi</h1>
            <p className="text-sm text-gray-400">
              {invoices.length} fatura &bull; {proformaCount} proforma &bull; {commercialCount} commercial
            </p>
          </div>
          <Link href="/invoices/new" className="btn-primary">
            <Plus size={16} /> Yeni Fatura
          </Link>
        </div>

        {/* List */}
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
            <FileText size={40} className="mb-3 text-gray-300" />
            <p className="text-gray-500 font-medium">Henüz fatura oluşturulmamış</p>
            <Link href="/invoices/new" className="btn-primary mt-4">
              <Plus size={16} /> İlk Faturayı Oluştur
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map(invoice => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

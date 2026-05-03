'use client'
import Link from 'next/link'
import { FileDown, Pencil, Eye } from 'lucide-react'
import type { Invoice } from '@/lib/types'
import { formatNumber, formatDate, calcTotals } from '@/lib/utils'

interface Props {
  invoice: Invoice
}

export default function InvoiceCard({ invoice }: Props) {
  const S = invoice.currency === 'EUR' ? '€' : '$'
  const { grandTotal } = calcTotals(
    invoice.items,
    invoice.shipment_cost,
    invoice.discount,
    invoice.advance_payment
  )

  const typeBadge =
    invoice.invoice_type === 'proforma'
      ? <span className="badge-proforma">Proforma</span>
      : <span className="badge-commercial">Commercial</span>

  const currBadge =
    invoice.currency === 'EUR'
      ? <span className="badge-eur">EUR €</span>
      : <span className="badge-usd">USD $</span>

  return (
    <div className="card flex flex-col gap-3 p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className="font-mono text-sm font-bold text-gray-800">
            {invoice.invoice_number}
          </span>
          {typeBadge}
          {currBadge}
        </div>
        <p className="truncate text-sm font-semibold text-gray-700">{invoice.customer_name}</p>
        <p className="text-xs text-gray-400">{formatDate(invoice.invoice_date)}</p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="text-lg font-black text-brand-600">{S} {formatNumber(grandTotal)}</p>
        <p className="text-xs text-gray-400">{invoice.items.length} kalem</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:ml-4">
        <Link
          href={`/invoices/${invoice.id}`}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Görüntüle"
        >
          <Eye size={16} />
        </Link>
        <Link
          href={`/invoices/${invoice.id}/edit`}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Düzenle"
        >
          <Pencil size={16} />
        </Link>
        <a
          href={`/api/invoices/${invoice.id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg p-2 text-brand-600 hover:bg-brand-50"
          title="PDF İndir"
        >
          <FileDown size={16} />
        </a>
      </div>
    </div>
  )
}

import type { Invoice } from '@/lib/types'
import { BANK_ACCOUNTS } from '@/lib/bank-accounts'
import { formatNumber, formatDate, calcTotals } from '@/lib/utils'

interface Props { invoice: Invoice }

export default function InvoicePreview({ invoice }: Props) {
  const bank = BANK_ACCOUNTS[invoice.bank_account]
  const S = invoice.currency === 'EUR' ? '€' : '$'
  const isProforma = invoice.invoice_type === 'proforma'
  const { subtotal, grandTotal } = calcTotals(
    invoice.items,
    invoice.shipment_cost,
    invoice.discount,
    invoice.advance_payment
  )
  const hasExtras =
    invoice.shipment_cost > 0 || invoice.discount > 0 || invoice.advance_payment > 0

  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden print:shadow-none print:border-0 print:rounded-none">
      {/* ── Header ── */}
      <div className="flex items-start justify-between px-8 pt-8 pb-4">
        {/* Logo */}
        <div>
          <div className="text-2xl font-black tracking-wide text-brand-600">alpress</div>
          <div className="mt-0.5 text-[9px] leading-tight text-gray-400 uppercase tracking-wider">
            Kalıpçılık Danışmanlık<br />Ith. Ihr. San. ve Tic. Ltd. Şti.
          </div>
        </div>
        {/* Title */}
        <div className="text-2xl font-black italic text-brand-600">
          {isProforma ? 'Proforma Invoice' : 'Invoice'}
        </div>
      </div>

      {/* ── Customer + Meta ── */}
      <div className="flex items-start justify-between px-8 py-4">
        <div className="flex-1">
          <p className="mb-1 text-xs font-bold text-gray-800">
            {isProforma ? 'Proforma Invoice To:' : 'Invoice To:'}
          </p>
          <p className="text-sm font-black text-brand-600">{invoice.customer_name}</p>
          {invoice.customer_address && (
            <p className="mt-0.5 whitespace-pre-line text-xs text-gray-600">{invoice.customer_address}</p>
          )}
          {invoice.customer_contact && (
            <p className="text-xs text-gray-500">{invoice.customer_contact}</p>
          )}
        </div>
        <div className="text-right space-y-1">
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-xs font-bold text-gray-700">
              {isProforma ? 'P.Invoice No' : 'Invoice No'}
            </span>
            <span className="text-xs font-black text-brand-600">: {invoice.invoice_number}</span>
          </div>
          <div className="flex items-baseline justify-end gap-2">
            <span className="text-xs font-bold text-gray-700">
              {isProforma ? 'P.Invoice Date' : 'Invoice Date'}
            </span>
            <span className="text-xs font-black text-brand-600">: {formatDate(invoice.invoice_date)}</span>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="px-8">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#1E0A00] text-white text-xs font-bold uppercase tracking-wide">
              <th className="py-2.5 px-3 text-left w-12">QTY</th>
              <th className="py-2.5 px-3 text-left">DESCRIPTION</th>
              <th className="py-2.5 px-3 text-right w-36">UNIT PRICE</th>
              <th className="py-2.5 px-3 text-right w-32">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={item.id || i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                <td className="py-3 px-3 font-bold align-top">{item.qty}</td>
                <td className="py-3 px-3 font-bold align-top whitespace-pre-wrap">{item.description}</td>
                <td className="py-3 px-3 text-right align-top">
                  {S} {formatNumber(item.unitPrice)}
                </td>
                <td className="py-3 px-3 text-right align-top">
                  {S} {formatNumber(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Totals ── */}
      <div className="px-8 pb-6 pt-4">
        <div className="ml-auto max-w-[240px] space-y-1.5">
          {hasExtras && (
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm text-gray-600">
              <span className="font-semibold text-brand-600">Subtotal</span>
              <span className="font-bold text-brand-600">{S} {formatNumber(subtotal)}</span>
            </div>
          )}
          {invoice.shipment_cost > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipment</span>
              <span>{S} {formatNumber(invoice.shipment_cost)}</span>
            </div>
          )}
          {invoice.discount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Discount</span>
              <span>-{S} {formatNumber(invoice.discount)}</span>
            </div>
          )}
          {invoice.advance_payment > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>Advance</span>
              <span>-{S} {formatNumber(invoice.advance_payment)}</span>
            </div>
          )}
          <div className="flex justify-between border-t-2 border-brand-600 pt-2">
            <span className="font-black text-brand-600 text-sm">
              {hasExtras ? 'GRAND TOTAL' : 'TOTAL'}
            </span>
            <span className="text-lg font-black text-brand-600">
              {S} {formatNumber(grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-8 border-t-2 border-brand-600" />

      {/* ── Thank you ── */}
      <div className="px-8 pt-4 pb-2">
        <p className="font-black text-amber-700 text-sm">Thank You For Choosing ALPRESS</p>
      </div>

      {/* ── Footer: Terms + Bank ── */}
      <div className="grid grid-cols-2 gap-4 px-8 pb-6">
        {/* Terms */}
        <div>
          <div className="mb-2 rounded bg-brand-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            Terms & Conditions
          </div>
          <div className="space-y-1 text-[10px]">
            {invoice.payment_term && (
              <div className="flex gap-1">
                <span className="font-bold w-24 shrink-0">Payment Term</span>
                <span className="text-gray-600">: {invoice.payment_term}</span>
              </div>
            )}
            {invoice.shipment_term && (
              <div className="flex gap-1">
                <span className="font-bold w-24 shrink-0">Shipment Term</span>
                <span className="text-gray-600">: {invoice.shipment_term}</span>
              </div>
            )}
            {invoice.delivery_time && (
              <div className="flex gap-1">
                <span className="font-bold w-24 shrink-0">Delivery time</span>
                <span className="text-gray-600">: {invoice.delivery_time}</span>
              </div>
            )}
            {invoice.notes && (
              <p className="mt-1 font-bold text-brand-600">{invoice.notes}</p>
            )}
            <div className="mt-2 text-[9px] text-gray-500 leading-relaxed">
              <p className="font-bold text-gray-700">Adres:</p>
              <p>Seyitnizam Mah. Demirciler Sit. 9. Yol No:26</p>
              <p>Zeytinburnu / Istanbul / TURKEY</p>
              <p>Phone: (90212) 416-6505</p>
              <p className="mt-1 font-bold text-gray-700">COUNTRY OF ORIGIN TURKEY</p>
            </div>
          </div>
        </div>

        {/* Bank */}
        <div>
          <div className="mb-2 rounded bg-brand-600 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white">
            Account Details
          </div>
          <div className="space-y-1 text-[10px]">
            {[
              ['Account Name', bank.accountName],
              ['Bank Name',    bank.bankName],
              ...(bank.branchName ? [['Branch Name', bank.branchName]] : []),
              ['Branch Code',    bank.branchCode],
              ['Swift Code',     bank.swiftCode],
              ['Account Number', bank.accountNumber],
              ['IBAN NO',        bank.iban],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-1">
                <span className="font-bold w-24 shrink-0">{k}</span>
                <span className="text-gray-600">: {v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-8 py-3 text-[10px] text-brand-600 font-medium">
        <span>www.alpress.com.tr</span>
        <span>Whatsapp : +905497121668</span>
        <span>alp@alpress.com.tr</span>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Trash2, ChevronDown, ChevronUp, FileDown, Save, ArrowLeft,
} from 'lucide-react'
import type { Invoice, InvoiceItem, InvoiceType, Currency, BankAccountKey } from '@/lib/types'
import { BANK_ACCOUNTS, getBanksForCurrency, getDefaultBank } from '@/lib/bank-accounts'
import { calcTotals, formatNumber, todayISO, newItemId } from '@/lib/utils'

interface Props {
  existing?: Invoice
  mode: 'create' | 'edit'
}

function emptyItem(): InvoiceItem {
  return { id: newItemId(), description: '', qty: 1, unitPrice: 0, amount: 0 }
}

export default function InvoiceForm({ existing, mode }: Props) {
  const router = useRouter()

  // ── Core state ────────────────────────────────────────────────────
  const [invoiceType, setInvoiceType] = useState<InvoiceType>(existing?.invoice_type ?? 'proforma')
  const [currency, setCurrency]       = useState<Currency>(existing?.currency ?? 'EUR')
  const [bankAccount, setBankAccount] = useState<BankAccountKey>(existing?.bank_account ?? 'akbank_eur')
  const [invoiceNumber, setInvoiceNumber] = useState(existing?.invoice_number ?? '')
  const [invoiceDate, setInvoiceDate]     = useState(existing?.invoice_date ?? todayISO())

  // Customer
  const [customerName,    setCustomerName]    = useState(existing?.customer_name ?? '')
  const [customerAddress, setCustomerAddress] = useState(existing?.customer_address ?? '')
  const [customerContact, setCustomerContact] = useState(existing?.customer_contact ?? '')

  // Items
  const [items, setItems] = useState<InvoiceItem[]>(
    existing?.items?.length ? existing.items : [emptyItem()]
  )

  // Extras
  const [hasShipment,   setHasShipment]   = useState((existing?.shipment_cost ?? 0) > 0)
  const [hasDiscount,   setHasDiscount]   = useState((existing?.discount ?? 0) > 0)
  const [hasAdvance,    setHasAdvance]    = useState((existing?.advance_payment ?? 0) > 0)
  const [shipmentCost,  setShipmentCost]  = useState(existing?.shipment_cost ?? 0)
  const [discount,      setDiscount]      = useState(existing?.discount ?? 0)
  const [advancePayment,setAdvancePayment]= useState(existing?.advance_payment ?? 0)

  // Terms
  const [paymentTerm,  setPaymentTerm]  = useState(existing?.payment_term ?? '')
  const [shipmentTerm, setShipmentTerm] = useState(existing?.shipment_term ?? '')
  const [deliveryTime, setDeliveryTime] = useState(existing?.delivery_time ?? '')
  const [notes,        setNotes]        = useState(existing?.notes ?? '')

  // UI
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')
  const [termsOpen,setTermsOpen]= useState(true)

  // ── Fetch next invoice number on create ───────────────────────────────────────
  useEffect(() => {
    if (mode === 'create') {
      fetch('/api/next-number').then(r => r.json()).then(d => setInvoiceNumber(d.number))
    }
  }, [mode])

  // ── Auto-select bank when currency changes ──────────────────────────────────
  useEffect(() => {
    const current = BANK_ACCOUNTS[bankAccount]
    if (current.currency !== currency) {
      setBankAccount(getDefaultBank(currency))
    }
  }, [currency]) // eslint-disable-line

  // ── Item helpers ──────────────────────────────────────────────────────────────
  const updateItem = useCallback((id: string, field: keyof InvoiceItem, raw: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item
      const updated = { ...item }
      if (field === 'description') {
        updated.description = raw
      } else if (field === 'qty') {
        updated.qty = Math.max(0, Number(raw) || 0)
      } else if (field === 'unitPrice') {
        updated.unitPrice = Math.max(0, Number(raw) || 0)
      }
      updated.amount = Number((updated.qty * updated.unitPrice).toFixed(2))
      return updated
    }))
  }, [])

  const addItem    = () => setItems(prev => [...prev, emptyItem()])
  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id))

  // ── Totals ────────────────────────────────────────────────────────────────────
  const { subtotal, grandTotal } = calcTotals(
    items,
    hasShipment ? shipmentCost : 0,
    hasDiscount ? discount : 0,
    hasAdvance  ? advancePayment : 0
  )
  const hasExtras = (hasShipment && shipmentCost > 0) ||
                    (hasDiscount && discount > 0) ||
                    (hasAdvance  && advancePayment > 0)
  const S = currency === 'EUR' ? '€' : '$'

  // ── Save ────────────────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!customerName.trim()) { setError('Müşteri adı zorunludur.'); return }
    if (!invoiceDate)         { setError('Tarih zorunludur.'); return }
    if (items.some(i => !i.description.trim())) {
      setError('Tüm ürün açıklamaları doldurulmalıdır.')
      return
    }
    setError('')
    setSaving(true)

    const payload = {
      invoice_number:  invoiceNumber,
      invoice_type:    invoiceType,
      currency,
      bank_account:    bankAccount,
      invoice_date:    invoiceDate,
      customer_name:   customerName.trim(),
      customer_address:customerAddress.trim(),
      customer_contact:customerContact.trim(),
      items,
      shipment_cost:   hasShipment ? shipmentCost : 0,
      discount:        hasDiscount ? discount      : 0,
      advance_payment: hasAdvance  ? advancePayment: 0,
      payment_term:    paymentTerm.trim(),
      shipment_term:   shipmentTerm.trim(),
      delivery_time:   deliveryTime.trim(),
      notes:           notes.trim(),
    }

    try {
      let saved: Invoice
      if (mode === 'create') {
        const res = await fetch('/api/invoices', { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
        saved = await res.json()
      } else {
        const res = await fetch(`/api/invoices/${existing!.id}`, { method: 'PUT', body: JSON.stringify(payload), headers: { 'Content-Type': 'application/json' } })
        saved = await res.json()
      }
      router.push(`/invoices/${saved.id}`)
    } catch {
      setError('Kayıt sırasında hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  // ── UI helpers ──────────────────────────────────────────────────────────────
  const typeBtn = (t: InvoiceType, label: string) => (
    <button
      type="button"
      onClick={() => setInvoiceType(t)}
      className={`flex-1 rounded-xl border-2 py-4 px-3 text-sm font-bold transition-all duration-200 ${
        invoiceType === t
          ? 'border-brand-600 bg-brand-600 text-white shadow-md'
          : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {label}
    </button>
  )

  const currBtn = (c: Currency, icon: string) => (
    <button
      type="button"
      onClick={() => setCurrency(c)}
      className={`flex-1 rounded-xl border-2 py-3 px-4 text-base font-bold transition-all duration-200 ${
        currency === c
          ? 'border-brand-600 bg-brand-600 text-white shadow-md'
          : 'border-gray-200 bg-white text-gray-600 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {icon} {c}
    </button>
  )

  const label = (text: string, required = false) => (
    <label className="mb-1 block text-xs font-semibold text-gray-600">
      {text}{required && <span className="ml-0.5 text-brand-600">*</span>}
    </label>
  )

  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 pt-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.back()} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Yeni Fatura Oluştur' : 'Faturasını Düzenle'}
          </h1>
          {invoiceNumber && <p className="text-sm text-gray-400">{invoiceNumber}</p>}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">

        {/* ── Step 1: Type + Currency ── */}
        <div className="card p-5">
          <p className="section-title">Fatura Tipi</p>
          <div className="mb-4 flex gap-3">
            {typeBtn('proforma', '📋 Proforma Invoice')}
            {typeBtn('commercial', '🧾 Commercial Invoice')}
          </div>

          <p className="section-title">Para Birimi</p>
          <div className="flex gap-3">
            {currBtn('EUR', '€')}
            {currBtn('USD', '$')}
          </div>
        </div>

        {/* ── Step 2: Invoice No + Date ── */}
        <div className="card p-5">
          <p className="section-title">Fatura Bilgileri</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              {label('Fatura Numarası')}
              <input
                className="input-base font-mono"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="ALP20260001"
              />
            </div>
            <div>
              {label('Tarih', true)}
              <input
                type="date"
                className="input-base"
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Step 3: Customer ── */}
        <div className="card p-5">
          <p className="section-title">Müşteri Bilgileri</p>
          <div className="space-y-3">
            <div>
              {label('Firma / Kişi Adı', true)}
              <input
                className="input-base"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="EMERALD JEWEL INDUSTRY INDIA LIMITED"
              />
            </div>
            <div>
              {label('Adres')}
              <textarea
                className="input-base resize-none"
                rows={3}
                value={customerAddress}
                onChange={e => setCustomerAddress(e.target.value)}
                placeholder="300, Rakkı Palayam, Coimbatore – 641 031 (INDIA)"
              />
            </div>
            <div>
              {label('İletişim / Diğer')}
              <input
                className="input-base"
                value={customerContact}
                onChange={e => setCustomerContact(e.target.value)}
                placeholder="TEL: +91 … | email@example.com"
              />
            </div>
          </div>
        </div>

        {/* ── Step 4: Products ── */}
        <div className="card overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-800 px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-300">Ürünler</p>
          </div>

          {/* Table header (desktop) */}
          <div className="hidden grid-cols-[2fr_1fr_1fr_auto] gap-3 border-b border-gray-100 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-500 sm:grid">
            <span>Açıklama</span>
            <span className="text-right">Adet</span>
            <span className="text-right">Birim Fiyat ({S})</span>
            <span className="w-8" />
          </div>

          <div className="divide-y divide-gray-50 px-5 py-2">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-1 gap-2 py-3 sm:grid-cols-[2fr_80px_120px_auto] sm:items-center sm:gap-3">
                {/* Description */}
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-400 sm:hidden">Ürün #{idx + 1}</span>
                  <input
                    className="input-base"
                    placeholder="Ürün adı / açıklama"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                  />
                </div>

                {/* Qty */}
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-400 sm:hidden">Adet</span>
                  <input
                    type="number"
                    min={0}
                    className="input-base text-right"
                    value={item.qty || ''}
                    onChange={e => updateItem(item.id, 'qty', e.target.value)}
                  />
                </div>

                {/* Unit price */}
                <div>
                  <span className="mb-1 block text-xs font-medium text-gray-400 sm:hidden">
                    Birim Fiyat ({S})
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="input-base text-right"
                    value={item.unitPrice || ''}
                    onChange={e => updateItem(item.id, 'unitPrice', e.target.value)}
                  />
                </div>

                {/* Amount + remove */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {S} {formatNumber(item.amount)}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add row */}
          <div className="border-t border-gray-100 px-5 py-3">
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 transition-all hover:border-brand-300 hover:text-brand-600 w-full justify-center"
            >
              <Plus size={15} /> Ürün Ekle
            </button>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
            <div className="ml-auto max-w-xs space-y-2">
              {hasExtras && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ara Toplam</span>
                  <span className="font-medium">{S} {formatNumber(subtotal)}</span>
                </div>
              )}
              {hasShipment && shipmentCost > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Kargo</span>
                  <span className="font-medium">+ {S} {formatNumber(shipmentCost)}</span>
                </div>
              )}
              {hasDiscount && discount > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>İndirim</span>
                  <span className="font-medium text-red-600">- {S} {formatNumber(discount)}</span>
                </div>
              )}
              {hasAdvance && advancePayment > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Avans</span>
                  <span className="font-medium text-red-600">- {S} {formatNumber(advancePayment)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-200 pt-2">
                <span className="font-bold text-gray-900">{hasExtras ? 'GRAND TOTAL' : 'TOTAL'}</span>
                <span className="text-lg font-black text-brand-600">{S} {formatNumber(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 5: Extras ── */}
        <div className="card p-5">
          <p className="section-title">Ek Tutarlar</p>
          <div className="space-y-4">

            {/* Shipment */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                  checked={hasShipment}
                  onChange={e => setHasShipment(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Kargo ücreti var mı?</span>
              </label>
              {hasShipment && (
                <div className="mt-2 ml-7">
                  <input
                    type="number" min={0} step="0.01"
                    className="input-base max-w-[180px] text-right"
                    placeholder="0.00"
                    value={shipmentCost || ''}
                    onChange={e => setShipmentCost(Number(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* Discount */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                  checked={hasDiscount}
                  onChange={e => setHasDiscount(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">İndirim var mı?</span>
              </label>
              {hasDiscount && (
                <div className="mt-2 ml-7">
                  <input
                    type="number" min={0} step="0.01"
                    className="input-base max-w-[180px] text-right"
                    placeholder="0.00"
                    value={discount || ''}
                    onChange={e => setDiscount(Number(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>

            {/* Advance */}
            <div>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 accent-brand-600"
                  checked={hasAdvance}
                  onChange={e => setHasAdvance(e.target.checked)}
                />
                <span className="text-sm font-medium text-gray-700">Avans ödeme var mı?</span>
              </label>
              {hasAdvance && (
                <div className="mt-2 ml-7">
                  <input
                    type="number" min={0} step="0.01"
                    className="input-base max-w-[180px] text-right"
                    placeholder="0.00"
                    value={advancePayment || ''}
                    onChange={e => setAdvancePayment(Number(e.target.value) || 0)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Step 6: Terms ── */}
        <div className="card overflow-hidden">
          <button
            type="button"
            onClick={() => setTermsOpen(v => !v)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <p className="section-title mb-0">Koşullar & Banka</p>
            {termsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {termsOpen && (
            <div className="border-t border-gray-100 px-5 pb-5 pt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  {label('Ödeme Koşulu')}
                  <input
                    className="input-base"
                    placeholder="%100 advance"
                    value={paymentTerm}
                    onChange={e => setPaymentTerm(e.target.value)}
                  />
                </div>
                <div>
                  {label('Teslimat Koşulu')}
                  <input
                    className="input-base"
                    placeholder="EXW ISTANBUL"
                    value={shipmentTerm}
                    onChange={e => setShipmentTerm(e.target.value)}
                  />
                </div>
                <div>
                  {label('Teslim Süresi')}
                  <input
                    className="input-base"
                    placeholder="from stock after full payment"
                    value={deliveryTime}
                    onChange={e => setDeliveryTime(e.target.value)}
                  />
                </div>
                <div>
                  {label('Notlar (PDF\'de kırmızı görünür)')}
                  <input
                    className="input-base"
                    placeholder="Transportation is not included."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Bank selection */}
              <div>
                {label('Banka Hesabı')}
                <div className="space-y-2">
                  {getBanksForCurrency(currency).map(key => {
                    const b = BANK_ACCOUNTS[key]
                    return (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all ${
                          bankAccount === key
                            ? 'border-brand-600 bg-brand-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="bank"
                          className="mt-0.5 accent-brand-600"
                          checked={bankAccount === key}
                          onChange={() => setBankAccount(key)}
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{b.label}</p>
                          <p className="text-xs text-gray-500">IBAN: {b.iban}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
          >
            <Save size={16} />
            {saving ? 'Kaydediliyor…' : 'Kaydet & Görüntüle'}
          </button>
        </div>

      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { listInvoices, createInvoice, consumeNextNumber } from '@/lib/db'
import type { InvoiceFormData } from '@/lib/types'

export function GET() {
  const invoices = listInvoices()
  return NextResponse.json(invoices)
}

export async function POST(req: NextRequest) {
  const body = await req.json()

  const invoiceNumber = body.invoice_number || consumeNextNumber()

  const data: InvoiceFormData = {
    invoice_number: invoiceNumber,
    invoice_type: body.invoice_type || 'proforma',
    currency: body.currency || 'EUR',
    bank_account: body.bank_account || 'akbank_eur',
    invoice_date: body.invoice_date,
    customer_name: body.customer_name || '',
    customer_address: body.customer_address || '',
    customer_contact: body.customer_contact || '',
    items: body.items || [],
    shipment_cost: Number(body.shipment_cost) || 0,
    discount: Number(body.discount) || 0,
    advance_payment: Number(body.advance_payment) || 0,
    payment_term: body.payment_term || '',
    shipment_term: body.shipment_term || '',
    delivery_time: body.delivery_time || '',
    notes: body.notes || '',
  }

  const invoice = createInvoice(data)
  return NextResponse.json(invoice, { status: 201 })
}

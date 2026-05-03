import { NextRequest, NextResponse } from 'next/server'
import { getInvoice, updateInvoice, deleteInvoice } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params
  const invoice = getInvoice(Number(id))
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const invoice = updateInvoice(Number(id), {
    ...body,
    shipment_cost: Number(body.shipment_cost) || 0,
    discount: Number(body.discount) || 0,
    advance_payment: Number(body.advance_payment) || 0,
  })
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(invoice)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  const ok = deleteInvoice(Number(id))
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

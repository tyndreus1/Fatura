import { NextRequest, NextResponse } from 'next/server'
import { updateCustomer, deleteCustomer } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const customer = updateCustomer(Number(id), body)
  if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(customer)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  const ok = deleteCustomer(Number(id))
  return NextResponse.json({ ok })
}

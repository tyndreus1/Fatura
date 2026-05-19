import { NextRequest, NextResponse } from 'next/server'
import { getProduct, updateProduct, deleteProduct } from '@/lib/db'

interface Params { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params
  const p = getProduct(Number(id))
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params
  const body = await req.json()
  const p = updateProduct(Number(id), {
    name: body.name,
    description: body.description,
    unit_price: Number(body.unit_price) || 0,
  })
  if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(p)
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params
  return NextResponse.json({ ok: deleteProduct(Number(id)) })
}

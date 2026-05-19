import { NextRequest, NextResponse } from 'next/server'
import { listProducts, createProduct } from '@/lib/db'

export function GET() {
  return NextResponse.json(listProducts())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const product = createProduct({
    name: body.name,
    description: body.description ?? '',
    unit_price: Number(body.unit_price) || 0,
  })
  return NextResponse.json(product, { status: 201 })
}

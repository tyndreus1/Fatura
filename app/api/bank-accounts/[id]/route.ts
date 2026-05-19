import { NextRequest, NextResponse } from 'next/server'
import { updateBankAccount, deleteBankAccount } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await request.json()
  const updated = updateBankAccount(Number(id), data)
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(updated)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteBankAccount(Number(id))
  return ok ? NextResponse.json({ ok: true }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}

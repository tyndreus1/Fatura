import { NextRequest, NextResponse } from 'next/server'
import { listBankAccounts, createBankAccount } from '@/lib/db'

export async function GET() {
  return NextResponse.json(listBankAccounts())
}

export async function POST(request: NextRequest) {
  const data = await request.json()
  if (!data.key || !data.label) return NextResponse.json({ error: 'key and label are required' }, { status: 400 })
  try {
    const bank = createBankAccount({
      key: data.key, label: data.label, currency: data.currency ?? 'EUR',
      account_name: data.account_name ?? '', bank_name: data.bank_name ?? '',
      branch_name: data.branch_name ?? '', branch_code: data.branch_code ?? '',
      swift_code: data.swift_code ?? '', account_number: data.account_number ?? '',
      iban: data.iban ?? '', sort_order: data.sort_order ?? 0,
    })
    return NextResponse.json(bank, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Key already exists' }, { status: 409 })
  }
}

import { NextResponse } from 'next/server'
import { listCustomers } from '@/lib/db'

export function GET() {
  const customers = listCustomers()
  return NextResponse.json(customers)
}

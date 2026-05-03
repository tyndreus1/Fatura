import { NextResponse } from 'next/server'
import { peekNextNumber } from '@/lib/db'

export function GET() {
  const number = peekNextNumber()
  return NextResponse.json({ number })
}

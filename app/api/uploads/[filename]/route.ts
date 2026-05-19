import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
const MIME: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png', gif: 'image/gif', webp: 'image/webp',
}

interface Params { params: Promise<{ filename: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { filename } = await params
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Forbidden', { status: 403 })
  }
  const filePath = path.join(DATA_DIR, 'uploads', filename)
  if (!fs.existsSync(filePath)) return new NextResponse('Not found', { status: 404 })
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const buffer = fs.readFileSync(filePath)
  return new NextResponse(buffer, {
    headers: { 'Content-Type': MIME[ext] ?? 'application/octet-stream', 'Cache-Control': 'public, max-age=86400' },
  })
}

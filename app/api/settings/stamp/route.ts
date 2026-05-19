import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { getSetting, setSetting } from '@/lib/db'

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')
const ALLOWED = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])
const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp',
}

export async function GET() {
  const filename = getSetting('stamp_filename')
  if (!filename) return new NextResponse(null, { status: 404 })
  const filepath = path.join(UPLOADS_DIR, filename)
  if (!fs.existsSync(filepath)) return new NextResponse(null, { status: 404 })
  const data = fs.readFileSync(filepath)
  const ext = path.extname(filename).toLowerCase().slice(1)
  return new NextResponse(data, {
    headers: {
      'Content-Type': MIME[ext] ?? 'image/png',
      'Cache-Control': 'public, max-age=300',
    },
  })
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })
  const ext = (file.name.split('.').pop() ?? '').toLowerCase()
  if (!ALLOWED.has(ext)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })
  const old = getSetting('stamp_filename')
  if (old) {
    const oldPath = path.join(UPLOADS_DIR, old)
    if (fs.existsSync(oldPath)) try { fs.unlinkSync(oldPath) } catch {}
  }
  const filename = `company-stamp-${Date.now()}.${ext}`
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(await file.arrayBuffer()))
  setSetting('stamp_filename', filename)
  return NextResponse.json({ url: '/api/settings/stamp' })
}

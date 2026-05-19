import { NextRequest, NextResponse } from 'next/server'
import { setProductImage } from '@/lib/db'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')
const ALLOWED = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp'])

interface Params { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params
  const form = await req.formData()
  const file = form.get('image') as File | null
  if (!file || !file.size) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  if (!ALLOWED.has(ext)) return NextResponse.json({ error: 'Invalid type' }, { status: 400 })

  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true })

  const filename = `product-${id}-${Date.now()}.${ext}`
  fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(await file.arrayBuffer()))

  const product = setProductImage(Number(id), filename)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(product)
}

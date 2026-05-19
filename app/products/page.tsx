'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, Save, X, Package, Plus, Upload } from 'lucide-react'
import type { Product } from '@/lib/types'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(d => { setProducts(d); setLoading(false) })
  }, [])

  function startEdit(p: Product) {
    setEditId(p.id)
    setEditName(p.name)
    setEditDesc(p.description)
    setEditPrice(p.unit_price > 0 ? String(p.unit_price) : '')
    setShowCreate(false)
  }

  async function saveEdit() {
    if (!editId || !editName.trim()) return
    const res = await fetch(`/api/products/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim(), description: editDesc.trim(), unit_price: Number(editPrice) || 0 }),
    })
    const updated = await res.json()
    setProducts(prev => prev.map(p => p.id === editId ? updated : p))
    setEditId(null)
  }

  async function handleImageUpload(productId: number, file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('image', file)
    const res = await fetch(`/api/products/${productId}/image`, { method: 'POST', body: fd })
    const updated = await res.json()
    setProducts(prev => prev.map(p => p.id === productId ? updated : p))
    setUploading(false)
  }

  async function handleDelete(id: number) {
    if (!confirm('Bu ürünü silmek istiyor musunuz?')) return
    await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setProducts(prev => prev.filter(p => p.id !== id))
    if (editId === id) setEditId(null)
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), description: newDesc.trim(), unit_price: Number(newPrice) || 0 }),
    })
    const created: Product = await res.json()
    setProducts(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    setNewName(''); setNewDesc(''); setNewPrice('')
    setShowCreate(false)
    startEdit(created)
  }

  const lbl = (t: string) => <label className="mb-1 block text-xs font-semibold text-gray-600">{t}</label>

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Link href="/" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
        <Package size={20} className="text-brand-600" />
        <h1 className="text-xl font-bold text-gray-900">Ürün Listesi</h1>
        <span className="text-sm text-gray-400">{products.length} ürün</span>
        <button onClick={() => { setShowCreate(v => !v); setEditId(null) }} className="btn-primary ml-auto text-sm">
          <Plus size={14} /> Yeni Ürün
        </button>
      </div>

      {showCreate && (
        <div className="card mb-5 p-5">
          <p className="section-title">Yeni Ürün Ekle</p>
          <div className="space-y-3">
            <div>{lbl('Ürün Adı *')}<input className="input-base" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ürün adı" /></div>
            <div>{lbl('Açıklama')}<textarea className="input-base resize-none" rows={2} value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Ürün açıklaması..." /></div>
            <div>{lbl('Birim Fiyat')}<input type="number" min={0} step="0.01" className="input-base max-w-[180px] text-right" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.00" /></div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleCreate} disabled={!newName.trim()} className="btn-primary py-1.5 text-sm"><Plus size={14} /> Ekle (resim sonra)</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary py-1.5 text-sm"><X size={14} /> İptal</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-gray-400">Yükleniyor...</div>
      ) : products.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Package size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Henüz ürün kaydı yok.</p>
          <p className="mt-1 text-sm">&quot;Yeni Ürün&quot; butonuyla ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p.id} className="card p-4">
              {editId === p.id ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border-2 border-gray-200 bg-gray-50">
                      {p.image_url
                        ? <img src={`/api/uploads/${p.image_url}`} alt={p.name} className="h-full w-full object-cover" />
                        : <div className="flex h-full items-center justify-center text-gray-300"><Package size={32} /></div>
                      }
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-600">Resim</p>
                      <label className={`flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 ${uploading ? 'opacity-50' : ''}`}>
                        <Upload size={14} />
                        {uploading ? 'Yükleniyor...' : p.image_url ? 'Resmi Değiştir' : 'Resim Yükle'}
                        <input type="file" accept="image/*" className="hidden" disabled={uploading}
                          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(p.id, f) }} />
                      </label>
                      <p className="text-xs text-gray-400">JPG, PNG, WEBP &mdash; maks 4 MB</p>
                    </div>
                  </div>
                  <div>{lbl('Ürün Adı')}<input className="input-base font-bold" value={editName} onChange={e => setEditName(e.target.value)} /></div>
                  <div>{lbl('Açıklama')}<textarea className="input-base resize-none" rows={2} value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
                  <div>{lbl('Birim Fiyat')}<input type="number" min={0} step="0.01" className="input-base max-w-[180px] text-right" value={editPrice} onChange={e => setEditPrice(e.target.value)} /></div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} className="btn-primary py-1.5 text-sm"><Save size={14} /> Kaydet</button>
                    <button onClick={() => setEditId(null)} className="btn-secondary py-1.5 text-sm"><X size={14} /> İptal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {p.image_url
                      ? <img src={`/api/uploads/${p.image_url}`} alt={p.name} className="h-full w-full object-cover" />
                      : <div className="flex h-full items-center justify-center text-gray-200"><Package size={22} /></div>
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">{p.name}</p>
                    {p.description && <p className="mt-0.5 text-sm text-gray-500">{p.description}</p>}
                    {p.unit_price > 0 && (
                      <p className="mt-1 text-sm font-semibold text-brand-600">
                        {p.unit_price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => startEdit(p)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-600" title="Düzenle"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500" title="Sil"><Trash2 size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

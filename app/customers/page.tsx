'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit2, Trash2, Save, X, Users } from 'lucide-react'
import type { Customer } from '@/lib/types'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [editContact, setEditContact] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/customers')
      .then(r => r.json())
      .then(data => { setCustomers(data); setLoading(false) })
  }, [])

  function startEdit(c: Customer) {
    setEditId(c.id)
    setEditName(c.name)
    setEditAddress(c.address)
    setEditContact(c.contact)
  }

  async function saveEdit() {
    if (!editId) return
    const res = await fetch(`/api/customers/${editId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, address: editAddress, contact: editContact }),
    })
    const updated = await res.json()
    setCustomers(prev => prev.map(c => c.id === editId ? updated : c))
    setEditId(null)
  }

  async function handleDelete(id: number) {
    if (!confirm('Bu müşteriyi silmek istiyor musunuz?')) return
    await fetch(`/api/customers/${id}`, { method: 'DELETE' })
    setCustomers(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft size={18} />
        </Link>
        <Users size={20} className="text-brand-600" />
        <h1 className="text-xl font-bold text-gray-900">Müşteri Listesi</h1>
        <span className="ml-auto text-sm text-gray-400">{customers.length} müşteri</span>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Yükleniyor...</div>
      ) : customers.length === 0 ? (
        <div className="card p-8 text-center text-gray-400">
          <Users size={32} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">Henüz müşteri kaydı yok.</p>
          <p className="mt-1 text-sm">Fatura oluştururken müşteri bilgileri otomatik kaydedilir.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map(c => (
            <div key={c.id} className="card p-4">
              {editId === c.id ? (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Firma / Kişi Adı</label>
                    <input className="input-base font-bold" value={editName} onChange={e => setEditName(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">Adres</label>
                    <textarea className="input-base resize-none" rows={2} value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-600">İletişim</label>
                    <input className="input-base" value={editContact} onChange={e => setEditContact(e.target.value)} />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={saveEdit} className="btn-primary py-1.5 text-sm">
                      <Save size={14} /> Kaydet
                    </button>
                    <button onClick={() => setEditId(null)} className="btn-secondary py-1.5 text-sm">
                      <X size={14} /> İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    {c.address && (
                      <p className="mt-0.5 whitespace-pre-line text-sm text-gray-500">{c.address}</p>
                    )}
                    {c.contact && (
                      <p className="mt-0.5 text-sm text-gray-400">{c.contact}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      onClick={() => startEdit(c)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-600"
                      title="Düzenle"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
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

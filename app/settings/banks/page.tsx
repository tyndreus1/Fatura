'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Pencil, Trash2, Save, X } from 'lucide-react'
import Navbar from '@/components/Navbar'
import type { BankAccountRow } from '@/lib/types'

type EditFields = Omit<BankAccountRow, 'id'>

const EMPTY: EditFields = {
  key: '', label: '', currency: 'EUR',
  account_name: '', bank_name: '', branch_name: '',
  branch_code: '', swift_code: '', account_number: '', iban: '', sort_order: 0,
}

export default function BanksPage() {
  const [banks, setBanks]     = useState<BankAccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId]   = useState<number | null>(null)
  const [editData, setEditData] = useState<EditFields>({ ...EMPTY })
  const [showNew, setShowNew]   = useState(false)
  const [newData, setNewData]   = useState<EditFields>({ ...EMPTY })
  const [saving, setSaving]     = useState(false)

  useEffect(() => {
    fetch('/api/bank-accounts').then(r => r.json()).then(d => { setBanks(d); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  function startEdit(b: BankAccountRow) {
    setEditId(b.id)
    setEditData({ key: b.key, label: b.label, currency: b.currency, account_name: b.account_name, bank_name: b.bank_name, branch_name: b.branch_name, branch_code: b.branch_code, swift_code: b.swift_code, account_number: b.account_number, iban: b.iban, sort_order: b.sort_order })
  }

  async function saveEdit() {
    if (!editId) return
    setSaving(true)
    const res = await fetch(`/api/bank-accounts/${editId}`, { method: 'PUT', body: JSON.stringify(editData), headers: { 'Content-Type': 'application/json' } })
    const updated = await res.json()
    setBanks(prev => prev.map(b => b.id === editId ? updated : b))
    setEditId(null)
    setSaving(false)
  }

  async function deleteBank(id: number) {
    if (!confirm('Bu banka hesabını silmek istiyor musunuz?')) return
    await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' })
    setBanks(prev => prev.filter(b => b.id !== id))
    if (editId === id) setEditId(null)
  }

  async function createBank() {
    if (!newData.key || !newData.label) return
    setSaving(true)
    const res = await fetch('/api/bank-accounts', { method: 'POST', body: JSON.stringify(newData), headers: { 'Content-Type': 'application/json' } })
    const created = await res.json()
    if (res.ok) { setBanks(prev => [...prev, created]); setShowNew(false); setNewData({ ...EMPTY }) }
    setSaving(false)
  }

  const inp = (lbl: string, k: keyof EditFields, data: EditFields, set: (d: EditFields) => void, span2 = false) => (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="mb-1 block text-xs font-semibold text-gray-500">{lbl}</label>
      {k === 'currency' ? (
        <select className="input-base" value={data.currency} onChange={e => set({ ...data, currency: e.target.value })}>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      ) : (
        <input className="input-base" value={String(data[k] ?? '')} onChange={e => set({ ...data, [k]: e.target.value })} />
      )}
    </div>
  )

  const fields = (data: EditFields, set: (d: EditFields) => void) => (
    <div className="grid grid-cols-2 gap-3">
      {inp('Key (benzersiz)', 'key', data, set)}
      {inp('Para Birimi', 'currency', data, set)}
      {inp('Etiket', 'label', data, set, true)}
      {inp('Hesap Adı (Account Name)', 'account_name', data, set, true)}
      {inp('Banka Adı (Bank Name)', 'bank_name', data, set)}
      {inp('şube Adı (Branch Name)', 'branch_name', data, set)}
      {inp('şube Kodu (Branch Code)', 'branch_code', data, set)}
      {inp('SWIFT Kodu', 'swift_code', data, set)}
      {inp('Hesap Numarası', 'account_number', data, set)}
      {inp('IBAN', 'iban', data, set, true)}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 pb-20 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/settings" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"><ArrowLeft size={18} /></Link>
          <h1 className="text-xl font-bold text-gray-900">Banka Hesapları</h1>
          <button
            onClick={() => { setShowNew(true); setNewData({ ...EMPTY }) }}
            className="ml-auto flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus size={15} /> Yeni Hesap
          </button>
        </div>

        {showNew && (
          <div className="card mb-4 p-5">
            <p className="mb-4 text-sm font-bold text-gray-700">Yeni Banka Hesabı</p>
            {fields(newData, setNewData)}
            <div className="mt-4 flex gap-2">
              <button onClick={createBank} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                <Save size={14} /> Kaydet
              </button>
              <button onClick={() => setShowNew(false)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                <X size={14} /> İptal
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-gray-400">Yükleniyor...</p>
        ) : (
          <div className="space-y-3">
            {banks.map(b => (
              <div key={b.id} className="card overflow-hidden">
                {editId === b.id ? (
                  <div className="p-5">
                    {fields(editData, setEditData)}
                    <div className="mt-4 flex gap-2">
                      <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50">
                        <Save size={14} /> Kaydet
                      </button>
                      <button onClick={() => setEditId(null)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                        <X size={14} /> İptal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-5 py-4">
                    <div>
                      <p className="font-semibold text-gray-900">{b.label}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{b.currency} · IBAN: {b.iban || '—'}</p>
                      <p className="text-xs text-gray-400">key: <span className="font-mono">{b.key}</span></p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => startEdit(b)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-brand-600"><Pencil size={14} /></button>
                      <button onClick={() => deleteBank(b.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

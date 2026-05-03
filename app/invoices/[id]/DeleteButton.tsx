'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)

  async function handleDelete() {
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
    router.push('/invoices')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Silmek istediğine emin misin?</span>
        <button onClick={handleDelete} className="btn-danger text-xs py-1.5">Evet, Sil</button>
        <button onClick={() => setConfirming(false)} className="btn-secondary text-xs py-1.5">İptal</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="btn-danger">
      <Trash2 size={15} />
    </button>
  )
}

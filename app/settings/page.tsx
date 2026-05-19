'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { Upload, CheckCircle, Settings, Building2, ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'

type UploadState = { uploading: boolean; uploaded: boolean; error: string; ts: number; exists: boolean }
const initState = (): UploadState => ({ uploading: false, uploaded: false, error: '', ts: Date.now(), exists: true })

export default function SettingsPage() {
  const [logo,  setLogo]  = useState<UploadState>(initState())
  const [stamp, setStamp] = useState<UploadState>(initState())
  const logoRef  = useRef<HTMLInputElement>(null)
  const stampRef = useRef<HTMLInputElement>(null)

  async function upload(endpoint: string, file: File, set: React.Dispatch<React.SetStateAction<UploadState>>, ref: React.RefObject<HTMLInputElement | null>) {
    set(s => ({ ...s, uploading: true, uploaded: false, error: '' }))
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(endpoint, { method: 'POST', body: form })
      if (res.ok) set(s => ({ ...s, uploading: false, uploaded: true, exists: true, ts: Date.now() }))
      else { const d = await res.json(); set(s => ({ ...s, uploading: false, error: d.error ?? 'Hata' })) }
    } catch { set(s => ({ ...s, uploading: false, error: 'Sunucu hatası' })) }
    if (ref.current) ref.current.value = ''
  }

  const uploadSection = (
    title: string,
    hint: string,
    endpoint: string,
    state: UploadState,
    set: React.Dispatch<React.SetStateAction<UploadState>>,
    inputRef: React.RefObject<HTMLInputElement | null>,
    accept = 'image/*'
  ) => (
    <div className="card p-6 mb-4">
      <p className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">{title}</p>
      <div className="mb-4 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
        {state.exists ? (
          <img
            key={state.ts}
            src={`${endpoint}?t=${state.ts}`}
            alt={title}
            className="max-h-24 max-w-xs w-auto object-contain"
            onError={() => set(s => ({ ...s, exists: false }))}
          />
        ) : (
          <span className="text-xs text-gray-400">Yüklenmedi</span>
        )}
      </div>
      <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-all ${
        state.uploading ? 'cursor-not-allowed border-gray-200 text-gray-400' : 'border-brand-300 text-brand-600 hover:bg-brand-50'
      }`}>
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(endpoint, f, set, inputRef) }}
          disabled={state.uploading} />
        {state.uploading ? 'Yükleniyor...' : <><Upload size={16} /> Yükle / Değiştir</>}
      </label>
      {state.uploaded && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
          <CheckCircle size={16} /> Başarıyla güncellendi.
        </div>
      )}
      {state.error && <div className="mt-3 text-sm text-red-600">{state.error}</div>}
      <p className="mt-3 text-xs text-gray-400">{hint}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <Settings size={22} className="text-brand-600" />
          <h1 className="text-xl font-bold text-gray-900">Ayarlar</h1>
        </div>

        {uploadSection(
          'Şirket Logosu',
          'PNG, JPG, WEBP desteklenir. Logo faturanın sol üst köşesinde görünür.',
          '/api/settings/logo',
          logo, setLogo, logoRef
        )}

        {uploadSection(
          'Kaşe / İmza',
          'Transparan PNG tercih edilir. Faturada toplam alanının altında sağa hizalı görünür.',
          '/api/settings/stamp',
          stamp, setStamp, stampRef,
          'image/png,image/gif,image/webp'
        )}

        <Link href="/settings/banks" className="card flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <Building2 size={18} className="text-brand-600" />
            <div>
              <p className="font-semibold text-gray-900">Banka Hesapları</p>
              <p className="text-xs text-gray-400">Faturalarda kullanılan banka bilgilerini düzenle</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </Link>
      </div>
    </div>
  )
}

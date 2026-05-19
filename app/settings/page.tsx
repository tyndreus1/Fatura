'use client'
import { useState, useRef } from 'react'
import { Upload, CheckCircle, Settings } from 'lucide-react'
import Navbar from '@/components/Navbar'

export default function SettingsPage() {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [logoTs, setLogoTs] = useState(Date.now())
  const [logoExists, setLogoExists] = useState(true)
  const [uploadError, setUploadError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploaded(false)
    setUploadError('')
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch('/api/settings/logo', { method: 'POST', body: form })
      if (res.ok) {
        setUploaded(true)
        setLogoExists(true)
        setLogoTs(Date.now())
      } else {
        const data = await res.json()
        setUploadError(data.error ?? 'Yükleme hatası')
      }
    } catch {
      setUploadError('Sunucu hatası')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 pb-20 pt-8">
        <div className="mb-6 flex items-center gap-3">
          <Settings size={22} className="text-brand-600" />
          <h1 className="text-xl font-bold text-gray-900">Ayarlar</h1>
        </div>

        <div className="card p-6">
          <p className="mb-4 text-sm font-bold uppercase tracking-wide text-gray-500">Şirket Logosu</p>

          <div className="mb-4 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
            {logoExists ? (
              <img
                key={logoTs}
                src={`/api/settings/logo?t=${logoTs}`}
                alt="Logo"
                className="max-h-24 max-w-xs w-auto object-contain"
                onError={() => setLogoExists(false)}
              />
            ) : (
              <span className="text-xs text-gray-400">Logo yüklenmedi</span>
            )}
          </div>

          <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-3 text-sm font-medium transition-all ${
            uploading ? 'cursor-not-allowed border-gray-200 text-gray-400' : 'border-brand-300 text-brand-600 hover:bg-brand-50'
          }`}>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? 'Yükleniyor...' : <><Upload size={16} /> Logo Yükle / Değiştir</>}
          </label>

          {uploaded && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <CheckCircle size={16} /> Logo başarıyla güncellendi.
            </div>
          )}
          {uploadError && (
            <div className="mt-3 text-sm text-red-600">{uploadError}</div>
          )}

          <p className="mt-3 text-xs text-gray-400">
            PNG, JPG, WEBP desteklenir. Logo faturanın sol üst köşesinde görünür ve PDF&apos;e aktarılır.
          </p>
        </div>
      </div>
    </div>
  )
}

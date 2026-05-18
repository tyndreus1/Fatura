'use client'
import { Printer } from 'lucide-react'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary inline-flex items-center gap-2"
    >
      <Printer size={15} />
      PDF / Yazdır
    </button>
  )
}

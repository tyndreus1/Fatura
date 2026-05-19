'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { List, Plus, Users, Package } from 'lucide-react'

export default function Navbar() {
  const path = usePathname()
  const navLink = (href: string, label: string, Icon: React.ElementType) => {
    const active = path === href || (href !== '/' && path.startsWith(href))
    return (
      <Link href={href} className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active ? 'bg-brand-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}>
        <Icon size={15} />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    )
  }
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight text-brand-600">alpress</span>
          <span className="hidden text-xs font-medium text-gray-400 sm:block">Fatura Sistemi</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navLink('/invoices', 'Faturalar', List)}
          {navLink('/customers', 'Müşteriler', Users)}
          {navLink('/products', 'Ürünler', Package)}
          <Link href="/invoices/new" className="ml-2 flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-95">
            <Plus size={15} />
            <span className="hidden sm:inline">Yeni Fatura</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

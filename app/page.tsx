import Link from 'next/link'
import { FileText, List, ArrowRight, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <span className="text-2xl font-black tracking-tight text-brand-600">alpress</span>
            <span className="ml-2 text-sm font-medium text-gray-400">Fatura Sistemi</span>
          </div>
          <Link href="/invoices" className="btn-secondary text-xs">
            <List size={14} /> Tüm Faturalar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
          <Zap size={32} className="text-white" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-gray-900 text-center">Yeni Fatura Oluştur</h1>
        <p className="mb-12 text-center text-gray-500 max-w-sm">
          Proforma veya ticari fatura oluşturun, PDF indirin ve arşivleyin.
        </p>

        {/* Main CTA cards */}
        <div className="grid w-full max-w-xl gap-4 sm:grid-cols-2">
          <Link href="/invoices/new?type=proforma" className="group">
            <div className="card h-full rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 cursor-pointer">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl group-hover:bg-blue-200 transition-colors">
                📋
              </div>
              <h2 className="mb-1 text-lg font-bold text-gray-900">Proforma Invoice</h2>
              <p className="text-sm text-gray-500">Ön fatura / teklif belgesi oluştur</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-600">
                Oluştur <ArrowRight size={14} />
              </div>
            </div>
          </Link>

          <Link href="/invoices/new?type=commercial" className="group">
            <div className="card h-full rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:border-emerald-200 hover:-translate-y-0.5 cursor-pointer">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl group-hover:bg-emerald-200 transition-colors">
                🧾
              </div>
              <h2 className="mb-1 text-lg font-bold text-gray-900">Commercial Invoice</h2>
              <p className="text-sm text-gray-500">Ticari fatura / satış belgesi oluştur</p>
              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-emerald-600">
                Oluştur <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        </div>

        {/* Quick link */}
        <div className="mt-8">
          <Link
            href="/invoices"
            className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <FileText size={16} />
            Fatura arşivine git
            <ArrowRight size={14} />
          </Link>
        </div>
      </main>
    </div>
  )
}

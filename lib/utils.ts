import type { InvoiceItem } from './types'

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function calcTotals(
  items: InvoiceItem[],
  shipment: number,
  discount: number,
  advance: number
) {
  const subtotal = items.reduce((s, i) => s + i.amount, 0)
  const grandTotal = subtotal + shipment - discount - advance
  return { subtotal, grandTotal }
}

export function newItemId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

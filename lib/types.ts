export interface InvoiceItem {
  id: string
  description: string
  qty: number
  unitPrice: number
  amount: number
  image_url?: string
}

export type InvoiceType = 'proforma' | 'commercial'
export type Currency = 'EUR' | 'USD'
export type BankAccountKey = string

export interface Invoice {
  id: number
  invoice_number: string
  invoice_type: InvoiceType
  currency: Currency
  bank_account: BankAccountKey
  invoice_date: string
  customer_name: string
  customer_address: string
  customer_contact: string
  items: InvoiceItem[]
  shipment_cost: number
  discount: number
  advance_payment: number
  payment_term: string
  shipment_term: string
  delivery_time: string
  notes: string
  created_at: string
  updated_at: string
}

export type InvoiceFormData = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>

export interface InvoiceRow extends Omit<Invoice, 'items'> {
  items: string
}

export interface Customer {
  id: number
  name: string
  address: string
  contact: string
  created_at: string
  updated_at: string
}

export interface Product {
  id: number
  name: string
  description: string
  unit_price: number
  image_url: string
  created_at: string
  updated_at: string
}

export interface BankAccountRow {
  id: number
  key: string
  label: string
  currency: string
  account_name: string
  bank_name: string
  branch_name: string
  branch_code: string
  swift_code: string
  account_number: string
  iban: string
  sort_order: number
}

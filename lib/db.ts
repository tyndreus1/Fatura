import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { Invoice, InvoiceFormData, InvoiceRow, Customer } from './types'

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'invoices.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')

  _db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number   TEXT    UNIQUE NOT NULL,
      invoice_type     TEXT    NOT NULL DEFAULT 'proforma',
      currency         TEXT    NOT NULL DEFAULT 'EUR',
      bank_account     TEXT    NOT NULL DEFAULT 'akbank_eur',
      invoice_date     TEXT    NOT NULL,
      customer_name    TEXT    NOT NULL DEFAULT '',
      customer_address TEXT    DEFAULT '',
      customer_contact TEXT    DEFAULT '',
      items            TEXT    NOT NULL DEFAULT '[]',
      shipment_cost    REAL    DEFAULT 0,
      discount         REAL    DEFAULT 0,
      advance_payment  REAL    DEFAULT 0,
      payment_term     TEXT    DEFAULT '',
      shipment_term    TEXT    DEFAULT '',
      delivery_time    TEXT    DEFAULT '',
      notes            TEXT    DEFAULT '',
      created_at       TEXT    DEFAULT (datetime('now')),
      updated_at       TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS counter (
      year INTEGER PRIMARY KEY,
      seq  INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS customers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL UNIQUE,
      address    TEXT    DEFAULT '',
      contact    TEXT    DEFAULT '',
      created_at TEXT    DEFAULT (datetime('now')),
      updated_at TEXT    DEFAULT (datetime('now'))
    );
  `)

  return _db
}

function rowToInvoice(row: InvoiceRow): Invoice {
  return {
    ...row,
    items: JSON.parse(row.items || '[]'),
  } as Invoice
}

// ─── Invoice number ───────────────────────────────────────────────────────────

export function peekNextNumber(): string {
  const db = getDb()
  const year = new Date().getFullYear()
  const row = db.prepare('SELECT seq FROM counter WHERE year = ?').get(year) as
    | { seq: number }
    | undefined
  const next = (row?.seq ?? 0) + 1
  return `ALP${year}${String(next).padStart(4, '0')}`
}

export function consumeNextNumber(): string {
  const db = getDb()
  const year = new Date().getFullYear()
  db.prepare(`
    INSERT INTO counter (year, seq) VALUES (?, 1)
    ON CONFLICT(year) DO UPDATE SET seq = seq + 1
  `).run(year)
  const row = db.prepare('SELECT seq FROM counter WHERE year = ?').get(year) as { seq: number }
  return `ALP${year}${String(row.seq).padStart(4, '0')}`
}

// ─── Customers ────────────────────────────────────────────────────────────────

export function listCustomers(): Customer[] {
  const db = getDb()
  return db.prepare('SELECT * FROM customers ORDER BY name').all() as Customer[]
}

export function upsertCustomer(name: string, address: string, contact: string): void {
  if (!name.trim()) return
  const db = getDb()
  db.prepare(`
    INSERT INTO customers (name, address, contact)
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      address    = CASE WHEN excluded.address != '' THEN excluded.address ELSE address END,
      contact    = CASE WHEN excluded.contact != '' THEN excluded.contact ELSE contact END,
      updated_at = datetime('now')
  `).run(name.trim(), address.trim(), contact.trim())
}

export function updateCustomer(
  id: number,
  data: { name?: string; address?: string; contact?: string }
): Customer | null {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined
  if (!existing) return null
  const merged = { ...existing, ...data }
  db.prepare(`
    UPDATE customers SET name = ?, address = ?, contact = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(merged.name, merged.address, merged.contact, id)
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer
}

export function deleteCustomer(id: number): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM customers WHERE id = ?').run(id)
  return result.changes > 0
}

// ─── Invoice CRUD ─────────────────────────────────────────────────────────────

export function listInvoices(): Invoice[] {
  const db = getDb()
  const rows = db
    .prepare(`SELECT * FROM invoices ORDER BY created_at DESC`)
    .all() as InvoiceRow[]
  return rows.map(rowToInvoice)
}

export function getInvoice(id: number): Invoice | null {
  const db = getDb()
  const row = db.prepare('SELECT * FROM invoices WHERE id = ?').get(id) as InvoiceRow | undefined
  return row ? rowToInvoice(row) : null
}

export function createInvoice(data: InvoiceFormData): Invoice {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO invoices (
      invoice_number, invoice_type, currency, bank_account, invoice_date,
      customer_name, customer_address, customer_contact,
      items, shipment_cost, discount, advance_payment,
      payment_term, shipment_term, delivery_time, notes
    ) VALUES (
      @invoice_number, @invoice_type, @currency, @bank_account, @invoice_date,
      @customer_name, @customer_address, @customer_contact,
      @items, @shipment_cost, @discount, @advance_payment,
      @payment_term, @shipment_term, @delivery_time, @notes
    )
  `)
  const result = stmt.run({
    ...data,
    items: JSON.stringify(data.items),
  })
  upsertCustomer(data.customer_name, data.customer_address ?? '', data.customer_contact ?? '')
  return getInvoice(result.lastInsertRowid as number)!
}

export function updateInvoice(id: number, data: Partial<InvoiceFormData>): Invoice | null {
  const db = getDb()
  const existing = getInvoice(id)
  if (!existing) return null

  const merged = { ...existing, ...data }
  db.prepare(`
    UPDATE invoices SET
      invoice_number   = @invoice_number,
      invoice_type     = @invoice_type,
      currency         = @currency,
      bank_account     = @bank_account,
      invoice_date     = @invoice_date,
      customer_name    = @customer_name,
      customer_address = @customer_address,
      customer_contact = @customer_contact,
      items            = @items,
      shipment_cost    = @shipment_cost,
      discount         = @discount,
      advance_payment  = @advance_payment,
      payment_term     = @payment_term,
      shipment_term    = @shipment_term,
      delivery_time    = @delivery_time,
      notes            = @notes,
      updated_at       = datetime('now')
    WHERE id = @id
  `).run({ ...merged, items: JSON.stringify(merged.items), id })

  upsertCustomer(merged.customer_name, merged.customer_address ?? '', merged.customer_contact ?? '')
  return getInvoice(id)
}

export function deleteInvoice(id: number): boolean {
  const db = getDb()
  const result = db.prepare('DELETE FROM invoices WHERE id = ?').run(id)
  return result.changes > 0
}

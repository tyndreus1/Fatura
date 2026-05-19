import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { Invoice, InvoiceFormData, InvoiceRow, Customer, Product, BankAccountRow } from './types'

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
    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL UNIQUE,
      description TEXT    DEFAULT '',
      unit_price  REAL    DEFAULT 0,
      image_url   TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now')),
      updated_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      key            TEXT NOT NULL UNIQUE,
      label          TEXT NOT NULL DEFAULT '',
      currency       TEXT NOT NULL DEFAULT 'EUR',
      account_name   TEXT DEFAULT '',
      bank_name      TEXT DEFAULT '',
      branch_name    TEXT DEFAULT '',
      branch_code    TEXT DEFAULT '',
      swift_code     TEXT DEFAULT '',
      account_number TEXT DEFAULT '',
      iban           TEXT DEFAULT '',
      sort_order     INTEGER DEFAULT 0
    );
  `)

  // Seed default bank accounts once
  const bc = _db.prepare('SELECT COUNT(*) as n FROM bank_accounts').get() as { n: number }
  if (bc.n === 0) {
    const ins = _db.prepare(`
      INSERT OR IGNORE INTO bank_accounts
        (key,label,currency,account_name,bank_name,branch_name,branch_code,swift_code,account_number,iban,sort_order)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
    `)
    ;[
      ['akbank_eur','Akbank A.Ş. — EUR (031030)','EUR','Alpress Kalıpçılık Dan. Ith. Ihr. San. ve Tic. Ltd.Şti','Akbank A.S.','Seyitnizam','1349','AKBKTRIS','031030','TR26 0004 6013 4903 6000 0310 30',0],
      ['akbank_eur2','Akbank A.Ş. — EUR (0031030)','EUR','Alpress Kalipcilik Dan. İth. İhr. San. ve Tic. Ltd.Şti','Akbank A.S.','Seyitnizam','1349','AKBKTRIS','0031030','TR76 0004 6013 4900 1000 0310 30',1],
      ['akbank_usd','Akbank A.Ş. — USD','USD','Alpress Kalipcilik Dan. İth. İhr. San. ve Tic. Ltd.Şti','Akbank A.S.','Seyitnizam','1349','AKBKTRIS','0057195','TR45 0004 6013 4900 1000 0571 95',2],
      ['emlak_eur','Emlak Katılım Bankası — EUR','EUR','Alpress Kalipcilik Dan. İth. İhr. San. ve Tic. Ltd.Şti','TURKIYE EMLAK KATILIM BANKASI','','#76','EMLATRISXXX','749803','TR35 0021 1000 0007 4980 3001 03',3],
    ].forEach(r => ins.run(...(r as Parameters<typeof ins.run>)))
  }

  return _db
}

function rowToInvoice(row: InvoiceRow): Invoice {
  return { ...row, items: JSON.parse(row.items || '[]') } as Invoice
}

export function peekNextNumber(): string {
  const db = getDb()
  const year = new Date().getFullYear()
  // Use the highest existing invoice number for this year
  const row = db.prepare(
    `SELECT invoice_number FROM invoices WHERE invoice_number LIKE ? ORDER BY invoice_number DESC LIMIT 1`
  ).get(`ALP${year}%`) as { invoice_number: string } | undefined
  if (row) {
    const seq = parseInt(row.invoice_number.slice(7), 10)
    if (!isNaN(seq)) return `ALP${year}${String(seq + 1).padStart(4, '0')}`
  }
  const counterRow = db.prepare('SELECT seq FROM counter WHERE year = ?').get(year) as { seq: number } | undefined
  return `ALP${year}${String((counterRow?.seq ?? 0) + 1).padStart(4, '0')}`
}

export function consumeNextNumber(): string {
  const db = getDb()
  const year = new Date().getFullYear()
  db.prepare(`INSERT INTO counter (year, seq) VALUES (?, 1) ON CONFLICT(year) DO UPDATE SET seq = seq + 1`).run(year)
  const row = db.prepare('SELECT seq FROM counter WHERE year = ?').get(year) as { seq: number }
  return `ALP${year}${String(row.seq).padStart(4, '0')}`
}

// ── Customers ────────────────────────────────────────────────────────────────

export function listCustomers(): Customer[] {
  return getDb().prepare('SELECT * FROM customers ORDER BY name').all() as Customer[]
}

export function upsertCustomer(name: string, address: string, contact: string): void {
  if (!name.trim()) return
  getDb().prepare(`
    INSERT INTO customers (name, address, contact) VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      address    = CASE WHEN excluded.address != '' THEN excluded.address ELSE address END,
      contact    = CASE WHEN excluded.contact != '' THEN excluded.contact ELSE contact END,
      updated_at = datetime('now')
  `).run(name.trim(), address.trim(), contact.trim())
}

export function updateCustomer(id: number, data: { name?: string; address?: string; contact?: string }): Customer | null {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer | undefined
  if (!existing) return null
  const m = { ...existing, ...data }
  db.prepare(`UPDATE customers SET name = ?, address = ?, contact = ?, updated_at = datetime('now') WHERE id = ?`).run(m.name, m.address, m.contact, id)
  return db.prepare('SELECT * FROM customers WHERE id = ?').get(id) as Customer
}

export function deleteCustomer(id: number): boolean {
  return getDb().prepare('DELETE FROM customers WHERE id = ?').run(id).changes > 0
}

// ── Products ─────────────────────────────────────────────────────────────────

export function listProducts(): Product[] {
  return getDb().prepare('SELECT * FROM products ORDER BY name').all() as Product[]
}

export function getProduct(id: number): Product | null {
  return getDb().prepare('SELECT * FROM products WHERE id = ?').get(id) as Product | null
}

export function createProduct(data: { name: string; description: string; unit_price: number }): Product {
  const db = getDb()
  const r = db.prepare(`INSERT INTO products (name, description, unit_price) VALUES (?, ?, ?)`).run(data.name.trim(), data.description.trim(), data.unit_price)
  return getProduct(r.lastInsertRowid as number)!
}

export function updateProduct(id: number, data: { name?: string; description?: string; unit_price?: number }): Product | null {
  const existing = getProduct(id)
  if (!existing) return null
  const m = { ...existing, ...data }
  getDb().prepare(`UPDATE products SET name = ?, description = ?, unit_price = ?, updated_at = datetime('now') WHERE id = ?`).run(m.name, m.description, m.unit_price, id)
  return getProduct(id)
}

export function setProductImage(id: number, filename: string): Product | null {
  const existing = getProduct(id)
  if (!existing) return null
  if (existing.image_url) {
    const old = path.join(DATA_DIR, 'uploads', existing.image_url)
    if (fs.existsSync(old)) { try { fs.unlinkSync(old) } catch {} }
  }
  getDb().prepare(`UPDATE products SET image_url = ?, updated_at = datetime('now') WHERE id = ?`).run(filename, id)
  return getProduct(id)
}

export function deleteProduct(id: number): boolean {
  const existing = getProduct(id)
  if (!existing) return false
  if (existing.image_url) {
    const img = path.join(DATA_DIR, 'uploads', existing.image_url)
    if (fs.existsSync(img)) { try { fs.unlinkSync(img) } catch {} }
  }
  return getDb().prepare('DELETE FROM products WHERE id = ?').run(id).changes > 0
}

// ── Settings ─────────────────────────────────────────────────────────────────

export function getSetting(key: string): string {
  return (getDb().prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined)?.value ?? ''
}

export function setSetting(key: string, value: string): void {
  getDb().prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value)
}

// ── Bank Accounts ─────────────────────────────────────────────────────────────

export function listBankAccounts(): BankAccountRow[] {
  return getDb().prepare('SELECT * FROM bank_accounts ORDER BY sort_order, key').all() as BankAccountRow[]
}

export function getBankAccountByKey(key: string): BankAccountRow | null {
  return getDb().prepare('SELECT * FROM bank_accounts WHERE key = ?').get(key) as BankAccountRow | null
}

export function createBankAccount(data: Omit<BankAccountRow, 'id'>): BankAccountRow {
  const db = getDb()
  const r = db.prepare(`
    INSERT INTO bank_accounts (key,label,currency,account_name,bank_name,branch_name,branch_code,swift_code,account_number,iban,sort_order)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `).run(data.key, data.label, data.currency, data.account_name, data.bank_name, data.branch_name, data.branch_code, data.swift_code, data.account_number, data.iban, data.sort_order ?? 0)
  return db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(r.lastInsertRowid) as BankAccountRow
}

export function updateBankAccount(id: number, data: Partial<Omit<BankAccountRow, 'id'>>): BankAccountRow | null {
  const db = getDb()
  const existing = db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(id) as BankAccountRow | null
  if (!existing) return null
  const m = { ...existing, ...data }
  db.prepare(`
    UPDATE bank_accounts SET key=?,label=?,currency=?,account_name=?,bank_name=?,branch_name=?,branch_code=?,swift_code=?,account_number=?,iban=?,sort_order=? WHERE id=?
  `).run(m.key, m.label, m.currency, m.account_name, m.bank_name, m.branch_name, m.branch_code, m.swift_code, m.account_number, m.iban, m.sort_order, id)
  return db.prepare('SELECT * FROM bank_accounts WHERE id = ?').get(id) as BankAccountRow
}

export function deleteBankAccount(id: number): boolean {
  return getDb().prepare('DELETE FROM bank_accounts WHERE id = ?').run(id).changes > 0
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export function listInvoices(): Invoice[] {
  return getDb().prepare('SELECT * FROM invoices ORDER BY created_at DESC').all().map(r => rowToInvoice(r as InvoiceRow))
}

export function getInvoice(id: number): Invoice | null {
  const row = getDb().prepare('SELECT * FROM invoices WHERE id = ?').get(id) as InvoiceRow | undefined
  return row ? rowToInvoice(row) : null
}

export function createInvoice(data: InvoiceFormData): Invoice {
  const db = getDb()
  const r = db.prepare(`
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
  `).run({ ...data, items: JSON.stringify(data.items) })
  upsertCustomer(data.customer_name, data.customer_address ?? '', data.customer_contact ?? '')
  return getInvoice(r.lastInsertRowid as number)!
}

export function updateInvoice(id: number, data: Partial<InvoiceFormData>): Invoice | null {
  const existing = getInvoice(id)
  if (!existing) return null
  const m = { ...existing, ...data }
  getDb().prepare(`
    UPDATE invoices SET
      invoice_number = @invoice_number, invoice_type = @invoice_type,
      currency = @currency, bank_account = @bank_account, invoice_date = @invoice_date,
      customer_name = @customer_name, customer_address = @customer_address, customer_contact = @customer_contact,
      items = @items, shipment_cost = @shipment_cost, discount = @discount, advance_payment = @advance_payment,
      payment_term = @payment_term, shipment_term = @shipment_term, delivery_time = @delivery_time,
      notes = @notes, updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...m, items: JSON.stringify(m.items), id })
  upsertCustomer(m.customer_name, m.customer_address ?? '', m.customer_contact ?? '')
  return getInvoice(id)
}

export function deleteInvoice(id: number): boolean {
  return getDb().prepare('DELETE FROM invoices WHERE id = ?').run(id).changes > 0
}

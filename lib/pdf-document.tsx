import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from '@react-pdf/renderer'
import type { Invoice } from './types'
import { BANK_ACCOUNTS } from './bank-accounts'
import { formatNumber, formatDate } from './utils'

const RED    = '#CC1A1A'
const ORANGE = '#C97000'
const DARK   = '#1E0A00'   // table header bg
const WHITE  = '#FFFFFF'
const GRAY   = '#555555'
const LGRAY  = '#EEEEEE'

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    paddingTop: 28,
    paddingLeft: 33,
    paddingRight: 33,
    paddingBottom: 24,
    backgroundColor: WHITE,
    color: '#111111',
  },
  // ── Header ─────────────────────────────────────
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  logoBox: { flexDirection: 'column' },
  logoMain: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: RED, letterSpacing: 0.5 },
  logoSub: { fontSize: 5.5, color: GRAY, marginTop: 1, lineHeight: 1.4 },
  docTitle: { fontSize: 24, fontFamily: 'Helvetica-BoldOblique', color: RED },
  // ── Info section ───────────────────────────────
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  infoLeft: { flex: 1 },
  infoToLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', marginBottom: 3 },
  infoCustomer: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: RED, marginBottom: 2 },
  infoAddr: { fontSize: 8, color: '#333333', lineHeight: 1.45 },
  infoRight: { alignItems: 'flex-end' },
  metaRow: { flexDirection: 'row', marginBottom: 3, alignItems: 'center' },
  metaLabel: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', width: 78 },
  metaColon: { fontSize: 8.5, marginHorizontal: 3 },
  metaValue: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: RED },
  // ── Table ──────────────────────────────────────
  tableWrap: { marginBottom: 8 },
  tHead: { flexDirection: 'row', backgroundColor: DARK, paddingVertical: 5, paddingHorizontal: 5 },
  tHeadTxt: { color: WHITE, fontFamily: 'Helvetica-Bold', fontSize: 8 },
  tRow: { flexDirection: 'row', borderBottomColor: LGRAY, borderBottomWidth: 0.5, paddingVertical: 9, paddingHorizontal: 5, minHeight: 30 },
  tRowOdd: { backgroundColor: '#FAFAFA' },
  colQty:  { width: '8%' },
  colDesc: { width: '52%' },
  colUP:   { width: '22%', textAlign: 'right' },
  colAmt:  { width: '18%', textAlign: 'right' },
  tBold:   { fontFamily: 'Helvetica-Bold', fontSize: 8.5 },
  tNormal: { fontSize: 8.5 },
  // ── Totals ─────────────────────────────────────
  totalsWrap: { alignItems: 'flex-end', marginTop: 6 },
  totalRow: { flexDirection: 'row', width: 210, justifyContent: 'space-between', marginBottom: 3 },
  subLabel: { fontSize: 8.5, color: '#444444' },
  subVal:   { fontSize: 8.5, color: '#444444' },
  grandLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: RED },
  grandVal:   { fontSize: 10, fontFamily: 'Helvetica-Bold', color: RED },
  grandBorder: { borderTopColor: RED, borderTopWidth: 1, paddingTop: 3, marginTop: 2 },
  // ── Divider ────────────────────────────────────
  divider: { borderBottomColor: RED, borderBottomWidth: 1.5, marginTop: 14, marginBottom: 8 },
  // ── Thank you ──────────────────────────────────
  thankYou: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: ORANGE, marginBottom: 8 },
  // ── Footer columns ─────────────────────────────
  footerRow: { flexDirection: 'row', gap: 16 },
  footerCol: { flex: 1 },
  fHeader: { backgroundColor: RED, color: WHITE, fontFamily: 'Helvetica-Bold', fontSize: 8, paddingVertical: 3, paddingHorizontal: 5, marginBottom: 5 },
  fRow: { flexDirection: 'row', marginBottom: 2.5 },
  fLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', width: 76 },
  fVal:   { fontSize: 7.5, flex: 1 },
  fNote:  { fontSize: 7.5, color: RED, fontFamily: 'Helvetica-Bold', marginTop: 4 },
  fAddrLabel: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginTop: 5 },
  fAddrVal:   { fontSize: 7.5, color: '#444444', lineHeight: 1.4 },
  countryOrigin: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', marginTop: 5 },
  // ── Bottom bar ─────────────────────────────────
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 5, borderTopColor: LGRAY, borderTopWidth: 0.5 },
  bottomTxt: { fontSize: 7.5, color: RED },
  bottomLink: { fontSize: 7.5, color: RED },
})

function sym(currency: string) { return currency === 'EUR' ? '€' : '$' }
function fmt(n: number) { return formatNumber(n) }

interface Props { invoice: Invoice }

export function InvoicePDF({ invoice }: Props) {
  const bank = BANK_ACCOUNTS[invoice.bank_account]
  const S = sym(invoice.currency)
  const isProforma = invoice.invoice_type === 'proforma'
  const subtotal = invoice.items.reduce((acc, i) => acc + i.amount, 0)
  const hasExtras = invoice.shipment_cost > 0 || invoice.discount > 0 || invoice.advance_payment > 0
  const grandTotal = subtotal + invoice.shipment_cost - invoice.discount - invoice.advance_payment

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.logoBox}>
            <Text style={s.logoMain}>alpress</Text>
            <Text style={s.logoSub}>KALIPÇILIK DANIŞMANLIK{'\n'}ITH. IHR. SAN. VE TIC. LTD. ŞTI.</Text>
          </View>
          <Text style={s.docTitle}>{isProforma ? 'Proforma Invoice' : 'Invoice'}</Text>
        </View>

        {/* ── Invoice info ── */}
        <View style={s.infoRow}>
          <View style={s.infoLeft}>
            <Text style={s.infoToLabel}>
              {isProforma ? 'Proforma Invoice To:' : 'Invoice To:'}
            </Text>
            <Text style={s.infoCustomer}>{invoice.customer_name}</Text>
            {invoice.customer_address ? (
              <Text style={s.infoAddr}>{invoice.customer_address}</Text>
            ) : null}
            {invoice.customer_contact ? (
              <Text style={s.infoAddr}>{invoice.customer_contact}</Text>
            ) : null}
          </View>
          <View style={s.infoRight}>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>{isProforma ? 'P.Invoice No' : 'Invoice No'}</Text>
              <Text style={s.metaColon}>:</Text>
              <Text style={s.metaValue}>{invoice.invoice_number}</Text>
            </View>
            <View style={s.metaRow}>
              <Text style={s.metaLabel}>{isProforma ? 'P.Invoice Date' : 'Invoice Date'}</Text>
              <Text style={s.metaColon}>:</Text>
              <Text style={s.metaValue}>{formatDate(invoice.invoice_date)}</Text>
            </View>
          </View>
        </View>

        {/* ── Products table ── */}
        <View style={s.tableWrap}>
          <View style={s.tHead}>
            <Text style={[s.tHeadTxt, s.colQty]}>QTY</Text>
            <Text style={[s.tHeadTxt, s.colDesc]}>DESCRIPTION</Text>
            <Text style={[s.tHeadTxt, s.colUP]}>UNIT PRICE</Text>
            <Text style={[s.tHeadTxt, s.colAmt]}>AMOUNT</Text>
          </View>
          {invoice.items.map((item, idx) => (
            <View key={item.id || idx} style={[s.tRow, idx % 2 === 1 ? s.tRowOdd : {}]}>
              <Text style={[s.tBold, s.colQty]}>{item.qty}</Text>
              <Text style={[s.tBold, s.colDesc]}>{item.description}</Text>
              <Text style={[s.tNormal, s.colUP]}>{S}  {fmt(item.unitPrice)}</Text>
              <Text style={[s.tNormal, s.colAmt]}>{S}  {fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* ── Totals ── */}
        <View style={s.totalsWrap}>
          {hasExtras && (
            <View style={s.totalRow}>
              <Text style={s.subLabel}>Subtotal</Text>
              <Text style={s.subVal}>{S}  {fmt(subtotal)}</Text>
            </View>
          )}
          {invoice.shipment_cost > 0 && (
            <View style={s.totalRow}>
              <Text style={s.subLabel}>Shipment</Text>
              <Text style={s.subVal}>{S}  {fmt(invoice.shipment_cost)}</Text>
            </View>
          )}
          {invoice.discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.subLabel}>Discount</Text>
              <Text style={s.subVal}>-{S}  {fmt(invoice.discount)}</Text>
            </View>
          )}
          {invoice.advance_payment > 0 && (
            <View style={s.totalRow}>
              <Text style={s.subLabel}>Advance</Text>
              <Text style={s.subVal}>-{S}  {fmt(invoice.advance_payment)}</Text>
            </View>
          )}
          <View style={[s.totalRow, s.grandBorder]}>
            <Text style={s.grandLabel}>{hasExtras ? 'GRAND TOTAL' : 'TOTAL'}</Text>
            <Text style={s.grandVal}>{S}  {fmt(grandTotal)}</Text>
          </View>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Thank you ── */}
        <Text style={s.thankYou}>Thank You For Choosing ALPRESS</Text>

        {/* ── Footer ── */}
        <View style={s.footerRow}>
          {/* Left: Terms */}
          <View style={s.footerCol}>
            <Text style={s.fHeader}>Terms & Conditions</Text>
            {invoice.payment_term ? (
              <View style={s.fRow}>
                <Text style={s.fLabel}>Payment Term</Text>
                <Text style={s.fVal}>: {invoice.payment_term}</Text>
              </View>
            ) : null}
            {invoice.shipment_term ? (
              <View style={s.fRow}>
                <Text style={s.fLabel}>Shipment Term</Text>
                <Text style={s.fVal}>: {invoice.shipment_term}</Text>
              </View>
            ) : null}
            {invoice.delivery_time ? (
              <View style={s.fRow}>
                <Text style={s.fLabel}>Delivery time</Text>
                <Text style={s.fVal}>: {invoice.delivery_time}</Text>
              </View>
            ) : null}
            {invoice.notes ? (
              <Text style={s.fNote}>{invoice.notes}</Text>
            ) : null}
            <Text style={s.fAddrLabel}>Adres:</Text>
            <Text style={s.fAddrVal}>
              Seyitnizam Mah. Demirciler Sit. 9. Yol No:26{'\n'}
              Zeytinburnu / Istanbul / TURKEY{'\n'}
              Phone: (90212) 416-6505
            </Text>
            <Text style={s.countryOrigin}>COUNTRY OF ORIGIN TURKEY</Text>
          </View>

          {/* Right: Bank */}
          <View style={s.footerCol}>
            <Text style={s.fHeader}>Account Details</Text>
            <View style={s.fRow}>
              <Text style={s.fLabel}>Account Name</Text>
              <Text style={s.fVal}>: {bank.accountName}</Text>
            </View>
            <View style={s.fRow}>
              <Text style={s.fLabel}>Bank Name</Text>
              <Text style={s.fVal}>: {bank.bankName}</Text>
            </View>
            {bank.branchName ? (
              <View style={s.fRow}>
                <Text style={s.fLabel}>Branch Name</Text>
                <Text style={s.fVal}>: {bank.branchName}</Text>
              </View>
            ) : null}
            <View style={s.fRow}>
              <Text style={s.fLabel}>Branch Code</Text>
              <Text style={s.fVal}>: {bank.branchCode}</Text>
            </View>
            <View style={s.fRow}>
              <Text style={s.fLabel}>Swift Code</Text>
              <Text style={s.fVal}>: {bank.swiftCode}</Text>
            </View>
            <View style={s.fRow}>
              <Text style={s.fLabel}>Account Number</Text>
              <Text style={s.fVal}>: {bank.accountNumber}</Text>
            </View>
            <View style={s.fRow}>
              <Text style={s.fLabel}>IBAN NO</Text>
              <Text style={s.fVal}>: {bank.iban}</Text>
            </View>
          </View>
        </View>

        {/* ── Bottom bar ── */}
        <View style={s.bottomBar}>
          <Link src="https://www.alpress.com.tr" style={s.bottomLink}>www.alpress.com.tr</Link>
          <Text style={s.bottomTxt}>Whatsapp : +905497121668</Text>
          <Text style={s.bottomTxt}>alp@alpress.com.tr</Text>
        </View>

      </Page>
    </Document>
  )
}

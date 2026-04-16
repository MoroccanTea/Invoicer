import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Invoice from '@/lib/models/Invoice'
import Config from '@/lib/models/Config'
import { isValidObjectId, invalidIdResponse } from '@/lib/utils/objectId'
import {
  renderToBuffer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 10, padding: 40, backgroundColor: '#ffffff', color: '#111827' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  logo: { width: 64, height: 64, objectFit: 'contain', marginBottom: 8 },
  businessName: { fontSize: 14, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  muted: { fontSize: 9, color: '#6B7280', marginBottom: 2 },
  invoiceTitle: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: '#230082', textAlign: 'right' },
  invoiceNumber: { fontSize: 13, fontFamily: 'Helvetica-Bold', textAlign: 'right', marginTop: 4 },
  invoiceMeta: { fontSize: 9, color: '#6B7280', textAlign: 'right', marginTop: 2 },
  taxBox: { backgroundColor: '#F9FAFB', borderRadius: 4, padding: 10, marginBottom: 20, flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  taxItem: { fontSize: 9 },
  taxLabel: { color: '#6B7280' },
  sectionLabel: { fontSize: 8, color: '#6B7280', fontFamily: 'Helvetica-Bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  clientBox: { backgroundColor: '#F9FAFB', borderRadius: 4, padding: 10, marginBottom: 20 },
  clientName: { fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  tableHeader: { flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: '#E5E7EB', paddingBottom: 6, marginBottom: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', paddingVertical: 6 },
  colDesc: { flex: 3 },
  colQty: { flex: 1, textAlign: 'right' },
  colPrice: { flex: 1.5, textAlign: 'right' },
  colAmt: { flex: 1.5, textAlign: 'right' },
  th: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#374151' },
  td: { fontSize: 9, color: '#374151' },
  totalsWrap: { alignItems: 'flex-end', marginBottom: 24, marginTop: 8 },
  totalsBox: { width: 220 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  totalLabel: { color: '#6B7280' },
  totalValue: { fontFamily: 'Helvetica-Bold' },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 2, borderTopColor: '#E5E7EB', marginTop: 4 },
  totalFinalLabel: { fontFamily: 'Helvetica-Bold', fontSize: 11 },
  totalFinalValue: { fontFamily: 'Helvetica-Bold', fontSize: 13, color: '#230082' },
  bankBox: { backgroundColor: '#F9FAFB', borderRadius: 4, padding: 10, marginBottom: 16 },
  bankTitle: { fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  notesTitle: { fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  notesText: { fontSize: 9, color: '#6B7280' },
  footer: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10, textAlign: 'center', fontSize: 8, color: '#9CA3AF', marginTop: 24 },
  sigRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 32, marginTop: 24 },
  sigBlock: { alignItems: 'center' },
  sigLabel: { fontSize: 9, color: '#6B7280', marginBottom: 6 },
  sigImg: { width: 100, height: 50, objectFit: 'contain' },
})

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!isValidObjectId(id)) return invalidIdResponse()

    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && !session.user.permissions?.invoices?.export) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    const [invoice, config] = await Promise.all([
      Invoice.findById(id)
        .populate('project', 'name')
        .populate('client', 'name ice address city country phone email')
        .lean(),
      Config.findOne().lean(),
    ])

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    const client = invoice.client as any
    const sym = config?.currencySymbol || 'DH'
    const taxName = config?.taxName || 'TVA'

    const doc = (
      <Document>
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              {config?.logo && <Image style={styles.logo} src={config.logo} />}
              <Text style={styles.businessName}>{config?.businessName || 'Your Business'}</Text>
              {config?.businessAddress && <Text style={styles.muted}>{config.businessAddress}</Text>}
              {config?.businessCity && (
                <Text style={styles.muted}>{config.businessCity}, {config.businessCountry}</Text>
              )}
              {config?.businessPhone && <Text style={styles.muted}>Tel: {config.businessPhone}</Text>}
              {config?.businessEmail && <Text style={styles.muted}>{config.businessEmail}</Text>}
            </View>
            <View>
              <Text style={styles.invoiceTitle}>FACTURE</Text>
              <Text style={styles.invoiceNumber}>{invoice.invoiceNumber}</Text>
              <Text style={styles.invoiceMeta}>
                Date: {new Date(invoice.issueDate).toLocaleDateString('fr-FR')}
              </Text>
              <Text style={styles.invoiceMeta}>
                Échéance: {new Date(invoice.dueDate).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          </View>

          {/* Business tax info (Morocco) */}
          {config?.ice && (
            <View style={styles.taxBox}>
              <Text style={styles.taxItem}>
                <Text style={styles.taxLabel}>ICE: </Text>{config.ice}
              </Text>
              {config.identifiantFiscal && (
                <Text style={styles.taxItem}>
                  <Text style={styles.taxLabel}>IF: </Text>{config.identifiantFiscal}
                </Text>
              )}
              {config.taxeProfessionnelle && (
                <Text style={styles.taxItem}>
                  <Text style={styles.taxLabel}>TP: </Text>{config.taxeProfessionnelle}
                </Text>
              )}
              {config.rc && (
                <Text style={styles.taxItem}>
                  <Text style={styles.taxLabel}>RC: </Text>{config.rc}
                </Text>
              )}
            </View>
          )}

          {/* Client */}
          <Text style={styles.sectionLabel}>Facturé à</Text>
          <View style={styles.clientBox}>
            <Text style={styles.clientName}>{client?.name}</Text>
            {client?.ice && <Text style={styles.muted}>ICE: {client.ice}</Text>}
            {client?.address && <Text style={styles.muted}>{client.address}</Text>}
            {client?.city && (
              <Text style={styles.muted}>{client.city}, {client.country}</Text>
            )}
          </View>

          {/* Items table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colDesc]}>Description</Text>
            <Text style={[styles.th, styles.colQty]}>Qté</Text>
            <Text style={[styles.th, styles.colPrice]}>Prix U. (HT)</Text>
            <Text style={[styles.th, styles.colAmt]}>Total (HT)</Text>
          </View>
          {(invoice.items as any[]).map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.td, styles.colDesc]}>{item.description}</Text>
              <Text style={[styles.td, styles.colQty]}>{item.quantity}</Text>
              <Text style={[styles.td, styles.colPrice]}>{fmt(item.unitPrice)}</Text>
              <Text style={[styles.td, styles.colAmt]}>{fmt(item.amount)}</Text>
            </View>
          ))}

          {/* Totals */}
          <View style={styles.totalsWrap}>
            <View style={styles.totalsBox}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sous-total (HT)</Text>
                <Text style={styles.totalValue}>{fmt(invoice.subtotal)} {sym}</Text>
              </View>
              {invoice.taxRate > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>{taxName} ({invoice.taxRate}%)</Text>
                  <Text style={styles.totalValue}>{fmt(invoice.taxAmount)} {sym}</Text>
                </View>
              )}
              <View style={styles.totalFinal}>
                <Text style={styles.totalFinalLabel}>
                  {invoice.taxRate > 0 ? 'Total (TTC)' : 'Total'}
                </Text>
                <Text style={styles.totalFinalValue}>{fmt(invoice.total)} {sym}</Text>
              </View>
            </View>
          </View>

          {/* Banking info */}
          {(config?.bankName || config?.rib || config?.iban) && (
            <View style={styles.bankBox}>
              <Text style={styles.bankTitle}>Informations Bancaires</Text>
              {config.bankName && <Text style={styles.muted}>Banque: {config.bankName}</Text>}
              {config.rib && <Text style={styles.muted}>RIB: {config.rib}</Text>}
              {config.iban && <Text style={styles.muted}>IBAN: {config.iban}</Text>}
            </View>
          )}

          {/* Notes */}
          {invoice.notes && (
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}

          {/* Signatures */}
          {(config?.digitalSignature || config?.digitalStamp) && (
            <View style={styles.sigRow}>
              {config.digitalSignature && (
                <View style={styles.sigBlock}>
                  <Text style={styles.sigLabel}>Signature</Text>
                  <Image style={styles.sigImg} src={config.digitalSignature} />
                </View>
              )}
              {config.digitalStamp && (
                <View style={styles.sigBlock}>
                  <Text style={styles.sigLabel}>Cachet</Text>
                  <Image style={styles.sigImg} src={config.digitalStamp} />
                </View>
              )}
            </View>
          )}

          {/* Footer */}
          {config?.invoiceFooterText && (
            <View style={styles.footer}>
              <Text>{config.invoiceFooterText}</Text>
            </View>
          )}
        </Page>
      </Document>
    )

    const buffer = await renderToBuffer(doc)

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        'Content-Length': String(buffer.length),
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}

import Navbar from '@/components/Navbar'
import InvoiceForm from '@/components/InvoiceForm'

interface Props { searchParams: Promise<{ type?: string }> }

export default async function NewInvoicePage({ searchParams }: Props) {
  const { type } = await searchParams
  const defaultType = type === 'commercial' ? 'commercial' : 'proforma'

  return (
    <div className="min-h-screen">
      <Navbar />
      <InvoiceForm
        mode="create"
        existing={
          defaultType === 'commercial'
            ? ({ invoice_type: 'commercial' } as any)
            : undefined
        }
      />
    </div>
  )
}

import { notFound } from 'next/navigation'
import { getInvoice } from '@/lib/db'
import Navbar from '@/components/Navbar'
import InvoiceForm from '@/components/InvoiceForm'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export default async function EditInvoicePage({ params }: Props) {
  const { id } = await params
  const invoice = getInvoice(Number(id))
  if (!invoice) notFound()

  return (
    <div className="min-h-screen">
      <Navbar />
      <InvoiceForm mode="edit" existing={invoice} />
    </div>
  )
}

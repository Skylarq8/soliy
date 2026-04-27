import { ListingForm } from '@/components/listing/ListingForm'

export const metadata = { title: 'Зар нэмэх — Swaply' }

export default function NewListingPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <h1 className="text-xl font-semibold mb-6">Зар нэмэх</h1>
      <ListingForm />
    </div>
  )
}

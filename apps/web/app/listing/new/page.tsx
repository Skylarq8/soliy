import { ListingForm } from '@/components/listing/ListingForm'

export const metadata = { title: 'Зар нэмэх — Swaply' }

export default function NewListingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Зүйл нэмэх</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          3 алхмаар зураг, мэдээлэл, үнэ/солилцоогоо тохируулаад нийтэлнэ.
        </p>
      </div>
      <ListingForm />
    </div>
  )
}

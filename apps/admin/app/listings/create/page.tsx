import { redirect } from 'next/navigation'
import { ProductWizard } from './ProductWizard'

export const metadata = { title: 'Create Listing' }

export default function CreateListingPage() {
  return (
    <div className="min-h-full bg-[hsl(var(--background))]">
      <ProductWizard />
    </div>
  )
}

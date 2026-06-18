import MasterCrudPage from '@/components/common/MasterCrudPage'
import { brandApi } from '@/api'

export default function BrandsPage() {
  return (
    <MasterCrudPage
      title="Brands"
      api={brandApi}
      fields={[
        { key: 'name',        label: 'Brand Name',   required: true, placeholder: 'e.g. Apple, Samsung' },
        { key: 'description', label: 'Description',  type: 'textarea' },
      ]}
    />
  )
}

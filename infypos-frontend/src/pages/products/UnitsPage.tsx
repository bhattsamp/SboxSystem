import MasterCrudPage from '@/components/common/MasterCrudPage'
import { unitApi } from '@/api'

export default function UnitsPage() {
  return (
    <MasterCrudPage
      title="Units"
      api={unitApi}
      fields={[
        { key: 'name',        label: 'Unit Name',              required: true, placeholder: 'e.g. Piece, Box, Kilogram' },
        { key: 'shortName',   label: 'Short Name (e.g. Pcs)', required: true, placeholder: 'e.g. Pcs, Kg, L' },
        { key: 'description', label: 'Description',           type: 'textarea' },
      ]}
    />
  )
}

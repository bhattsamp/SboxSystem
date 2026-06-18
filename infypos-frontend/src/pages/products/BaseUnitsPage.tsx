import MasterCrudPage from '@/components/common/MasterCrudPage'
import { baseUnitApi } from '@/api'

export default function BaseUnitsPage() {
  return (
    <MasterCrudPage
      title="Base Units"
      api={baseUnitApi}
      fields={[
        { key:'name',      label:'Unit Name',  required:true, placeholder:'e.g. Quantity, Weight' },
        { key:'shortName', label:'Short Name', required:true, placeholder:'e.g. Qty, Kg' },
      ]}
    />
  )
}

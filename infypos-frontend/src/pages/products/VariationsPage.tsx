import MasterCrudPage from '@/components/common/MasterCrudPage'
import { variationApi } from '@/api'

export default function VariationsPage() {
  return (
    <MasterCrudPage
      title="Variations"
      api={variationApi}
      fields={[
        { key:'name',   label:'Attribute Name', required:true, placeholder:'e.g. Color, Size' },
        { key:'values', label:'Values', type:'tags', required:true, placeholder:'Red, Blue, Green' },
      ]}
    />
  )
}

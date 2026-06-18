import MasterCrudPage from '@/components/common/MasterCrudPage'
import { voucherTypeApi } from '@/api'

export default function VoucherTypePage() {
  return (
    <MasterCrudPage
      title="Voucher Types"
      api={voucherTypeApi}
      fields={[
        { key: 'name',   label: 'Voucher Type Name', required: true, placeholder: 'e.g. Cash Sale, Credit Sale' },
        { key: 'module', label: 'Module', type: 'select', required: true,
          options: [{ value: 'sales', label: 'Sales' }, { value: 'purchase', label: 'Purchase' }] },
        { key: 'prefix', label: 'Prefix', placeholder: 'e.g. CS, SO' },
      ]}
    />
  )
}

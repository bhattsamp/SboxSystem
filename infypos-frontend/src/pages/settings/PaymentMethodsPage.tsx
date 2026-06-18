import MasterCrudPage from '@/components/common/MasterCrudPage'
import { paymentMethodApi } from '@/api'

export default function PaymentMethodsPage() {
  return (
    <MasterCrudPage
      title="Payment Methods"
      api={paymentMethodApi}
      fields={[
        { key:'name', label:'Method Name', required:true, placeholder:'e.g. Cash, Card, Bank Transfer' },
      ]}
    />
  )
}

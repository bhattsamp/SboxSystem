import MasterCrudPage from '@/components/common/MasterCrudPage'
import { expenseCategoryApi } from '@/api'

export default function ExpenseCategoriesPage() {
  return (
    <MasterCrudPage
      title="Expense Categories"
      api={expenseCategoryApi}
      fields={[
        { key:'name',        label:'Category Name', required:true, placeholder:'e.g. Rent, Utilities' },
        { key:'description', label:'Description',   type:'textarea' },
      ]}
    />
  )
}

import MasterCrudPage from '@/components/common/MasterCrudPage'
import { categoryApi } from '@/api'

// Scoped API — always operates on root-level (parentCategory=null) categories only
const parentCategoryApi = {
  getAll: (params?: any) => categoryApi.getAll({ ...params, parentCategory: 'null' }),
  create: (data: object) => categoryApi.create({ ...data, parentCategory: null }),
  update: (id: string, data: object) => categoryApi.update(id, data),
  delete: (id: string) => categoryApi.delete(id),
}

export default function ParentCategoriesPage() {
  return (
    <MasterCrudPage
      title="Parent Categories"
      api={parentCategoryApi}
      fields={[
        { key: 'name',        label: 'Category Name', required: true, placeholder: 'e.g. Electronics, Clothing' },
        { key: 'description', label: 'Description',   type: 'textarea' },
      ]}
    />
  )
}

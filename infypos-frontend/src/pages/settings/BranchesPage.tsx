import React from 'react'
import MasterCrudPage from '@/components/common/MasterCrudPage'
import { branchApi } from '@/api'

export default function BranchesPage() {
  return (
    <MasterCrudPage
      title="Branches"
      api={branchApi}
      fields={[
        { key: 'name',    label: 'Branch Name',  required: true, placeholder: 'e.g. Head Office, North Branch' },
        { key: 'code',    label: 'Branch Code',  placeholder: 'e.g. HO, NB' },
        { key: 'phone',   label: 'Phone',        placeholder: '+91 9999 000000' },
        { key: 'email',   label: 'Email',        placeholder: 'branch@company.com' },
        { key: 'address', label: 'Address',      type: 'textarea', placeholder: 'Full address' },
      ]}
    />
  )
}

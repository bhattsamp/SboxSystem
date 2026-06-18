export interface Role {
  _id: string
  name: string
  displayName: string
  permissions: string[]
  isActive: boolean
  createdAt: string
}

export interface Permission {
  _id: string
  name: string
  module: string
  action: string
  description?: string
}

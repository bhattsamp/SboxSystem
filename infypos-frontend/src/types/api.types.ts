export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedData<T> {
  docs: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: PaginatedData<T>
}

export interface PaginationParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  order?: 'asc' | 'desc'
  startDate?: string
  endDate?: string
}

export interface SelectOption<V = string> {
  label: string
  value: V
}

export interface TableColumn<T = any> {
  key?: keyof T
  label: string
  render?: (row: T, index?: number) => React.ReactNode
  className?: string
  sortable?: boolean
  width?: string
}

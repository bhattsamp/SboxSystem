export interface User {
  _id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'manager' | 'cashier'
  avatar?: string
  warehouse?: string
  isActive: boolean
  permissions?: string[]
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
  expiresIn: number
}

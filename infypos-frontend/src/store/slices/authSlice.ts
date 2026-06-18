import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/api/auth.api'
import { storage, TOKEN_KEY, USER_KEY } from '@/utils/storage'
import type { AuthState, User, LoginPayload } from '@/types/auth.types'

// ── Async thunks ──────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  'auth/login',
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(payload)
      return res.data.data as { user: User; token: string }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Login failed')
    }
  }
)

export const getMeThunk = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authApi.me()
      return res.data.data as User
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message)
    }
  }
)

// ── Initial state ─────────────────────────────────────────────
const savedUser = storage.get<User>(USER_KEY)
const savedToken = storage.get<string>(TOKEN_KEY)

const initialState: AuthState = {
  user:            savedUser,
  token:           savedToken,
  isAuthenticated: !!savedToken,
  loading:         false,
  error:           null,
}

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user            = action.payload.user
      state.token           = action.payload.token
      state.isAuthenticated = true
      state.error           = null
      storage.set(TOKEN_KEY, action.payload.token)
      storage.set(USER_KEY,  action.payload.user)
    },
    logout(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      storage.remove(TOKEN_KEY)
      storage.remove(USER_KEY)
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      storage.set(USER_KEY, action.payload)
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true
        state.error   = null
      })
      .addCase(loginThunk.fulfilled, (state, { payload }) => {
        state.loading         = false
        state.user            = payload.user
        state.token           = payload.token
        state.isAuthenticated = true
        storage.set(TOKEN_KEY, payload.token)
        storage.set(USER_KEY,  payload.user)
      })
      .addCase(loginThunk.rejected, (state, { payload }) => {
        state.loading = false
        state.error   = payload as string
      })
      // getMe
      .addCase(getMeThunk.fulfilled, (state, { payload }) => {
        state.user = payload
        storage.set(USER_KEY, payload)
      })
      .addCase(getMeThunk.rejected, (state) => {
        state.user            = null
        state.token           = null
        state.isAuthenticated = false
        storage.remove(TOKEN_KEY)
        storage.remove(USER_KEY)
      })
  },
})

export const { setCredentials, logout, updateUser, clearError } = authSlice.actions
export default authSlice.reducer

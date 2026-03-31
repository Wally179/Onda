// ─── Entidades do Domínio ──────────────────────────────────────────────

export interface User {
  id: string
  name: string
  document: string
}

export interface StoredUser extends User {
  password: string
}

export interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  category: 'salary' | 'restaurant' | 'shopping' | 'transfer_out' | 'transfer_in' | 'other'
  amount: number
  date: string
  description: string
}

// ─── Payloads de Requisição ────────────────────────────────────────────

export interface LoginPayload {
  document: string
  password: string
}

export interface RegisterPayload {
  name: string
  document: string
  password: string
}

export interface TransferPayload {
  receiverName: string
  amount: number
}

// ─── Respostas da API ──────────────────────────────────────────────────

export interface AuthResponse {
  user: User
  token: string
}

export interface BalanceResponse {
  balance: number
}

export interface TransferResponse {
  success: boolean
  transaction: Transaction
}

export interface ApiError {
  message: string
}

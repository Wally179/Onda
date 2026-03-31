import type { StoredUser, Transaction, User } from '../types'

// ─── Estado Em-Memória (reseta no F5) ──────────────────────────────────
// Funciona como um "banco de dados" volátil para simulação de fluxos.
// Toda a memória é destruída quando o Service Worker reinicia (reload).

const INITIAL_BALANCE = 14500.00
const NEW_USER_BONUS = 1500.00

const SEED_USER: StoredUser = {
  id: '1',
  name: 'João Banco',
  email: 'joao@onda.com.br',
  password: '123456',
}

const SEED_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INCOME',  category: 'salary',       amount: 15000.00, date: new Date().toISOString(),                          description: 'Salário Mensal' },
  { id: 't2', type: 'EXPENSE', category: 'restaurant',    amount: 120.50,   date: new Date(Date.now() - 86400000).toISOString(),     description: 'Osteria Bella' },
  { id: 't3', type: 'EXPENSE', category: 'shopping',      amount: 350.00,   date: new Date(Date.now() - 172800000).toISOString(),    description: 'Amazon.com' },
  { id: 't4', type: 'EXPENSE', category: 'transfer_out',  amount: 29.50,    date: new Date(Date.now() - 259200000).toISOString(),    description: 'Pix Enviado (João)' },
]

// ─── Runtime State ─────────────────────────────────────────────────────

let users: StoredUser[] = [{ ...SEED_USER }]
let balances: Record<string, number> = { '1': INITIAL_BALANCE }
let userTransactions: Record<string, Transaction[]> = { '1': [...SEED_TRANSACTIONS] }
let nextId = 2

// ─── Repositories (funções puras de acesso) ────────────────────────────

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find(u => u.email === email)
}

export function findUserById(id: string): StoredUser | undefined {
  return users.find(u => u.id === id)
}

export function searchUsers(query: string, excludeId?: string): User[] {
  const cleanQuery = query.toLowerCase().trim()
  if (!cleanQuery) return []

  return users
    .filter(u => 
      u.id !== excludeId && 
      (u.name.toLowerCase().includes(cleanQuery) || u.email.toLowerCase().includes(cleanQuery))
    )
    .map(({ id, name, email }) => ({ id, name, email }))
}

export function registerUser(name: string, email: string, password: string): StoredUser {
  const user: StoredUser = {
    id: String(nextId++),
    name,
    email,
    password,
  }
  users.push(user)
  balances[user.id] = NEW_USER_BONUS
  userTransactions[user.id] = [
    { 
      id: Math.random().toString(36).slice(2), 
      type: 'INCOME', 
      category: 'other', 
      amount: NEW_USER_BONUS, 
      date: new Date().toISOString(), 
      description: 'Bônus de Boas-vindas' 
    }
  ]
  return user
}

export function getBalance(userId: string): number {
  return balances[userId] ?? 0
}

export function debitBalance(userId: string, amount: number): boolean {
  const current = balances[userId] ?? 0
  if (amount > current) return false
  balances[userId] = current - amount
  return true
}

export function creditBalance(userId: string, amount: number): void {
  const current = balances[userId] ?? 0
  balances[userId] = current + amount
}

export function getTransactions(userId: string): Transaction[] {
  return userTransactions[userId] ?? []
}

export function addTransaction(userId: string, tx: Omit<Transaction, 'id'>): Transaction {
  const full: Transaction = { ...tx, id: Math.random().toString(36).slice(2) }
  if (!userTransactions[userId]) userTransactions[userId] = []
  userTransactions[userId].unshift(full)
  return full
}

import type { StoredUser, Transaction } from '../types'

// ─── Estado Em-Memória (reseta no F5) ──────────────────────────────────
// Funciona como um "banco de dados" volátil para simulação de fluxos.
// Toda a memória é destruída quando o Service Worker reinicia (reload).

const INITIAL_BALANCE = 14500.00

const SEED_USER: StoredUser = {
  id: '1',
  name: 'João Banco',
  document: '12345678909',
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
let balance = INITIAL_BALANCE
let transactions: Transaction[] = [...SEED_TRANSACTIONS]
let nextId = 2

// ─── Repositories (funções puras de acesso) ────────────────────────────

export function findUserByDocument(document: string): StoredUser | undefined {
  return users.find(u => u.document === document)
}

export function registerUser(name: string, document: string, password: string): StoredUser {
  const user: StoredUser = {
    id: String(nextId++),
    name,
    document,
    password,
  }
  users.push(user)
  return user
}

export function getBalance(): number {
  return balance
}

export function debitBalance(amount: number): boolean {
  if (amount > balance) return false
  balance -= amount
  return true
}

export function getTransactions(): Transaction[] {
  return transactions
}

export function addTransaction(tx: Omit<Transaction, 'id'>): Transaction {
  const full: Transaction = { ...tx, id: Math.random().toString(36).slice(2) }
  transactions.unshift(full)
  return full
}

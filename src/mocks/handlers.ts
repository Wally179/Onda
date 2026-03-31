import { http, HttpResponse, delay } from 'msw'
import type { LoginPayload, RegisterPayload, TransferPayload } from '../types'
import {
  findUserByDocument,
  registerUser,
  getBalance,
  debitBalance,
  getTransactions,
  addTransaction,
} from './database'

// ─── Helpers ───────────────────────────────────────────────────────────

function errorResponse(message: string, status: number) {
  return new HttpResponse(JSON.stringify({ message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function generateToken(userId: string): string {
  return `mock-jwt-${userId}-${Date.now().toString(36)}`
}

// ─── Handlers ──────────────────────────────────────────────────────────

export const handlers = [

  // ── Auth: Login ────────────────────────────────────────────────────
  http.post('/api/login', async ({ request }) => {
    const body = (await request.json()) as LoginPayload
    await delay(800)

    const user = findUserByDocument(body.document)
    if (!user || user.password !== body.password) {
      return errorResponse('CPF ou senha incorretos', 401)
    }

    return HttpResponse.json({
      user: { id: user.id, name: user.name, document: user.document },
      token: generateToken(user.id),
    })
  }),

  // ── Auth: Cadastro ─────────────────────────────────────────────────
  http.post('/api/register', async ({ request }) => {
    const body = (await request.json()) as RegisterPayload
    await delay(1000)

    if (findUserByDocument(body.document)) {
      return errorResponse('CPF já cadastrado no sistema', 409)
    }

    const user = registerUser(body.name, body.document, body.password)

    return HttpResponse.json(
      { user: { id: user.id, name: user.name, document: user.document } },
      { status: 201 },
    )
  }),

  // ── Account: Saldo ─────────────────────────────────────────────────
  http.get('/api/account/balance', async () => {
    await delay(400)
    return HttpResponse.json({ balance: getBalance() })
  }),

  // ── Account: Extrato ───────────────────────────────────────────────
  http.get('/api/account/transactions', async () => {
    await delay(600)
    return HttpResponse.json(getTransactions())
  }),

  // ── Account: Transferência ─────────────────────────────────────────
  http.post('/api/account/transfer', async ({ request }) => {
    const body = (await request.json()) as TransferPayload
    await delay(1200)

    if (!debitBalance(body.amount)) {
      return errorResponse('Saldo insuficiente na conta', 400)
    }

    const transaction = addTransaction({
      type:        'EXPENSE',
      category:    'transfer_out',
      amount:      body.amount,
      date:        new Date().toISOString(),
      description: `Pix Enviado (${body.receiverName})`,
    })

    return HttpResponse.json({ success: true, transaction })
  }),
]

import { http, HttpResponse, delay } from 'msw'
import type { LoginPayload, RegisterPayload, TransferPayload } from '../types'
import {
  findUserByDocument,
  registerUser,
  getBalance,
  debitBalance,
  getTransactions,
  addTransaction,
  searchUsers,
  creditBalance,
  findUserById,
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

function getUserIdFromRequest(request: Request): string | null {
  const auth = request.headers.get('Authorization')
  if (!auth || !auth.startsWith('Bearer mock-jwt-')) return null
  return auth.split('-')[2] // Extrai o ID do token mock: mock-jwt-{ID}-{TIMESTAMP}
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

  // ── Users: Busca ───────────────────────────────────────────────────
  http.get('/api/users', async ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const currentUserId = getUserIdFromRequest(request)

    await delay(300)
    return HttpResponse.json(searchUsers(q, currentUserId || undefined))
  }),

  // ── Account: Saldo ─────────────────────────────────────────────────
  http.get('/api/account/balance', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return errorResponse('Não autorizado', 401)

    await delay(400)
    return HttpResponse.json({ balance: getBalance(userId) })
  }),

  // ── Account: Extrato ───────────────────────────────────────────────
  http.get('/api/account/transactions', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return errorResponse('Não autorizado', 401)

    await delay(600)
    return HttpResponse.json(getTransactions(userId))
  }),

  // ── Account: Transferência ─────────────────────────────────────────
  http.post('/api/account/transfer', async ({ request }) => {
    const userId = getUserIdFromRequest(request)
    if (!userId) return errorResponse('Não autorizado', 401)

    const body = (await request.json()) as TransferPayload
    await delay(1200)

    // 1. Debita o remetente
    if (!debitBalance(userId, body.amount)) {
      return errorResponse('Saldo insuficiente na conta', 400)
    }

    // 2. Registra transação de saída
    const senderTx = addTransaction(userId, {
      type:        'EXPENSE',
      category:    'transfer_out',
      amount:      body.amount,
      date:        new Date().toISOString(),
      description: `Pix Enviado (${body.receiverName})`,
    })

    // 3. Se houver receiverId, credita o destinatário
    if (body.receiverId) {
      const sender = findUserById(userId)
      creditBalance(body.receiverId, body.amount)
      addTransaction(body.receiverId, {
        type:        'INCOME',
        category:    'transfer_in',
        amount:      body.amount,
        date:        new Date().toISOString(),
        description: `Pix Recebido de ${sender?.name || 'Usuário'}`,
      })
    }

    return HttpResponse.json({ success: true, transaction: senderTx })
  }),
]

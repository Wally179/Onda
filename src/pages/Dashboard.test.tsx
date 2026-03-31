import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dashboard } from './Dashboard'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { api } from '../services/api'
import MockAdapter from 'axios-mock-adapter'

const mockApi = new MockAdapter(api)

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Dashboard UX Flows', () => {
  const mockTransactions = [
    { id: '1', type: 'INCOME', category: 'salary', amount: 5000, date: new Date().toISOString(), description: 'Pix Recebido' },
    { id: '2', type: 'EXPENSE', category: 'shopping', amount: 150, date: new Date().toISOString(), description: 'Mercado' }
  ]

  beforeEach(() => {
    mockApi.reset()
    mockApi.onGet('/account/balance').reply(200, { balance: 10000 })
    mockApi.onGet('/account/transactions').reply(200, mockTransactions)
  })

  it('deve alternar a visibilidade do saldo ao clicar no ícone do olhinho', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard />)

    // Aguarda o saldo carregar e ser exibido
    await waitFor(() => {
      expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument()
    })

    // Clica no olhinho para ocultar
    const toggleButton = screen.getByRole('button', { name: /Alternar exibição de saldo/i })
    await user.click(toggleButton)

    // Saldo original some, e entra a máscara (••••••••)
    expect(screen.queryByText('R$ 10.000,00')).not.toBeInTheDocument()
    expect(screen.getByText('••••••••')).toBeInTheDocument()

    // Clica novamente para mostrar
    await user.click(toggleButton)
    expect(screen.getByText('R$ 10.000,00')).toBeInTheDocument()
  })

  it('deve filtrar as transações nas abas Corretamente', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Dashboard />)

    // Carrega a listagem global (All) -> Deve ter Pix Recebido E Mercado
    await waitFor(() => {
      expect(screen.getByText('Pix Recebido')).toBeInTheDocument()
      expect(screen.getByText('Mercado')).toBeInTheDocument()
    })

    // Filtra Entradas
    const incomeFilter = screen.getByRole('button', { name: /Entradas/i })
    await user.click(incomeFilter)

    await waitFor(() => {
      expect(screen.getByText('Pix Recebido')).toBeInTheDocument()
      expect(screen.queryByText('Mercado')).not.toBeInTheDocument()
    })

    // Filtra Saídas
    const expenseFilter = screen.getByRole('button', { name: /Saídas/i })
    await user.click(expenseFilter)

    await waitFor(() => {
      expect(screen.queryByText('Pix Recebido')).not.toBeInTheDocument()
      expect(screen.getByText('Mercado')).toBeInTheDocument()
    })
  })
})

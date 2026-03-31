import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransferModal } from './TransferModal'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api } from '../services/api'
import MockAdapter from 'axios-mock-adapter'

const mockApi = new MockAdapter(api)

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}

describe('TransferModal (Fluxo de Transferência)', () => {
  it('deve renderizar o modal quando clicar no botão e executar transferência', async () => {
    mockApi.onGet('/users').reply(200, [])
    mockApi.onPost('/account/transfer').reply(200, { success: true })
    const user = userEvent.setup()

    renderWithClient(<TransferModal />)

    // Abre o modal
    const button = screen.getByRole('button', { name: /transferir/i })
    await user.click(button)

    expect(screen.getByText('Nova Transferência')).toBeInTheDocument()

    // Preenche os dados
    const nameInput = screen.getByLabelText(/Para quem/i)
    const amountInput = screen.getByLabelText(/^Valor$/i)

    await user.type(nameInput, 'Maria da Silva')
    await user.type(amountInput, '150.00')

    // Confirma
    const confirmButton = screen.getByRole('button', { name: /Confirmar Envio/i })
    await user.click(confirmButton)

    // Verifica mock
    await waitFor(() => {
      expect(mockApi.history.post.length).toBe(1)
      expect(JSON.parse(mockApi.history.post[0].data)).toMatchObject({
        receiverName: 'Maria da Silva',
        amount: 150
      })
    })
  })
})

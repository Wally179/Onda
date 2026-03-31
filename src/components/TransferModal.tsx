import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Send, CheckCircle2, Loader2, User as UserIcon, Search } from 'lucide-react'
import type { User } from '@/types'

const schema = z.object({
  receiverName: z.string().min(3, 'Insira pelo menos 3 caracteres'),
  amount: z.string().refine(v => {
    const n = parseFloat(v.replace(',', '.'))
    return !isNaN(n) && n > 0
  }, 'Informe um valor válido')
})

type Form = z.infer<typeof schema>

// ─── Underline Input ───────────────────────────────────────────────────
function UnderlineField({
  id, label, prefix, placeholder, type = 'text', step,
  registration, error, icon: Icon
}: {
  id: string, label: string, prefix?: string, placeholder: string,
  type?: string, step?: string,
  registration: object, error?: string, icon?: any
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500">
        {label}
      </label>
      <div className="relative flex items-center group">
        {prefix && <span className="text-slate-500 text-sm font-bold mr-1 shrink-0">{prefix}</span>}
        <input
          id={id}
          type={type}
          step={step}
          placeholder={placeholder}
          autoComplete="off"
          {...registration}
          className={`
            w-full bg-transparent border-b-2 pb-2 pt-1 text-slate-800 font-semibold text-lg
            outline-none placeholder:text-slate-300
            transition-all duration-200
            ${error ? 'border-red-400' : 'border-slate-200 focus:border-sky-500'}
          `}
        />
        {Icon && (
          <Icon className="absolute right-0 bottom-3 w-4 h-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-semibold text-red-500 pt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Progress Bar ───────────────────────────────────────────────────────
function CountdownBar({ duration }: { duration: number }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1 mt-8 overflow-hidden">
      <motion.div
        className="h-full bg-emerald-400 rounded-full"
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
      />
    </div>
  )
}

// ─── Modal ──────────────────────────────────────────────────────────────
export function TransferModal() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form')
  const [receiverId, setReceiverId] = useState<string | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  
  const queryClient = useQueryClient()

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<Form>({
    resolver: zodResolver(schema)
  })

  const nameVal = watch('receiverName') ?? ''
  const amtVal = watch('amount') ?? ''

  // Search logic
  const { data: users, isFetching } = useQuery({
    queryKey: ['users-search', nameVal],
    queryFn: async () => {
      const { data } = await api.get<User[]>(`/users?q=${nameVal}`)
      return data
    },
    enabled: nameVal.length >= 3 && !receiverId,
    staleTime: 5000
  })

  // Show search results if we have matches and input is focused (simulated by length)
  useEffect(() => {
    if (users && users.length > 0 && nameVal.length >= 3 && !receiverId) {
      setShowSearch(true)
    } else {
      setShowSearch(false)
    }
  }, [users, nameVal, receiverId])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => { 
        setStep('form')
        setReceiverId(null)
        setShowSearch(false)
        reset() 
      }, 400)
      return () => clearTimeout(t)
    }
  }, [open, reset])

  // Auto close 3 s after success
  useEffect(() => {
    if (step === 'success') {
      const t = setTimeout(() => setOpen(false), 3000)
      return () => clearTimeout(t)
    }
  }, [step])

  const { mutate } = useMutation({
    mutationFn: async (data: Form) => {
      setStep('loading')
      await api.post('/account/transfer', {
        receiverName: data.receiverName,
        amount: parseFloat(data.amount.replace(',', '.')),
        receiverId: receiverId || undefined
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] })
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      setStep('success')
    },
    onError: (err: any) => {
      setStep('form')
      toast.error(err.response?.data?.message ?? 'Erro na transferência')
    }
  })

  const selectUser = (user: User) => {
    setValue('receiverName', user.name)
    setReceiverId(user.id)
    setShowSearch(false)
  }

  // Clear receiverId if name changes after selection
  useEffect(() => {
    if (receiverId && nameVal !== users?.find(u => u.id === receiverId)?.name) {
      setReceiverId(null)
    }
  }, [nameVal, receiverId, users])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Transferir"
          className="
            inline-flex items-center gap-2 h-11 px-6
            rounded-full font-semibold text-sm
            bg-primary text-primary-foreground
            hover:brightness-105 hover:shadow-lg hover:shadow-primary/25
            active:scale-[0.97] transition-all duration-200
          "
        >
          <Send className="w-4 h-4" />
          Transferir
        </button>
      </DialogTrigger>

      <DialogContent
        className="p-0 gap-0 border-0 overflow-hidden
          sm:rounded-[2.5rem] bg-white shadow-2xl shadow-slate-900/10
          sm:max-w-[420px]"
      >
        <AnimatePresence mode="wait">

          {/* ── FORM ─────────────────────────── */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="p-9 space-y-8"
            >
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight leading-snug">
                    Nova Transferência
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Pix instantâneo · sem taxas
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-50" />

              {/* Fields */}
              <form onSubmit={handleSubmit(d => mutate(d))} className="space-y-7 relative">
                <div className="relative">
                  <UnderlineField
                    id="receiverName"
                    label="Para quem"
                    placeholder="Nome, CPF ou Chave Pix"
                    registration={register('receiverName')}
                    error={errors.receiverName?.message}
                    icon={receiverId ? UserIcon : Search}
                  />

                  {/* Search Results Dropdown */}
                  <AnimatePresence>
                    {showSearch && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-50 left-0 right-0 top-[100%] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                      >
                        <div className="p-2 max-h-[200px] overflow-y-auto">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
                            Sugestões encontradas
                          </p>
                          {users?.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => selectUser(user)}
                              className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                            >
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:bg-white transition-colors">
                                <UserIcon className="w-4 h-4 text-primary" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{user.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium">CPF: {user.document.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <UnderlineField
                  id="amount"
                  label="Valor"
                  prefix="R$"
                  placeholder="0,00"
                  type="number"
                  step="0.01"
                  registration={register('amount')}
                  error={errors.amount?.message}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={nameVal.length < 3 || !amtVal || isFetching}
                    className="
                      w-full h-14 rounded-2xl font-bold text-base
                      bg-slate-900 text-white
                      hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20
                      active:scale-[0.98] transition-all duration-200
                      disabled:bg-slate-100 disabled:text-slate-300 disabled:pointer-events-none
                      flex items-center justify-center gap-2
                    "
                  >
                    {isFetching ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      'Confirmar Envio'
                    )}
                  </button>
                  {receiverId && (
                    <p className="text-center text-[10px] text-emerald-500 font-bold mt-3 uppercase tracking-wider">
                      ✨ Transferência entre contas Onda
                    </p>
                  )}
                </div>
              </form>
            </motion.div>
          )}

          {/* ── LOADING ───────────────────────── */}
          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-9 flex flex-col items-center justify-center gap-5 min-h-[320px]"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="text-center">
                <p className="font-bold text-slate-800 text-lg">Processando...</p>
                <p className="text-sm text-slate-400 mt-1">Isso leva só um segundo.</p>
              </div>
            </motion.div>
          )}

          {/* ── SUCCESS ──────────────────────── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
              className="p-9 flex flex-col items-center justify-center text-center min-h-[320px]"
            >
              <motion.div
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', bounce: 0.55, duration: 0.7 }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-400 blur-2xl opacity-20 scale-150" />
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center relative z-10">
                  <CheckCircle2 className="w-11 h-11 text-emerald-500" strokeWidth={1.8} />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Enviado!</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">
                Transferência realizada com sucesso.
              </p>

              <CountdownBar duration={3000} />
              <p className="text-[11px] text-slate-300 mt-3 font-medium tracking-wide uppercase">
                Fechando em 3 segundos
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

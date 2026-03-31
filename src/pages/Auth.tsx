import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/useAuthStore'
import { Waves, Loader2 } from 'lucide-react'
import type { AuthResponse } from '@/types'

// ─── Schemas ───────────────────────────────────────────────────────────

const loginSchema = z.object({
  document: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = z.object({
  name: z.string().min(3, 'Nome muito curto'),
  document: z.string().min(11, 'CPF inválido').max(14, 'CPF inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

// ─── Underline Input ───────────────────────────────────────────────────

function Field({
  id, label, type = 'text', placeholder, registration, error,
}: {
  id: string; label: string; type?: string; placeholder: string
  registration: object; error?: string
}) {
  return (
    <div className="space-y-1 group">
      <label
        htmlFor={id}
        className="block text-[11px] font-bold tracking-[0.12em] uppercase text-slate-400 transition-colors group-focus-within:text-primary"
      >
        {label}
      </label>
      <input
        id={id} type={type} placeholder={placeholder} autoComplete="off"
        {...registration}
        className={`
          w-full bg-transparent border-b-2 pb-2 pt-1 text-slate-800 font-semibold text-base
          outline-none placeholder:text-slate-200 transition-colors duration-200
          ${error ? 'border-red-400' : 'border-slate-100 focus:border-primary'}
        `}
      />
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="text-[11px] font-semibold text-red-500 pt-0.5"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────

type Tab = 'login' | 'register'

export function Auth() {
  const [tab, setTab] = useState<Tab>('login')
  const login = useAuthStore(s => s.login)

  // ── Login Form ─────────────────────────────────────────────────────
  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  const handleLogin = async (data: LoginForm) => {
    try {
      const res = await api.post<AuthResponse>('/login', {
        document: data.document.replace(/\D/g, ''),
        password: data.password,
      })
      login(res.data.user, res.data.token)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Credenciais inválidas'
      toast.error(msg)
    }
  }

  // ── Register Form ──────────────────────────────────────────────────
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const handleRegister = async (data: RegisterForm) => {
    try {
      await api.post('/register', {
        name: data.name,
        document: data.document.replace(/\D/g, ''),
        password: data.password,
      })
      toast.success('Conta criada! Faça login para continuar.')
      registerForm.reset()
      setTab('login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        .response?.data?.message ?? 'Erro ao cadastrar'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-blobs flex flex-col justify-center py-12 px-4">
      {/* ── Branding ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-[400px] text-center content-z mb-8"
      >
        <div className="mx-auto h-14 w-14 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-white/50 mb-5">
          <Waves className="h-7 w-7 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Onda Finance</h1>
        <p className="mt-1.5 text-sm text-slate-400 font-medium">A fluidez que o seu dinheiro merece.</p>
      </motion.div>

      {/* ── Card ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mx-auto w-full max-w-[400px] content-z"
      >
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-900/5 overflow-hidden">

          {/* ── Tabs ────────────────────────────────────────── */}
          <div className="flex border-b border-slate-50">
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`
                  flex-1 py-4 text-sm font-bold tracking-wide uppercase transition-colors relative
                  ${tab === t ? 'text-primary' : 'text-slate-300 hover:text-slate-400'}
                `}
              >
                {t === 'login' ? 'Entrar' : 'Criar Conta'}
                {tab === t && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 inset-x-0 h-[2px] bg-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* ── Form Content ────────────────────────────────── */}
          <div className="p-9">
            <AnimatePresence mode="wait">
              {tab === 'login' ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-7">
                    <h2 className="text-xl font-bold text-slate-800">Bem-vindo de volta</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Insira suas credenciais para acessar.</p>
                  </div>

                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-6">
                    <Field
                      id="login-document" label="CPF" placeholder="123.456.789-09"
                      registration={loginForm.register('document')}
                      error={loginForm.formState.errors.document?.message}
                    />
                    <Field
                      id="login-password" label="Senha" type="password" placeholder="••••••"
                      registration={loginForm.register('password')}
                      error={loginForm.formState.errors.password?.message}
                    />

                    <button
                      type="submit"
                      disabled={loginForm.formState.isSubmitting}
                      className="w-full h-13 py-3.5 rounded-2xl font-bold text-base bg-primary text-primary-foreground
                        hover:brightness-105 hover:shadow-lg hover:shadow-primary/25
                        active:scale-[0.98] transition-all duration-200
                        disabled:opacity-50 disabled:pointer-events-none
                        flex items-center justify-center gap-2 mt-3"
                    >
                      {loginForm.formState.isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Autenticando...</>
                      ) : 'Entrar'}
                    </button>
                  </form>

                  <p className="text-center text-[11px] text-slate-300 mt-6 font-medium tracking-wide">
                    DEMO &middot; CPF 12345678909 &middot; Senha 123456
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-7">
                    <h2 className="text-xl font-bold text-slate-800">Crie sua conta</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Preencha os dados abaixo para começar.</p>
                  </div>

                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                    <Field
                      id="reg-name" label="Nome Completo" placeholder="Maria da Silva"
                      registration={registerForm.register('name')}
                      error={registerForm.formState.errors.name?.message}
                    />
                    <Field
                      id="reg-document" label="CPF" placeholder="123.456.789-09"
                      registration={registerForm.register('document')}
                      error={registerForm.formState.errors.document?.message}
                    />
                    <Field
                      id="reg-password" label="Senha" type="password" placeholder="Mínimo 6 caracteres"
                      registration={registerForm.register('password')}
                      error={registerForm.formState.errors.password?.message}
                    />
                    <Field
                      id="reg-confirm" label="Confirmar Senha" type="password" placeholder="Repita a senha"
                      registration={registerForm.register('confirmPassword')}
                      error={registerForm.formState.errors.confirmPassword?.message}
                    />

                    <button
                      type="submit"
                      disabled={registerForm.formState.isSubmitting}
                      className="w-full h-13 py-3.5 rounded-2xl font-bold text-base bg-primary text-primary-foreground
                        hover:brightness-105 hover:shadow-lg hover:shadow-primary/25
                        active:scale-[0.98] transition-all duration-200
                        disabled:opacity-50 disabled:pointer-events-none
                        flex items-center justify-center gap-2 mt-2"
                    >
                      {registerForm.formState.isSubmitting ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Cadastrando...</>
                      ) : 'Criar Conta'}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

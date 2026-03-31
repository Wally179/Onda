import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Variants } from 'framer-motion'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/useAuthStore'
import { TransferModal } from '@/components/TransferModal'
import { Table, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { LogOut, Waves, ArrowRightLeft, CreditCard, ShoppingBag, Utensils, RefreshCw, Wallet, Eye, EyeOff } from 'lucide-react'
import type { Transaction } from '@/types'
import { StatusBadge } from '@/components/ui/status-badge'

// Map icons against categories
const getCategoryIcon = (category: Transaction['category'], type: Transaction['type']) => {
  if (type === 'INCOME') return <Wallet className="h-5 w-5 text-emerald-500" />
  switch (category) {
    case 'restaurant': return <Utensils className="h-5 w-5 text-orange-500" />
    case 'shopping': return <ShoppingBag className="h-5 w-5 text-purple-500" />
    case 'transfer_out': return <ArrowRightLeft className="h-5 w-5 text-blue-500" />
    default: return <CreditCard className="h-5 w-5 text-slate-500" />
  }
}

const getCategoryColor = (category: Transaction['category'], type: Transaction['type']) => {
  if (type === 'INCOME') return 'bg-emerald-100/50'
  switch (category) {
    case 'restaurant': return 'bg-orange-100/50'
    case 'shopping': return 'bg-purple-100/50'
    case 'transfer_out': return 'bg-blue-100/50'
    default: return 'bg-slate-100/50'
  }
}

// Framer animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
}
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
}

type FilterType = 'ALL' | 'INCOME' | 'EXPENSE'

export function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [showBalance, setShowBalance] = useState(true)
  const [filter, setFilter] = useState<FilterType>('ALL')

  const { data: balanceData, isLoading: loadingBalance, refetch: refetchBalance } = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.get<{ balance: number }>('/account/balance').then(r => r.data),
  })

  const { data: transactions, isLoading: loadingTransactions, refetch: refetchTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.get<Transaction[]>('/account/transactions').then(r => r.data),
  })

  const handleRefresh = async () => {
    await Promise.all([refetchBalance(), refetchTransactions()])
    toast.success('Informações atualizadas!')
  }

  const filteredTransactions = useMemo(() => {
    if (!transactions) return []
    if (filter === 'ALL') return transactions
    return transactions.filter(t => t.type === filter)
  }, [transactions, filter])

  return (
    <div className="min-h-screen bg-blobs font-sans flex flex-col">
      {/* Premium Top Navigation */}
      <header className="sticky top-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Waves className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-slate-800">Onda</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 mr-4 text-sm font-medium text-slate-600 bg-white/50 px-4 py-2 rounded-full border border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user?.name?.split(' ')[0]}
            </div>
            <Button variant="ghost" size="icon" onClick={logout} title="Sair" className="hover:bg-red-50 hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6 content-z">
        
        <div className="flex justify-between items-end w-full">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Visão geral da conta</p>
          </div>
          <div className="flex gap-2">
            <motion.div whileHover={{ scale: 1.05, filter: 'brightness(1.1)' }} whileTap={{ rotate: 360, transition: { duration: 0.5 } }}>
              <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loadingBalance || loadingTransactions} className="bg-white/80 border-slate-200 shadow-sm rounded-xl hover:bg-slate-100 transition-colors">
                <RefreshCw className={`h-4 w-4 text-slate-600 ${loadingBalance || loadingTransactions ? 'animate-spin' : ''}`} />
              </Button>
            </motion.div>
            <TransferModal />
          </div>
        </div>

        {/* Hero Card - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="glass-panel overflow-hidden relative rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            {/* Decorative glare */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full"></div>
            
            <div className="relative z-10 w-full sm:w-auto">
              <div className="flex items-center gap-3 mb-2">
                <p className="text-blue-900/60 font-medium text-sm uppercase tracking-widest">Saldo Disponível</p>
                <button 
                  onClick={() => setShowBalance(!showBalance)} 
                  className="text-blue-900/40 hover:text-blue-900/80 transition-colors p-1"
                  aria-label="Alternar exibição de saldo"
                >
                  {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="h-12 flex items-center">
                {loadingBalance ? (
                  <div className="animate-pulse bg-white/50 h-10 w-48 rounded-lg mt-1"></div>
                ) : (
                  <h2 className="text-4xl sm:text-5xl font-bold text-blue-950 tracking-tighter">
                   {showBalance 
                     ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(balanceData?.balance || 0)
                     : '••••••••'}
                  </h2>
                )}
              </div>
            </div>
            
            <div className="relative z-10 mt-4 sm:mt-0 flex flex-row sm:flex-col gap-2 bg-white/40 p-3 px-5 rounded-2xl border border-white/50 backdrop-blur-md">
               <div className="text-xs font-semibold text-blue-900/50 uppercase tracking-widest">Rendimento</div>
               <div className="font-bold text-blue-900 text-lg flex items-center gap-1.5">+104% CDI</div>
            </div>
          </div>
        </motion.div>

        {/* Transactions Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card rounded-3xl overflow-hidden flex flex-col"
        >
          <div className="p-5 sm:px-8 border-b border-white/40 bg-white/40 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <h3 className="font-semibold text-lg text-slate-800">Extrato Recente</h3>
            
            {/* Transaction Filters */}
            <div className="flex bg-slate-100/50 p-1 rounded-xl w-full sm:w-auto overflow-x-auto custom-scrollbar">
              <button 
                onClick={() => setFilter('ALL')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'ALL' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Tudo
              </button>
              <button 
                onClick={() => setFilter('INCOME')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'INCOME' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Entradas
              </button>
              <button 
                onClick={() => setFilter('EXPENSE')}
                className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${filter === 'EXPENSE' ? 'bg-white shadow-sm text-red-500' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Saídas
              </button>
            </div>
          </div>
          
          <div className="p-2 sm:px-6 sm:py-4">
            {loadingTransactions ? (
              <div className="space-y-3 p-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-4 p-2 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200/50" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 w-32 bg-slate-200/50 rounded-md" />
                      <div className="h-3 w-20 bg-slate-200/50 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Table className="border-collapse">
                <TableHeader>
                  <TableRow className="border-b-0 hover:bg-transparent">
                    <TableHead className="w-[60px]"></TableHead>
                    <TableHead>Histórico</TableHead>
                    <TableHead className="text-right pr-4">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <motion.tbody
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="[&_tr:last-child]:border-0"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredTransactions?.length === 0 ? (
                      <motion.tr variants={itemVariants} initial="hidden" animate="show" exit="exit" layout>
                        <TableCell colSpan={4} className="text-center py-10 text-slate-400 font-medium">
                          Nenhuma movimentação na categoria.
                        </TableCell>
                      </motion.tr>
                    ) : (
                      filteredTransactions?.map(t => (
                        <motion.tr 
                          variants={itemVariants}
                          initial="hidden"
                          animate="show"
                          exit="exit"
                          layout
                          key={t.id} 
                          className="hover:bg-slate-50/50 border-b border-slate-100/50 transition-colors group"
                        >
                          <TableCell className="w-[60px] pl-2 sm:pl-4">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${getCategoryColor(t.category, t.type)} group-hover:scale-105 transition-transform shadow-sm`}>
                              {getCategoryIcon(t.category, t.type)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800">{t.description}</p>
                              <StatusBadge variant={t.type === 'INCOME' ? 'income' : t.category === 'transfer_out' ? 'transfer' : 'expense'}>
                                {t.type === 'INCOME' ? 'Entrada' : t.category === 'transfer_out' ? 'Pix' : 'Saída'}
                              </StatusBadge>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{format(new Date(t.date), 'dd/MM/yyyy • HH:mm')}</p>
                          </TableCell>
                          <TableCell className={`text-right font-semibold text-base pr-2 sm:pr-4 ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-slate-700'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                          </TableCell>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </motion.tbody>
              </Table>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

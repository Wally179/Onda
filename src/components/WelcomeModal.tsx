import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Waves, Info, Code2, ShieldAlert, Check } from 'lucide-react'

// ─── Welcome Modal ──────────────────────────────────────────────────────────
// Este componente exibe um aviso importante sobre a natureza do projeto
// (que é um teste técnico simulado e não um banco real).
// Explica que os dados são voláteis e resetam no F5 devido ao MSW.

export function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Abrir o modal com um pequeno delay após o carregamento inicial
    const t = setTimeout(() => setOpen(true), 800)
    return () => clearTimeout(t)
  }, [])

  const stack = [
    { name: 'React + TS',  icon: <Code2 className="w-3 h-3" /> },
    { name: 'Zustand',     icon: <Info className="w-3 h-3" /> },
    { name: 'React Query', icon: <Info className="w-3 h-3" /> },
    { name: 'MSW (Mock)',  icon: <ShieldAlert className="w-3 h-3" /> },
    { name: 'shadcn/ui',   icon: <Info className="w-3 h-3" /> },
    { name: 'Vitest',      icon: <Check className="w-3 h-3" /> }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent 
        className="p-0 gap-0 border-0 overflow-hidden sm:max-w-[460px] bg-white sm:rounded-[1.5rem] shadow-2xl"
      >
        <div className="relative p-6 sm:p-8">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-60" />
          
          <div className="relative z-10 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Waves className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Onda Finance</h2>
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">Avaliação Técnica</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3.5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Este é um <span className="font-bold text-slate-800">projeto demonstrativo</span> desenvolvido para um teste técnico de frontend. Ele simula o fluxo de um banco digital em um ambiente controlado.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Info className="w-3 h-3" /> Info
                </h3>
                <ul className="space-y-1.5">
                  <li className="flex gap-2.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Nenhum dado real (CPF, Senha) é armazenado.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-slate-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>O banco é <span className="font-bold">volátil</span>: ao dar F5, o estado reseta.</span>
                  </li>
                  <li className="flex gap-2.5 text-xs text-slate-700 bg-blue-100/30 p-2 rounded-lg border border-blue-100/50">
                    <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-snug">
                      <span className="font-bold">Dica de Teste:</span> Use o Email <code className="bg-white px-1 rounded border border-blue-100 font-bold">joao@onda.com.br</code> e senha <code className="bg-white px-1 rounded border border-blue-100 font-bold">123456</code>.
                    </span>
                  </li>
                </ul>
              </div>

              {/* Stack Chips */}
              <div className="flex flex-wrap gap-1.5">
                {stack.map(s => (
                  <span 
                    key={s.name}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-500 shadow-sm"
                  >
                    {s.icon}
                    {s.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="space-y-3">
              <button
                onClick={() => setOpen(false)}
                className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/10"
              >
                Entendi e Quero Explorar
              </button>
              <p className="text-center text-[10px] text-slate-400 font-medium">
                Foco em UX, Arquitetura e Performance.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

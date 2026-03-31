# 🌊 Onda Finance

> Aplicação bancária simulada desenvolvida em React como exercício técnico de frontend.  
> Demonstra domínio de arquitetura componentizada, gerenciamento de estado, validação, testes automatizados e design moderno.

**🔗 Link de Produção:** [https://onda-fin.vercel.app/](https://onda-fin.vercel.app/)

---

## 📸 Visão Geral

| Home / Welcome | Login & Cadastro | Dashboard |
|:-:|:-:|:-:|
| Disclaimer · Tech Stack | Tabs animadas · Validação Zod | Saldo · Extrato · Busca · Transferência |

---

## 🏗️ Stack Tecnológica

| Camada | Tecnologia | Motivação |
|--------|-----------|-----------|
| **UI** | React 18 + TypeScript | Tipagem estática, componentes declarativos |
| **Build** | Vite | HMR instantâneo, build otimizado |
| **Estilo** | Tailwind CSS + CVA + shadcn/ui | Design system utility-first, variantes tipadas com CVA |
| **Estado Global** | Zustand (persist) | Leve, sem boilerplate, persistência em localStorage |
| **Server State** | React Query (TanStack) | Cache, revalidação automática, loading states |
| **Formulários** | React Hook Form + Zod | Validação com schema, zero re-renders |
| **Animações** | Framer Motion | Transições fluidas, layout animations |
| **Mock API** | MSW (Mock Service Worker) | Intercepta HTTP ao nível de rede — zero acoplamento |
| **Testes** | Vitest + Testing Library | API compatível com Jest, rápido, integrado ao Vite |
| **Notificações** | Sonner | Toasts modernos, empilháveis |

---

## 📁 Arquitetura do Projeto

```
src/
├── components/
│   ├── ui/                    # Primitivos shadcn/ui + StatusBadge (CVA customizado)
│   ├── WelcomeModal.tsx       # Disclaimer de site simulado e tech stack
│   ├── TransferModal.tsx      # Modal de transferência com busca e 3 estados
│   └── TransferModal.test.tsx # Teste de integração do fluxo
├── mocks/
│   ├── database.ts            # Banco em memória (Repository pattern) multi-usuário
│   ├── handlers.ts            # Endpoints REST mock (MSW) com suporte a IDs de sessão
│   └── browser.ts             # Setup do Service Worker
├── pages/
│   ├── Auth.tsx               # Login + Cadastro (Tabs animadas)
│   ├── Dashboard.tsx          # Painel financeiro principal
│   └── Dashboard.test.tsx     # Testes do dashboard (toggle, filtros)
├── routes/
│   └── index.tsx              # Router com RootLayout e guards (Public/Protected)
├── services/
│   └── api.ts                 # Axios com interceptors JWT
├── store/
│   └── useAuthStore.ts        # Zustand — autenticação persistida
├── types/
│   └── index.ts               # Tipagens compartilhadas do domínio
├── index.css                  # Tailwind + design tokens + glassmorphism
└── main.tsx                   # Entry point + Toaster + MSW bootstrap
```

---

## 🚀 Como Executar

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# 3. Acessar no navegador
# → http://localhost:5173
```

### Executar Testes

```bash
npm test
# ou
npx vitest run
```

---

## 🔐 Fluxos Demonstrativos

### Credenciais padrão (pré-cadastradas)
| Campo | Valor |
|-------|-------|
| Email | `joao@onda.com.br` |
| Senha | `123456` |

### Cadastro e Transferência Multi-Usuário
1. **Crie a conta da "Alice"**: Vá em "Criar Conta" e cadastre usando um email (ex: `alice@email.com`). Ela ganha **R$ 1.500,00** de bônus.
2. **Crie a conta do "Bob"**: Cadastre o Bob com outro email.
3. **Busca de Destinatário**: No Dashboard da Alice, clique em **"Transferir"** e digite o email do Bob. O sistema buscará o Bob no banco em memória.
4. **Transferência Real**: Envie R$ 500. O saldo da Alice cai; o do Bob sobe.
5. **Verificação**: Logue como Bob e veja o extrato com o recebimento da Alice.

> ⚠️ **Nota:** Todos os dados (usuários, saldo, transações) são armazenados em memória volátil.  
> Um simples **F5** reseta o estado ao original — ideal para demonstração e testes sem efeitos colaterais.

---

## 🏛️ Decisões Técnicas

### Mock Service Worker (MSW) e Banco Em-Memória
Diferente de um mock estático, implementamos uma lógica de **Banco de Dados Per-Usuário**. Cada usuário autenticado possui sua própria chave no estado (`balances` e `userTransactions`), permitindo que transferências cruzadas funcionem como em um backend real.

### RootLayout e Welcome Modal
Adicionamos um aviso de transparência (`WelcomeModal`) que aparece em cada reinicialização da página. Isso garante que o avaliador entenda imediatamente que o site é uma simulação técnica e conheça as tecnologias por trás do projeto.

### Validação com Zod
Schemas de validação são declarados como **single source of truth** — a tipagem TypeScript é inferida automaticamente via `z.infer<>`, eliminando duplicação entre tipos e regras de negócio.

---

## 🛡️ Segurança

Conforme solicitado nos requisitos, abaixo estão as estratégias de proteção contra os vetores de **engenharia reversa** e **vazamento de dados**:

### Engenharia Reversa

| Técnica | Descrição |
|---------|-----------|
| **Minificação e Tree-shaking** | O build de produção do Vite (Rollup) minifica nomes de variáveis, funções e classes, dificultando a leitura do bundle final. Componentes não utilizados são removidos automaticamente. |
| **Code Splitting** | Rotas protegidas são carregadas via lazy loading (React Router), impedindo que código do dashboard seja exposto a usuários não autenticados no bundle inicial. |
| **Source Maps desabilitados** | Em produção, source maps são desabilitados, impedindo a reconstrução do código-fonte original via DevTools. |
| **Variáveis de ambiente** | Segredos nunca são expostos no client-side. O `import.meta.env` do Vite só expõe variáveis prefixadas com `VITE_`. |

### Vazamento de Dados

| Técnica | Descrição |
|---------|-----------|
| **XSS** | React escapa JSX por padrão. Não utilizamos `dangerouslySetInnerHTML`. Inputs validados com Zod no client e no mock server. |
| **Token JWT** | Armazenado em Zustand com persist (localStorage). Em produção, recomenda-se migrar para `httpOnly cookies`. |
| **Interceptor 401** | O Axios intercepta respostas 401 automaticamente, fazendo logout e limpando tokens/dados do estado. |
| **HTTPS** | A aplicação na Vercel é servida exclusivamente via HTTPS com certificado TLS. |

---

## 📋 Testes

A suíte de testes cobre os fluxos críticos da aplicação:

| Arquivo | Cobertura |
|---------|-----------|
| `TransferModal.test.tsx` | Abertura do modal, preenchimento, envio e verificação do payload |
| `Dashboard.test.tsx` | Toggle de visibilidade do saldo, filtros de extrato (Entradas/Saídas) |

```bash
npx vitest run
# ✓ 3 testes passando
```

---

## 🔮 Melhorias Futuras

Funcionalidades que seriam implementadas em uma fase futura:

- **Autenticação**: Refresh token com rotação automática, 2FA via SMS/TOTP.
- **Gráficos**: Visualização de gastos por categoria (Recharts/Nivo).
- **Comprovantes**: Geração de comprovante de transferência em PDF.
- **PWA**: Suporte offline e manifesto para instalação em dispositivos.

---

## 📄 Licença

Projeto desenvolvido para fins de avaliação técnica.
stes E2E com Playwright, testes de acessibilidade (axe-core) |
| **Infra** | CI/CD com GitHub Actions, análise estática com ESLint strict, Husky + lint-staged |
| **Backend** | Migração do MSW para API real (Node.js + Prisma + PostgreSQL) |
| **Segurança** | CSP headers, rate limiting, auditoria automatizada de dependências |

---

## 📄 Licença

Projeto desenvolvido para fins de avaliação técnica.

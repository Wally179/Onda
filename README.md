# 🌊 Onda Finance

> Aplicação bancária simulada desenvolvida em React como exercício técnico de frontend.  
> Demonstra domínio de arquitetura componentizada, gerenciamento de estado, validação, testes automatizados e design moderno.

---

## 📸 Visão Geral

| Login & Cadastro | Dashboard |
|:-:|:-:|
| Tabs animadas · Validação Zod | Saldo · Extrato · Filtros · Transferência |

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
│   ├── TransferModal.tsx      # Modal de transferência com 3 estados
│   └── TransferModal.test.tsx # Teste de integração do fluxo
├── mocks/
│   ├── database.ts            # Banco em memória (Repository pattern)
│   ├── handlers.ts            # Endpoints REST mock (MSW)
│   └── browser.ts             # Setup do Service Worker
├── pages/
│   ├── Auth.tsx               # Login + Cadastro (Tabs animadas)
│   ├── Dashboard.tsx          # Painel financeiro principal
│   └── Dashboard.test.tsx     # Testes do dashboard (toggle, filtros)
├── routes/
│   └── index.tsx              # Router com guards (Public/Protected)
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
| CPF   | `12345678909` |
| Senha | `123456` |

### Cadastro de novo usuário
1. Na tela de autenticação, clique na aba **"Criar Conta"**
2. Preencha Nome, CPF, Senha e Confirmação
3. Ao cadastrar, será redirecionado automaticamente para a aba de Login
4. Faça login com as credenciais recém-criadas

> ⚠️ **Nota:** Todos os dados (usuários, saldo, transações) são armazenados em memória volátil.  
> Um simples **F5** reseta o estado ao original — ideal para demonstração e testes sem efeitos colaterais.

### Transferências
1. No Dashboard, clique em **"Transferir"**
2. Preencha favorecido e valor → o saldo será deduzido em tempo real
3. A transação aparecerá instantaneamente no extrato

---

## 🏛️ Decisões Técnicas

### Mock Service Worker (MSW)
Optamos por interceptar requisições **ao nível de rede** em vez de mockar o Axios diretamente. Isso garante que:
- Os interceptors de autenticação são exercitados normalmente
- A aplicação não tem nenhum código condicional de mock em produção
- Os testes end-to-end podem reutilizar os mesmos handlers

### Banco Em-Memória (`mocks/database.ts`)
Separa a lógica de persistência dos handlers HTTP seguindo o **Repository Pattern**. Funções puras (`findUserByDocument`, `debitBalance`, `addTransaction`) facilitam testes unitários e manutenção.

### Zustand com Persist
O estado de autenticação sobrevive a reloads (via `localStorage`), simulando a experiência real de sessão persistente. O middleware `persist` é configurado automaticamente.

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
| **Source Maps desabilitados** | Em produção, source maps devem ser desabilitados (`build.sourcemap: false` no `vite.config.ts`), impedindo a reconstrução do código-fonte original via DevTools. |
| **Obfuscação (opcional)** | Para ambientes de maior risco, ferramentas como `vite-plugin-obfuscator` ou `terser` com `mangle` agressivo podem ser integradas ao pipeline de build. |
| **Variáveis de ambiente** | Secrets nunca são expostos no client-side. O `import.meta.env` do Vite só expõe variáveis prefixadas com `VITE_`, e nenhum segredo real está no bundle. |

### Vazamento de Dados

| Técnica | Descrição |
|---------|-----------|
| **XSS** | React escapa JSX por padrão. Não utilizamos `dangerouslySetInnerHTML` em nenhum ponto da aplicação. Inputs validados com Zod no client e no mock server. |
| **Token JWT** | Armazenado em Zustand com persist (localStorage). Em produção, recomenda-se migrar para `httpOnly cookies` gerenciados pelo backend para impedir acesso via JavaScript. |
| **Interceptor 401** | O Axios intercepta respostas 401 automaticamente, fazendo logout e limpando tokens/dados do estado — impede sessões fantasma. |
| **Sanitização de inputs** | Zod valida e normaliza dados antes do envio. CPFs são limpos (`replace(/\D/g, '')`) antes de trafegar pela rede. |
| **CORS** | Em produção, o backend configuraria headers `Access-Control-Allow-Origin` restritos. No ambiente mock (MSW), não há exposição real de rede. |
| **HTTPS** | A aplicação na Vercel é servida exclusivamente via HTTPS com certificado TLS gerenciado automaticamente. |

> 💡 **Nota:** Como se trata de um mock frontend, estas estratégias são **documentativas**. Em uma aplicação real com backend, adicionar-se-iam: rate limiting, WAF, Content Security Policy (CSP), e auditoria de dependências via `npm audit`.

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

Funcionalidades e melhorias que seriam implementadas com mais tempo de desenvolvimento:

| Área | Melhoria |
|------|----------|
| **Autenticação** | Refresh token com rotação automática, 2FA via SMS/TOTP |
| **Dashboard** | Gráficos de gastos por categoria (Recharts/Nivo), extrato paginado com scroll infinito |
| **Transferência** | Agendamento de transferências, favoritos, comprovante em PDF |
| **UX** | Tema escuro (dark mode), PWA com offline support, notificações push |
| **Testes** | Cobertura de 80%+, testes E2E com Playwright, testes de acessibilidade (axe-core) |
| **Infra** | CI/CD com GitHub Actions, análise estática com ESLint strict, Husky + lint-staged |
| **Backend** | Migração do MSW para API real (Node.js + Prisma + PostgreSQL) |
| **Segurança** | CSP headers, rate limiting, auditoria automatizada de dependências |

---

## 📄 Licença

Projeto desenvolvido para fins de avaliação técnica.

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Auth } from '@/pages/Auth'
import { Dashboard } from '@/pages/Dashboard'
import { WelcomeModal } from '@/components/WelcomeModal'

// ─── Shared Layout ───────────────────────────────────────────────────

function RootLayout() {
  return (
    <>
      <WelcomeModal />
      <Outlet />
    </>
  )
}

// ─── Guards ────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore(s => s.token)
  if (token) return <Navigate to="/" replace />
  return <>{children}</>
}

// ─── Router ────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
      },
      {
        path: 'login',
        element: <PublicRoute><Auth /></PublicRoute>,
      },
    ]
  },
])

import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Auth } from '@/pages/Auth'
import { Dashboard } from '@/pages/Dashboard'

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
    path: '/login',
    element: <PublicRoute><Auth /></PublicRoute>,
  },
  {
    path: '/',
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
])

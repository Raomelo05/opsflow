import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { estaAutenticado } from '../services/api'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

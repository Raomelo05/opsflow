import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketDetails from './pages/TicketDetails'
import KnowledgeBase from './pages/KnowledgeBase'
import Improvements from './pages/Improvements'
import WorkflowBuilder from './pages/WorkflowBuilder'
import Admin from './pages/Admin'

function Protegida({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Protegida><Dashboard /></Protegida>} />
      <Route path="/tickets" element={<Protegida><Tickets /></Protegida>} />
      <Route path="/tickets/:id" element={<Protegida><TicketDetails /></Protegida>} />
      <Route path="/kb" element={<Protegida><KnowledgeBase /></Protegida>} />
      <Route path="/improvements" element={<Protegida><Improvements /></Protegida>} />
      <Route path="/workflows" element={<Protegida><WorkflowBuilder /></Protegida>} />
      <Route path="/admin" element={<Protegida><Admin /></Protegida>} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

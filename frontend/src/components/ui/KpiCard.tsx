import type { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface KpiCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone?: 'default' | 'danger' | 'success'
  hint?: string
}

const TONE_ICON_CLASSES = {
  default: 'bg-primary-soft text-primary',
  danger: 'bg-danger/10 text-danger',
  success: 'bg-success/10 text-success',
}

const TONE_VALUE_CLASSES = {
  default: 'text-ink',
  danger: 'text-danger',
  success: 'text-success',
}

export function KpiCard({ label, value, icon: Icon, tone = 'default', hint }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="rounded-lg border border-border bg-surface p-5 shadow-card"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-secondary">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${TONE_VALUE_CLASSES[tone]}`}>{value}</p>
          {hint && <p className="mt-1 text-xs text-ink-disabled">{hint}</p>}
        </div>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${TONE_ICON_CLASSES[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
    </motion.div>
  )
}

import { api } from './api'
import type { InsightsResponse } from '../types'

export async function buscarInsightsSemanais(): Promise<InsightsResponse> {
  const { data } = await api.get('/insights/weekly')
  return data
}

import type { Withdrawal, AuditLog } from '../../types'
import { apiRequest } from '../client'

export type AdminStats = {
  revenue: number
  revenueLabel: string
  weight: number
  weightLabel: string
  pendingCount: number
  pendingLabel: string
}

export type AdminChartItem = { name: string; weight: number }

/** T4: 数据大屏完整响应类型 */
export type DashboardOverview = {
  total_users: number
  total_collectors: number
  total_orders: number
  completed_orders: number
  pending_orders: number
  pending_withdrawals: number
  total_revenue: number
  total_weight: number
  new_users_7d: number
}

export type TrendItem = { date: string; total: number; completed: number }
export type RevenueTrendItem = { date: string; revenue: number }
export type MaterialDistItem = { name: string; weight: number }

export type DashboardData = {
  overview: DashboardOverview
  order_trend: TrendItem[]
  revenue_trend: RevenueTrendItem[]
  material_distribution: MaterialDistItem[]
}

export const getAdminStats = async () => {
  return apiRequest<AdminStats>('/api/v1/admin/stats')
}

export const getAdminChart = async () => {
  return apiRequest<AdminChartItem[]>('/api/v1/admin/chart')
}

/** T4: 获取数据大屏完整数据 */
export const getDashboardData = async () => {
  return apiRequest<DashboardData>('/api/v1/admin/dashboard')
}

export const getAdminWithdrawals = async () => {
  return apiRequest<Withdrawal[]>('/api/v1/admin/withdrawals')
}

export const approveWithdrawal = async (id: string) => {
  return apiRequest<any>(`/api/v1/admin/withdrawals/${id}/approve`, { method: 'PUT' })
}

export const rejectWithdrawal = async (id: string, reason: string) => {
  return apiRequest<any>(`/api/v1/admin/withdrawals/${id}/reject`, { method: 'PUT', body: { reason } })
}

export const getAuditLogs = async () => {
  return apiRequest<AuditLog[]>('/api/v1/admin/audit_logs')
}


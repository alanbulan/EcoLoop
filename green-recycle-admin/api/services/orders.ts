import type { Order } from '../../types'
import { apiRequest } from '../client'

export const getOrders = async () => {
  return apiRequest<Order[]>('/api/v1/orders')
}

export const assignOrder = async (orderId: string, collectorId: string) => {
  return apiRequest<any>(`/api/v1/orders/${orderId}/assign`, {
    method: 'PUT',
    body: { collector_id: parseInt(collectorId, 10) }
  })
}

/** F5修复: 获取订单真实时间线 */
export interface TimelineStep {
  step: string
  label: string
  time: string | null
  done: boolean
}

export const getOrderTimeline = async (orderId: string) => {
  return apiRequest<TimelineStep[]>(`/api/v1/orders/${orderId}/timeline`)
}


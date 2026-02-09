export type OrderListItem = {
  id: string
  user_id: string
  user_name: string
  address: string
  contact_phone: string  // ⚠️5修复: 订单联系电话
  status: string
  weight_actual: number
  amount_final: number
  unit_price_snapshot: number
  collector_id: string | null
  date: string
  category: string
  appointment_time: string | null
  remark: string | null
}

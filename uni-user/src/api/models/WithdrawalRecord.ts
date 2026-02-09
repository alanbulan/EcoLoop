export type WithdrawalRecord = {
  id: string
  order_id: string | null
  user_id: string
  user_name: string
  amount: number
  status: string
  channel: string
  request_date: string
}

export type CreateWithdrawalRequest = {
  user_id: number
  order_id: number
  amount: number
  channel?: string
}

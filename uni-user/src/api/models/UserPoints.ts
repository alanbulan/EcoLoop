/**
 * 用户积分响应类型
 * 对应后端 get_user_points 返回值
 */
export interface PointsHistoryItem {
  reason: string
  date: string
  type: 'in' | 'out'
  amount: number
}

export type UserPoints = {
  current_points: number
  today_points: number
  total_points: number
  history: PointsHistoryItem[]
}

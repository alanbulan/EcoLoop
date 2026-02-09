/**
 * 用户统计数据响应类型
 * 对应后端 get_user_stats 返回值
 */
export type UserStats = {
  carbon_offset: number
  recycle_count: number
  total_earnings: number
}

/**
 * 用户资料响应类型
 * 对应后端 User_Pydantic (排除 password)
 */
export type UserProfile = {
  id: number
  username: string | null
  openid: string | null
  phone: string | null
  full_name: string | null
  avatar_url: string | null
  balance: string
  points: number
  created_at: string
}

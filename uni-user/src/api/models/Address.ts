/**
 * 地址类型定义
 * 对应后端 AddressResponse / AddressCreate
 */
export type Address = {
  id: number
  user_id: number
  receiver_name: string
  receiver_phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

export type AddressCreate = {
  user_id: number
  receiver_name: string
  receiver_phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: boolean
}

/**
 * 物料价格历史类型
 * 对应后端 get_material_history 返回值
 */
export type MaterialHistoryItem = {
  label: string
  value: number
  price: number
}

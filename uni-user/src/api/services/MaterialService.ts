import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { Material } from '../models/Material'
import type { MaterialHistoryItem } from '../models/MaterialHistory'

export class MaterialService {
  /** 获取物料列表 */
  public static getMaterialsApiV1MaterialsGet(): CancelablePromise<Array<Material>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/materials'
    })
  }

  /** 获取物料价格历史 (近7日) */
  public static getMaterialHistoryApiV1MaterialsMaterialIdHistoryGet(
    materialId: number
  ): CancelablePromise<Array<MaterialHistoryItem>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/materials/{material_id}/history',
      path: {
        material_id: materialId
      }
    })
  }
}

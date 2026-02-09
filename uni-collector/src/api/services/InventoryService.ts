import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

export type InventoryItem = {
  material_name: string
  material_id: number
  weight: number
  last_updated: string
}

export type InventoryOutboundRequest = {
  material_id: number
  weight: number
  notes?: string | null
}

export class InventoryService {
  public static getInventoryApiV1InventoryGet(): CancelablePromise<Array<InventoryItem>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/inventory'
    })
  }

  public static inventoryOutboundApiV1InventoryOutboundPost(
    requestBody: InventoryOutboundRequest
  ): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/inventory/outbound',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`
      }
    })
  }
}


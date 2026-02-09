import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { CreateOrderSchema } from '../models/CreateOrderSchema'
import type { Order } from '../models/Order'
import type { OrderListItem } from '../models/OrderListItem'

export class OrderService {
  public static getOrdersApiV1OrdersGet(
    limit: number = 100,
    offset: number = 0,
    userId?: number,
  ): CancelablePromise<Array<OrderListItem>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/orders',
      query: {
        limit,
        offset,
        // ⚠️1修复: 服务端按 user_id 过滤，不再前端过滤全量数据
        ...(userId ? { user_id: userId } : {}),
      }
    })
  }

  public static createOrderApiV1OrdersPost(requestBody: CreateOrderSchema): CancelablePromise<Order> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/orders',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`
      }
    })
  }

  public static cancelOrderApiV1OrdersOrderIdDelete(orderId: number): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/api/v1/orders/{order_id}',
      path: {
        order_id: orderId
      }
    })
  }
}

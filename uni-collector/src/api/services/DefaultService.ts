/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignOrderSchema } from '../models/AssignOrderSchema';
import type { CompleteOrderSchema } from '../models/CompleteOrderSchema';
import type { CreateOrderSchema } from '../models/CreateOrderSchema';
import type { Material } from '../models/Material';
import type { Order } from '../models/Order';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * Get Materials
     * @returns Material Successful Response
     * @throws ApiError
     */
    public static getMaterialsApiV1MaterialsGet(): CancelablePromise<Array<Material>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/materials',
        });
    }
    /**
     * Get Orders
     * ⚠️2修复: 支持 collector_id / status 过滤参数，实现回收员权限隔离
     * @param collectorId 回收员ID（可选，用于过滤自己的订单）
     * @param status 订单状态（可选，如 pending / scheduled / completed）
     * @returns Order Successful Response
     * @throws ApiError
     */
    public static getOrdersApiV1OrdersGet(
        collectorId?: number,
        status?: string,
    ): CancelablePromise<Array<Order>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/orders',
            query: {
                'collector_id': collectorId,
                'status': status,
            },
        });
    }
    /**
     * Create Order
     * @param requestBody
     * @returns Order Successful Response
     * @throws ApiError
     */
    public static createOrderApiV1OrdersPost(
        requestBody: CreateOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Assign Order
     * @param orderId
     * @param requestBody
     * @returns Order Successful Response
     * @throws ApiError
     */
    public static assignOrderApiV1OrdersOrderIdAssignPut(
        orderId: number,
        requestBody: AssignOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/orders/{order_id}/assign',
            path: {
                'order_id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * P0/P2修复: 回收员抢单端点（含状态校验+审计日志）
     * @param orderId
     * @param requestBody
     * @returns Order Successful Response
     * @throws ApiError
     */
    public static claimOrderApiV1OrdersOrderIdClaimPut(
        orderId: number,
        requestBody: AssignOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/orders/{order_id}/claim',
            path: {
                'order_id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Order already claimed`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Complete Order
     * @param orderId
     * @param requestBody
     * @returns Order Successful Response
     * @throws ApiError
     */
    public static completeOrderApiV1OrdersOrderIdCompletePut(
        orderId: number,
        requestBody: CompleteOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/orders/{order_id}/complete',
            path: {
                'order_id': orderId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * 健康检查
     * @returns { message: string }
     */
    public static rootGet(): CancelablePromise<{ message: string }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }
}

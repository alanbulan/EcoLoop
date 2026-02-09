/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AssignOrderSchema } from '../models/AssignOrderSchema';
import type { CompleteOrderSchema } from '../models/CompleteOrderSchema';
import type { CreateOrderSchema } from '../models/CreateOrderSchema';
import type { Material } from '../models/Material';
import type { MaterialHistoryItem } from '../models/MaterialHistory';
import type { Order } from '../models/Order';
import type { UserProfile } from '../models/UserProfile';
import type { UserPoints } from '../models/UserPoints';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultService {
    /**
     * 获取物料列表
     */
    public static getMaterialsApiV1MaterialsGet(): CancelablePromise<Array<Material>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/materials',
        });
    }

    /**
     * 获取订单列表
     */
    public static getOrdersApiV1OrdersGet(): CancelablePromise<Array<Order>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/orders',
        });
    }

    /**
     * 创建订单
     */
    public static createOrderApiV1OrdersPost(
        requestBody: CreateOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/orders',
            body: requestBody,
            mediaType: 'application/json',
            errors: { 422: `Validation Error` },
        });
    }

    /**
     * 分配订单
     */
    public static assignOrderApiV1OrdersOrderIdAssignPut(
        orderId: number,
        requestBody: AssignOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/orders/{order_id}/assign',
            path: { 'order_id': orderId },
            body: requestBody,
            mediaType: 'application/json',
            errors: { 422: `Validation Error` },
        });
    }

    /**
     * 完成订单
     */
    public static completeOrderApiV1OrdersOrderIdCompletePut(
        orderId: number,
        requestBody: CompleteOrderSchema,
    ): CancelablePromise<Order> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/orders/{order_id}/complete',
            path: { 'order_id': orderId },
            body: requestBody,
            mediaType: 'application/json',
            errors: { 422: `Validation Error` },
        });
    }

    /**
     * 健康检查
     */
    public static rootGet(): CancelablePromise<{ message: string }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/',
        });
    }

    /**
     * 取消订单
     */
    public static cancelOrderApiV1OrdersOrderIdDelete(
        orderId: number,
    ): CancelablePromise<{ message: string }> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/v1/orders/{order_id}',
            path: { 'order_id': orderId },
        });
    }

    /**
     * 获取用户资料
     */
    public static getUserApiV1UsersUserIdGet(
        userId: number,
    ): CancelablePromise<UserProfile> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}',
            path: { 'user_id': userId },
        });
    }

    /**
     * 获取用户积分
     */
    public static getUserPointsApiV1UsersUserIdPointsGet(
        userId: number,
    ): CancelablePromise<UserPoints> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/users/{user_id}/points',
            path: { 'user_id': userId },
        });
    }

    /**
     * 获取物料价格历史
     */
    public static getMaterialHistoryApiV1MaterialsMaterialIdHistoryGet(
        materialId: number,
    ): CancelablePromise<Array<MaterialHistoryItem>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/materials/{material_id}/history',
            path: { 'material_id': materialId },
        });
    }
}

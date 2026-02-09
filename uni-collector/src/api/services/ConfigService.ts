import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ConfigService {
    /**
     * 获取所有配置
     * @returns Record<string, unknown> 配置键值对
     */
    public static getAllConfigsApiV1ConfigGet(): CancelablePromise<Record<string, unknown>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/config',
        });
    }

    /**
     * 获取单个配置
     * @param key 配置键名
     * @returns unknown 配置值 (动态 JSON)
     */
    public static getConfigApiV1ConfigKeyGet(
        key: string,
    ): CancelablePromise<unknown> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/config/{key}',
            path: {
                'key': key,
            },
        });
    }
}

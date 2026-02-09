/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginResponse } from '../models/LoginResponse';
import type { WxLoginSchema } from '../models/WxLoginSchema';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Wx Login
     * Login with WeChat Code (jscode2session).
     * If user doesn't exist, auto-register.
     * @param requestBody
     * @returns LoginResponse Successful Response
     * @throws ApiError
     */
    public static wxLoginApiV1AuthLoginPost(
        requestBody: WxLoginSchema,
    ): CancelablePromise<LoginResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}

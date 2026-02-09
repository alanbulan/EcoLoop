import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { CreateWithdrawalRequest, WithdrawalRecord } from '../models/WithdrawalRecord'

export class WithdrawalService {
  public static getUserWithdrawalsApiV1WithdrawalsGet(
    userId: number,
    limit: number = 100,
    offset: number = 0
  ): CancelablePromise<Array<WithdrawalRecord>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/withdrawals',
      query: {
        user_id: userId,
        limit,
        offset
      }
    })
  }

  public static createWithdrawalApiV1WithdrawalsPost(
    requestBody: CreateWithdrawalRequest
  ): CancelablePromise<{ id: number; message: string }> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/withdrawals',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`
      }
    })
  }
}

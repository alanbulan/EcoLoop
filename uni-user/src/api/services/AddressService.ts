import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'
import type { Address, AddressCreate } from '../models/Address'

export class AddressService {
  /** 获取用户地址列表 */
  public static getAddressesApiV1AddressesGet(userId: number): CancelablePromise<Array<Address>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/addresses',
      query: {
        user_id: userId
      }
    })
  }

  /** 创建新地址 */
  public static createAddressApiV1AddressesPost(requestBody: AddressCreate): CancelablePromise<Address> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/api/v1/addresses',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`
      }
    })
  }

  /** 更新地址 */
  public static updateAddressApiV1AddressesAddressIdPut(addressId: number, requestBody: AddressCreate): CancelablePromise<Address> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/v1/addresses/{address_id}',
      path: {
        address_id: addressId
      },
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        422: `Validation Error`
      }
    })
  }
}

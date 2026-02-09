/**
 * 消息通知 API 服务
 */
import type { CancelablePromise } from '../core/CancelablePromise'
import { OpenAPI } from '../core/OpenAPI'
import { request as __request } from '../core/request'

/** 通知项类型 */
export interface NotificationItem {
  id: number
  title: string
  content: string
  type: string
  is_read: boolean
  related_entity_type: string | null
  related_entity_id: number | null
  created_at: string
}

export class NotificationService {
  /** 获取用户通知列表 */
  public static getNotifications(userId: number, limit = 50, offset = 0): CancelablePromise<NotificationItem[]> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/notifications',
      query: { user_id: userId, limit, offset },
    })
  }

  /** 获取未读消息数 */
  public static getUnreadCount(userId: number): CancelablePromise<{ count: number }> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/api/v1/notifications/unread-count',
      query: { user_id: userId },
    })
  }

  /** 标记单条已读 */
  public static markRead(notificationId: number, userId: number): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/v1/notifications/{notification_id}/read',
      path: { notification_id: notificationId },
      query: { user_id: userId },
    })
  }

  /** 标记全部已读 */
  public static markAllRead(userId: number): CancelablePromise<{ message: string }> {
    return __request(OpenAPI, {
      method: 'PUT',
      url: '/api/v1/notifications/read-all',
      query: { user_id: userId },
    })
  }
}

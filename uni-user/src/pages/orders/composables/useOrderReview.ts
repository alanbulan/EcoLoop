/**
 * 订单评价业务逻辑
 * 职责: 评价提交、已评价状态管理、标签选择
 */
import { ref, reactive } from 'vue'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '../../../stores/user'
import { ReviewService } from '../../../api'
import { handleApiError } from '../../../composables/useHttpInterceptor'
import type { OrderListItem } from '../../../api/models/OrderListItem'

/** 预定义评价标签 */
const REVIEW_TAGS = ['准时上门', '态度友好', '分类专业', '称重准确', '沟通顺畅']

export function useOrderReview() {
  const toast = useToast()
  const userStore = useUserStore()

  const showReviewPopup = ref(false)
  const submittingReview = ref(false)
  const currentOrderId = ref<number | null>(null)
  /** 已评价的订单 ID 集合 */
  const reviewedOrders = ref<Record<string, boolean>>({})

  const reviewForm = reactive({
    rating: 5,
    content: '',
    selectedTags: [] as string[],
  })

  /** 获取用户已评价的订单列表 */
  const fetchReviewedOrders = async () => {
    if (!userStore.userId) return
    try {
      const reviews = await ReviewService.getReviews({ user_id: userStore.userId })
      reviewedOrders.value = reviews.reduce((acc, r) => {
        acc[String(r.order_id)] = true
        return acc
      }, {} as Record<string, boolean>)
    } catch (e) {
      console.warn('获取评价记录失败', e)
    }
  }

  /** 打开评价弹窗 */
  const handleReview = (order: OrderListItem) => {
    if (reviewedOrders.value[String(order.id)]) return
    currentOrderId.value = Number(order.id)
    reviewForm.rating = 5
    reviewForm.content = ''
    reviewForm.selectedTags = []
    showReviewPopup.value = true
  }

  /** 切换标签选中状态 */
  const toggleTag = (tag: string) => {
    const idx = reviewForm.selectedTags.indexOf(tag)
    if (idx >= 0) {
      reviewForm.selectedTags.splice(idx, 1)
    } else {
      reviewForm.selectedTags.push(tag)
    }
  }

  /** 提交评价 */
  const submitReview = async () => {
    if (!currentOrderId.value || !userStore.userId) return

    submittingReview.value = true
    try {
      await ReviewService.createReview({
        order_id: currentOrderId.value,
        user_id: userStore.userId,
        rating: reviewForm.rating,
        content: reviewForm.content || undefined,
        tags: reviewForm.selectedTags.length > 0
          ? reviewForm.selectedTags.join(',')
          : undefined,
      })
      // 标记为已评价
      reviewedOrders.value[String(currentOrderId.value)] = true
      showReviewPopup.value = false
      toast.success('评价成功，感谢您的反馈')
    } catch (e: unknown) {
      // N: 使用全局错误拦截器处理 401/403/500 等通用错误
      handleApiError(e)
    } finally {
      submittingReview.value = false
    }
  }

  return {
    reviewedOrders,
    showReviewPopup,
    reviewForm,
    submittingReview,
    reviewTags: REVIEW_TAGS,
    fetchReviewedOrders,
    handleReview,
    submitReview,
    toggleTag,
  }
}

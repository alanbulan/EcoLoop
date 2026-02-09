/**
 * 预约回收页面核心业务逻辑
 * 职责: 物料选择、地址选择、表单校验、订单提交
 */
import { ref, onMounted } from 'vue'
import { type Material } from '../../../api'
import { useToast } from 'wot-design-uni'
import { useUserStore } from '../../../stores/user'
import { AddressService } from '../../../api/services/AddressService'
import { MaterialService } from '../../../api/services/MaterialService'
import { OrderService } from '../../../api/services/OrderService'
import type { Address } from '../../../api/models/Address'

export function useAppointment() {
  const userStore = useUserStore()
  const toast = useToast()

  const material = ref<Material | null>(null)
  const allMaterials = ref<Material[]>([])
  const showMaterialPicker = ref(false)
  const selectedAddress = ref<(Address & { latitude?: number; longitude?: number }) | null>(null)
  const submitting = ref(false)
  const minDate = ref(new Date().getTime())

  // P0修复: wd-datetime-picker v-model 需要 number 类型（时间戳）
  const form = ref({
    estimated_weight: 5,
    appointment_time: Date.now() as number,
    remark: ''
  })

  /** 初始化: 解析页面参数中的预选物料 */
  const initFromPageOptions = () => {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1] as Page.PageInstance & { options: Record<string, string> }
    const options = currentPage.options
    if (options.material) {
      material.value = JSON.parse(decodeURIComponent(options.material))
    }
  }

  /** 获取全部可回收物料列表 */
  const fetchAllMaterials = async () => {
    try {
      allMaterials.value = await MaterialService.getMaterialsApiV1MaterialsGet()
    } catch (e) {
      console.warn('获取物料列表失败', e)
    }
  }

  /** 选择物料 */
  const selectMaterial = (item: Material) => {
    material.value = item
    showMaterialPicker.value = false
  }

  /** 获取用户默认地址 */
  const fetchDefaultAddress = async () => {
    if (!userStore.userId) return
    try {
      const addresses = await AddressService.getAddressesApiV1AddressesGet(userStore.userId)
      if (addresses && addresses.length > 0) {
        selectedAddress.value = addresses.find((a) => a.is_default) || addresses[0]
      }
    } catch (e) {
      console.warn('获取默认地址失败', e)
    }
  }

  /** 选择地址（弹出操作菜单） */
  const chooseAddress = () => {
    uni.showActionSheet({
      itemList: ['从我的地址选择', '地图精准定位'],
      success: (res) => {
        if (res.tapIndex === 0) {
          uni.navigateTo({
            url: '/pages/address/address?mode=select',
            events: {
              addressSelected: (data: Address) => {
                selectedAddress.value = data
              }
            }
          })
        } else {
          uni.chooseLocation({
            success: (loc) => {
              selectedAddress.value = {
                id: 0,
                user_id: userStore.userId || 0,
                receiver_name: userStore.userInfo?.full_name || '已登录用户',
                receiver_phone: userStore.userInfo?.username || '',
                province: '',
                city: '',
                district: '',
                detail: loc.address + ' ' + loc.name,
                is_default: false,
                latitude: loc.latitude,
                longitude: loc.longitude
              }
              if (!selectedAddress.value.receiver_phone) {
                toast.info('请在个人中心绑定手机号')
              }
            },
            fail: (err: { errMsg?: string }) => {
              if (err.errMsg?.includes('auth deny')) {
                toast.error('请授权位置信息')
              }
            }
          })
        }
      }
    })
  }

  /** 提交预约订单 */
  const submitOrder = async () => {
    if (!selectedAddress.value) {
      toast.error('请选择回收地址')
      return
    }
    if (!material.value) {
      toast.error('请选择回收物品')
      return
    }
    if (!form.value.appointment_time) {
      toast.error('请选择预约时间')
      return
    }

    submitting.value = true
    try {
      // P0修复: appointment_time 已是时间戳，直接转 ISO 字符串
      const appointmentDate = new Date(form.value.appointment_time).toISOString()
      await OrderService.createOrderApiV1OrdersPost({
        user_id: userStore.userId!,
        material_id: material.value.id,
        address: selectedAddress.value.province + selectedAddress.value.city + selectedAddress.value.district + selectedAddress.value.detail,
        estimated_weight: form.value.estimated_weight,
        appointment_time: appointmentDate,
        remark: form.value.remark
      })
      toast.success('预约成功')
      setTimeout(() => {
        uni.switchTab({ url: '/pages/orders/orders' })
      }, 1500)
    } catch (e) {
      toast.error('预约失败')
    } finally {
      submitting.value = false
    }
  }

  onMounted(() => {
    initFromPageOptions()
    fetchAllMaterials()
    fetchDefaultAddress()
  })

  return {
    material,
    allMaterials,
    showMaterialPicker,
    selectedAddress,
    submitting,
    minDate,
    form,
    selectMaterial,
    chooseAddress,
    submitOrder,
  }
}

<template>
  <view class="container">
    <wd-navbar title="我的地址" left-arrow @click-left="goBack" fixed placeholder safe-area-inset-top />

    <view class="address-list">
      <view 
        v-for="item in list" 
        :key="item.id" 
        class="address-item"
        @click="handleSelect(item)"
      >
        <view class="item-main">
          <view class="user-info">
            <text class="name">{{ item.receiver_name }}</text>
            <text class="phone">{{ item.receiver_phone }}</text>
            <text v-if="item.is_default" class="default-tag">默认</text>
          </view>
          <view class="address-detail">
            {{ item.province }}{{ item.city }}{{ item.district }}{{ item.detail }}
          </view>
        </view>
        <wd-icon name="edit" size="18px" color="#999" @click.stop="handleEdit(item)" />
      </view>

      <!-- A: 精致空状态 -->
      <view v-if="list.length === 0" class="empty-state">
        <view class="empty-illustration">
          <wd-icon name="location" size="48px" color="rgba(7,193,96,0.6)" />
        </view>
        <text class="empty-title">还没有收货地址</text>
        <text class="empty-desc">添加地址后可快速预约回收</text>
      </view>
    </view>

    <view class="bottom-btn">
      <wd-button block size="large" @click="handleAdd">新增地址</wd-button>
    </view>

    <!-- Address Form Popup -->
    <!-- 小程序兼容: 底部弹窗添加 safe-area-inset-bottom -->
    <wd-popup v-model="showForm" position="bottom" round safe-area-inset-bottom lock-scroll custom-style="padding-top: 20px;">
      <view class="form-title">{{ editingId ? '编辑地址' : '新增地址' }}</view>
      <wd-form :model="form">
        <wd-cell-group border>
          <wd-input label="联系人" v-model="form.receiver_name" placeholder="请输入姓名" />
          <wd-input label="手机号" v-model="form.receiver_phone" placeholder="请输入手机号" />
          <wd-input label="省市区" v-model="form.area" placeholder="如：上海市浦东新区" />
          <wd-textarea label="详细地址" v-model="form.detail" placeholder="街道、楼牌号等" />
          <wd-cell title="设为默认地址">
            <wd-switch v-model="form.is_default" />
          </wd-cell>
        </wd-cell-group>
        <view class="form-actions">
          <wd-button block @click="saveAddress" :loading="saving">保存并使用</wd-button>
        </view>
      </wd-form>
    </wd-popup>

    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'wot-design-uni'
import { onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '../../stores/user'
import { AddressService } from '../../api/services/AddressService'
import type { Address } from '../../api/models/Address'

const userStore = useUserStore()
const toast = useToast()
const list = ref<Address[]>([])
const mode = ref('')
const showForm = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const form = ref({
  receiver_name: '',
  receiver_phone: '',
  area: '',
  detail: '',
  is_default: false
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as Page.PageInstance & { options: Record<string, string> }
  mode.value = currentPage.options?.mode || ''
  fetchAddresses()
})

/** 下拉刷新 */
onPullDownRefresh(async () => {
  await fetchAddresses()
  uni.stopPullDownRefresh()
})

const fetchAddresses = async () => {
  try {
    list.value = await AddressService.getAddressesApiV1AddressesGet(userStore.userId!)
  } catch (e) {
    toast.error('获取地址失败')
  }
}

const goBack = () => uni.navigateBack()

const handleSelect = (item: Address) => {
  if (mode.value === 'select') {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1] as Page.PageInstance & { getOpenerEventChannel: () => { emit: (name: string, data: Address) => void } }
    const eventChannel = currentPage.getOpenerEventChannel()
    eventChannel.emit('addressSelected', item)
    uni.navigateBack()
  }
}

const handleAdd = () => {
  editingId.value = null
  form.value = {
    receiver_name: '',
    receiver_phone: '',
    area: '',
    detail: '',
    is_default: list.value.length === 0
  }
  showForm.value = true
}

const handleEdit = (item: Address) => {
  editingId.value = item.id
  form.value = {
    receiver_name: item.receiver_name,
    receiver_phone: item.receiver_phone,
    area: `${item.province}${item.city}${item.district}`,
    detail: item.detail,
    is_default: item.is_default
  }
  showForm.value = true
}

const saveAddress = async () => {
  if (!form.value.receiver_name || !form.value.receiver_phone || !form.value.detail) {
    toast.error('请填写完整信息')
    return
  }

  // Basic phone validation
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(form.value.receiver_phone)) {
    toast.error('手机号格式错误')
    return
  }

  saving.value = true
  try {
    // P2修复: 从 area 字段简单解析省市区（Demo 阶段仅支持"XX市XX区"格式）
    const areaStr = form.value.area
    if (!areaStr) {
      toast.error('请填写省市区')
      return
    }
    // 尝试匹配 "XX省XX市XX区" 或 "XX市XX区" 格式
    const areaMatch = areaStr.match(/^(.+?[省市])(.+?[市州])(.+?[区县镇])$/)
      || areaStr.match(/^(.+?市)(.+?市)?(.+?[区县镇])$/)
    const province = areaMatch ? areaMatch[1] : areaStr
    const city = areaMatch ? (areaMatch[2] || areaMatch[1]) : areaStr
    const district = areaMatch ? areaMatch[3] : ''

    const payload = {
      user_id: userStore.userId,
      receiver_name: form.value.receiver_name,
      receiver_phone: form.value.receiver_phone,
      province,
      city,
      district,
      detail: form.value.detail,
      is_default: form.value.is_default
    }

    if (editingId.value) {
      await AddressService.updateAddressApiV1AddressesAddressIdPut(editingId.value, payload)
    } else {
      await AddressService.createAddressApiV1AddressesPost(payload)
    }

    toast.success('保存成功')
    showForm.value = false
    fetchAddresses()
  } catch (e) {
    toast.error('保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
  padding-bottom: 100px;
}

.address-list {
  padding: 12px 16px;
}

/* C+E: 地址卡片按压反馈 + 入场动画 */
.address-item {
  background: $white;
  border-radius: 24rpx;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4rpx 16rpx rgba(0,0,0,0.03);
  transition: transform 0.15s ease;
  @include list-item-enter;
  &:active {
    transform: scale(0.985);
  }
  
  .item-main {
    flex: 1;
    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
      .name { font-size: 16px; font-weight: bold; }
      .phone { font-size: 14px; color: $text-sub; }
      .default-tag {
        background: $primary-color;
        color: $white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 4px;
      }
    }
    .address-detail {
      font-size: 13px;
      color: $text-main;
      line-height: 1.4;
    }
  }
}

/* A+B: 精致空状态（双圈渐变插图） */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 200rpx;

  .empty-illustration {
    @include empty-illustration($primary-color);
  }

  .empty-title { font-size: 30rpx; font-weight: 600; color: $text-main; margin-bottom: 12rpx; }
  .empty-desc { font-size: 24rpx; color: $text-light; }
}

/* B: 底部操作栏毛玻璃效果 */
.bottom-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 20px calc(16px + env(safe-area-inset-bottom));
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 -4px 16px rgba(0,0,0,0.04);
}

.form-title {
  text-align: center;
  font-size: 17px;
  font-weight: bold;
  padding-bottom: 20px;
}

.form-actions {
  padding: 30px 20px 40px;
}
</style>

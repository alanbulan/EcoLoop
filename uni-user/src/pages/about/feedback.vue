<template>
  <view class="container">
    <wd-navbar title="投诉与建议" left-arrow fixed placeholder @click-left="goBack" safe-area-inset-top />
    
    <view class="form-wrap">
      <wd-form :model="form">
        <wd-cell-group border>
          <wd-input v-model="form.contact" label="联系方式" placeholder="手机号或邮箱" />
          <wd-textarea v-model="form.content" label="意见内容" placeholder="请填写您的问题或建议" :maxlength="200" show-word-limit />
        </wd-cell-group>
      </wd-form>
      <view class="actions">
        <wd-button block size="large" :loading="submitting" @click="handleSubmit">提交</wd-button>
      </view>
    </view>
    
    <wd-toast id="wd-toast" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'wot-design-uni'
import { FeedbackService } from '@/api/services/FeedbackService'

const toast = useToast()
const form = ref({
  contact: '',
  content: ''
})
const submitting = ref(false)

const goBack = () => uni.navigateBack()

const handleSubmit = async () => {
  if (!form.value.content) {
    toast.error('请填写意见内容')
    return
  }
  submitting.value = true
  try {
    // F4修复: 对接后端真实反馈接口
    await FeedbackService.submit({
      contact: form.value.contact,
      content: form.value.content,
    })
    toast.success('已提交，我们会尽快处理')
    form.value = { contact: '', content: '' }
  } catch (e) {
    toast.error('提交失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss">
@use "../../styles/variables.scss" as *;

.container {
  background-color: $bg-color;
  min-height: 100vh;
}

.form-wrap {
  padding: 20px 16px 40px;
}

.actions {
  padding: 24px 0 40px;
}
</style>

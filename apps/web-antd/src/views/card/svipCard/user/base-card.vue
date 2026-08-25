<script setup lang="ts">
import { ref, watch } from 'vue';
import {
  Card,
  Flex,
  Typography,
  Image,
  Badge
} from 'ant-design-vue';
import BaseForm  from './base-form.vue';
import BaseCardType from './base-card-type.vue';
import UserInfo from './user-info.vue'
import { useRedemptionStore } from '#/store/redemption';

const redemptionStore = useRedemptionStore();
const showCommont = ref(false);
// 关键：监听 bindUserStatus 的变化，一旦有有效值就更新 showCommont
watch(
  () => redemptionStore.cardInfo.bindUserStatus,
  (newVal) => {
    if (newVal === 0) {
      showCommont.value = true
    } else {
      showCommont.value = false
    }
  },
  { immediate: true } // 立即执行一次，防止首次为空时不触发
)
</script>

<template>
  <Badge.Ribbon text="兑换卡">
    <Card class="bg-out-card">
    <Flex gap="large" vertical>
      <!-- 标题部分 -->
      <Flex justify="center" align="center" vertical>
        <Image src="https://i0.wp.com/sirlinly.github.io/v3/2025/07/disk-logo.png" :height="90" :preview="false"/>
        <Typography.Title :level="4" class="text-white"
          >百度网盘会员权益兑换卡</Typography.Title
        >
        <Typography.Text class="title-description"
          >权益兑换中心</Typography.Text
        >
      </Flex>
      <!-- 内层卡片 -->
      <BaseCardType/>
      <!-- 表单 -->
      <BaseForm v-if="showCommont === true"/>
      <UserInfo v-if="showCommont === false"/>
    </Flex>
  </Card>
  </Badge.Ribbon>
  
</template>

<style scoped>
.bg-out-card {
  width: min(400px, 90vw); /* 关键：最大400px，窄屏下占90%宽度 */
  height: auto;
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 25px; /* 添加圆角 */
  background-image: radial-gradient(
      at 100% 100%,
      rgba(30, 58, 138, 0.18) 0px,
      transparent 55%
    )
    radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.18) 0px, transparent 55%);
}
.text-white {
  color: white !important;
}
.title-description {
  color: rgb(196, 196, 196);
  margin-top: -6px; /* 调整与上方标题的距离 */
}
/* 权益信息 - 表头小字 */
.detail-label {
  font-size: 12px;
  color: rgba(184, 184, 184, 0.85);
}
/* 权益类型文字：白色，稍大 */
.benefit-type {
  color: #ffffff !important;
  font-size: 15px;
  font-weight: 600;
}
/* 金额文字：高亮显示 */
.price-text {
  font-size: 18px;
  color: #fbbf24 !important; /* 金橙色，高价值感 */
  font-weight: 700 !important;
}
/* 输入框适配深色主题 */
:deep(.ant-input) {
  height: 45px;
  background: #0f172a !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #ffffff !important;
}

:deep(.ant-input::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}
/* 输入框聚焦时高亮 */
:deep(.ant-input:focus) {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3) !important;
}
/* 按钮样式 */
:deep(.ant-btn) {
  font-size: 16px !important; /* 设置字体大小 */
  height: 45px;
  margin-left: 0 !important; /* 重置左边距 */
  width: 100%; /* 确保全宽 */
}
</style>

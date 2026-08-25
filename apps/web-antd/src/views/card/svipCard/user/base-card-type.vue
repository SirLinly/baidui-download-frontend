<script setup lang="ts">
import {
  Card,
  Flex,
  Typography
} from 'ant-design-vue';
import { useRedemptionStore } from '#/store/redemption';
const redemptionStore = useRedemptionStore();



</script>

<template>
  <!-- 内层卡片 -->
  <Card class="bg-in-card">
    <!-- 修正：使用正确的 justify 属性 -->
    <Flex justify="space-between" align="center">
      <Typography.Text class="detail-label">权益类型</Typography.Text>
      <Typography.Text class="detail-label">面值金额</Typography.Text>
    </Flex>
    <Flex justify="space-between" align="center">
      <Typography.Text strong class="benefit-type">{{redemptionStore.cardInfo.type}}</Typography.Text>
      <Typography.Text strong class="benefit-type price-text"
        >¥{{redemptionStore.cardInfo.price}}</Typography.Text
      >
    </Flex>
  </Card>
</template>
<style scoped>
 .bg-in-card {
  height: 85px;
  margin-top: 10px;
  background: #0e1422;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 15px; /* 添加圆角 */
  display: flex !important; /* 启用 Flex 布局 */
  flex-direction: column !important; /* 垂直方向 */
  justify-content: center !important; /* 垂直居中 */
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
</style>

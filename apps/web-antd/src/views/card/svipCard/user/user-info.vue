<script lang="ts" setup>
import { ref } from 'vue';
import {
  Button,
  Card,
  Flex,
  Avatar,
  Tag,
  Space,
  Result,
  Typography,
} from 'ant-design-vue';
import { userConfirm } from '#/api/svipCard';
import { useDebounceFn } from '@vueuse/core'; // 导入防抖函数
import { useRedemptionStore } from '#/store/redemption';
const redemptionStore = useRedemptionStore();
const btnStatus = ref(false);
const btnLoading = ref(false);

// 使用防抖函数，延迟 500ms
const debouncedSubmit = useDebounceFn(async () => {
  // 提交充值
  redemptionStore.spin.state = true;
  btnLoading.value = true;
  await userConfirm({ key: redemptionStore.cardInfo.vipKey })
    .then((res) => {
      redemptionStore.cardInfo = res;
    })
    .finally(() => {
      redemptionStore.spin.state = false;
    });
}, 500);

async function sumibit() {
  debouncedSubmit();
}
</script>
<template>
  <Card class="bg-in-card" hoverable>
    <Flex vertical gap="large">
      <Card.Meta>
        <template #avatar>
          <Avatar
            :size="50"
            :src="redemptionStore.cardInfo.personalUser.photoUrl"
          />
        </template>
        <template #title>
          <Space size="small">
            <Typography.Text class="benefit-type">{{
              redemptionStore.cardInfo.personalUser.username
            }}</Typography.Text>
            <!-- <Tag  color="gold">SVIP</Tag> -->
            <Tag
              color="orange"
              v-if="redemptionStore.cardInfo.baiduVipInfo.memberType === 2"
              >SVIP</Tag
            >
            <Tag
              color="red"
              v-else-if="redemptionStore.cardInfo.baiduVipInfo.memberType === 1"
              >VIP</Tag
            >
            <Tag
              color="blue"
              v-else="redemptionStore.cardInfo.baiduVipInfo.memberType === 0"
              >普通用户</Tag
            >
          </Space>
        </template>
        <template #description>
          <Typography.Text class="detail-label"
            >UK: {{ redemptionStore.cardInfo.personalUser.uk }}</Typography.Text
          >
        </template>
      </Card.Meta>
      <!-- <Flex vertical  gap="small">
        <Flex gap="large">
          <Typography.Text class="svip-info">
            开通时间：
          </Typography.Text>
          <Typography.Text class="svip-info">
            {{ redemptionStore.cardInfo.baiduVipInfo.startTime }}
          </Typography.Text>
        </Flex>
        <Flex gap="large">
          <Typography.Text class="svip-info">
            到期时间：
          </Typography.Text>
          <Typography.Text class="svip-info">
            {{ redemptionStore.cardInfo.baiduVipInfo.expireTime }}
          </Typography.Text>
        </Flex>
        <Flex gap="large">
          <Typography.Text class="svip-info">
            tips: {{ redemptionStore.cardInfo.baiduVipInfo.tipMessage }}
          </Typography.Text>
        </Flex>
      </Flex> -->
    </Flex>
  </Card>
  <Result
    v-if="redemptionStore.cardInfo.status === 2"
    title="充值申请已提交"
    sub-title="我们将在1-3分钟内，完成您发起的充值申请，请耐心等待..."
  />
  <Result
    v-if="redemptionStore.cardInfo.status === 4"
    status="success"
    title="充值成功"
    :sub-title="redemptionStore.cardInfo.baiduVipInfo.tipMessage"
  />

  <Button
    type="primary"
    @click="sumibit"
    :disabled="btnStatus"
    :loading="btnLoading"
    v-if="redemptionStore.cardInfo.status === 1"
    >确定充值</Button
  >
</template>
<style scoped>
.bg-in-card {
  background: #0e1422;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 15px; /* 添加圆角 */
  display: flex !important; /* 启用 Flex 布局 */
  flex-direction: column !important; /* 垂直方向 */
  justify-content: center !important; /* 垂直居中 */
}
/* 权益类型文字：白色，稍大 */
.benefit-type {
  color: #ffffff !important;
  font-size: 15px;
  font-weight: 600;
}
/* 权益信息 - 表头小字 */
.detail-label {
  font-size: 12px;
  color: rgba(184, 184, 184, 0.85);
}
.svip-info {
  color: white;
}
:deep(.ant-result-title) {
  color: white !important;
}
:deep(.ant-result-subtitle) {
  color: white !important;
}
</style>

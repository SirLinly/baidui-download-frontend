<script lang="ts" setup>
import {ref, computed, onUnmounted} from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { Flex,QRCode,Typography,message} from 'ant-design-vue';

import { pay } from '#/api/enterprise';


const data = ref();
const [Modal, modalApi] = useVbenModal({
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = modalApi.getData<Record<string, any>>();
      // 开始轮询支付状态
      startPolling();
    } else {
      // 关闭时清理轮询
      stopPolling();
    }
  },
});

// 轮询相关变量
const pollingTimer = ref<NodeJS.Timeout | null>(null);
const isPaid = ref(false);

// 计算实际支付金额（将分转换为元）
const actualAmount = computed(() => {
  const amount = data.value?.payInfo?.dxmQuery?.payAmount || 0;
  return (amount / 100).toFixed(2);
});

// 开始轮询
function startPolling() {
  // 立即检查一次
  checkPaymentStatus();
  
  // 每1秒轮询一次
  pollingTimer.value = setInterval(() => {
    checkPaymentStatus();
  }, 2000);
}

// 检查支付状态
async function checkPaymentStatus() {
  try {
    const result = await pay({epId: data.value.record.id, memberId: data.value.row.id},data.value.payInfo.dxmQuery);
    
    // 根据接口返回判断支付状态
    if (result.err_no === 0 && result.PayStatus !== 1) {
      stopPolling();
      isPaid.value = true;
      message.success('开通业务成功',result.PayStatus);
      // 可以关闭模态框或执行其他操作
      modalApi.close();
      // 设置成功传递给抽屉
      modalApi.setData({
        isPaid: true,
      });
    }
  } catch (error) {
    // 可以根据需要决定是否停止轮询
    stopPolling();
  }
}

// 停止轮询
function stopPolling() {
  if (pollingTimer.value) {
    clearInterval(pollingTimer.value);
    pollingTimer.value = null;
  }
}

// 组件卸载时清理
onUnmounted(() => {
  stopPolling();
});

</script>
<template>
  <Modal> 
    <Flex vertical justify="center" align="center" gap="middle">
      <Typography.Title :level="5">
        {{ data.payInfo.dxmQuery.title }}
      </Typography.Title>
        <QRCode :value="data.payInfo.dxmQr.data.shortUrl" />
        <Typography.Text>
          支付金额: ￥{{ actualAmount }}
        </Typography.Text>
    </Flex >
  </Modal>
</template>
<style scoped>
.qrcode-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
}
</style>

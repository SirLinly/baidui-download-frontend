<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'; // 添加 watch
import { Image, Flex, Spin, Result, Button, Skeleton,Space,Typography } from 'ant-design-vue';
import { useConvertCardStore } from '#/store/convertCard';
import { usePersonalLoginStore } from '#/store/personalLogin';
import { MidReloadOutlined,MidCheck,MidDismiss,MidApprovals } from '@vben/icons';
const convertCardStore = useConvertCardStore();
const personalLoginStore = usePersonalLoginStore();
const pollTimer = ref<number | null>(null);
const pollCount = ref(0);

const POLL_INTERVAL = 3000;
const MAX_POLL_ATTEMPTS = 20;

// 停止轮询
const stopPolling = () => {
  pollTimer.value && clearTimeout(pollTimer.value);
  pollTimer.value = null;
};

// 检查登录状态
const checkLoginStatus = async () => {
  if (pollCount.value >= MAX_POLL_ATTEMPTS) {
    stopPolling();
    return;
  }
  pollCount.value++;

  try {
    // 等待轮询结果
    const result = await personalLoginStore.qrSign();
    
    // 根据返回的状态决定下一步操作
    if (result.errno === 1) {
      // 未扫码，继续轮询
      pollTimer.value = window.setTimeout(checkLoginStatus, POLL_INTERVAL);
    } else if (result.channel_v?.status === 1) {
      // 扫码成功，继续轮询等待登录
      pollTimer.value = window.setTimeout(checkLoginStatus, POLL_INTERVAL);
    } else if (result.channel_v?.status === 0) {
      // 登录成功，调用登录方法获取新卡密信息
      const newCardKey = await personalLoginStore.loginWithBduss();
      convertCardStore.cardInfo = newCardKey;
      stopPolling();
    } else {
      // 其他状态，停止轮询
      stopPolling();
    }
  } catch (error) {
    console.error('轮询登录状态失败:', error);
    stopPolling();
  }
};

// 获取二维码（添加 key 检查）
const fetchQrCode = async () => {
  pollCount.value = 0;
  personalLoginStore.setCardKey(convertCardStore.cardInfo.cardKey);
  await personalLoginStore.getQrCode();
  stopPolling(); // 先停止可能存在的轮询
  pollTimer.value = window.setTimeout(checkLoginStatus, POLL_INTERVAL);
};

// 重新获取二维码
const restartScan = () => {
  fetchQrCode();
};

// 监听 store cardInfo 变化（核心修复：数据就绪后自动触发）
watch(
  () => convertCardStore.cardInfo,
  (newInfo) => {
    if (newInfo && newInfo.cardKey) {
      // 只在初始加载时触发
      fetchQrCode();
      stopPolling();
    }
  },
  { immediate: true }, // 立即执行，但因初始为空，会跳过
);
</script>

<template>
  <div class="qr-code-container">
    <Spin
      :spinning="personalLoginStore.qrCodeInfo.status === 'loading'"
      tip="加载中..."
    >
      <div class="qr-code-border">
        <Skeleton
          v-if="!personalLoginStore.qrCodeInfo.image"
          :loading="true"
          :avatar="{ size: 130, shape: 'square' }"
          active
        >
          <template #template>
            <Skeleton.Avatar
              :size="130"
              :shape="'square'"
              style="width: 130px; height: 130px; display: block"
            />
          </template>
          <template #default>
            <Image
              :src="personalLoginStore.qrCodeInfo.image"
              :preview="false"
              :width="130"
              :height="130"
            />
          </template>
        </Skeleton>
        <Image
          v-else
          :src="personalLoginStore.qrCodeInfo.image"
          :preview="false"
          :width="120"
        />
        <!-- 状态遮罩层 -->
        <div 
          v-if="personalLoginStore.qrCodeInfo.status !== 'loading' && personalLoginStore.qrCodeInfo.status !== 'active'" 
          class="status-overlay"
        >
          <Flex 
            vertical 
            justify="center" 
            align="center" 
            gap="middle"
            class="status-content"
          >
            <div v-if="personalLoginStore.qrCodeInfo.status === 'scanned'">
              <Flex vertical align="center" justify="center">
               <Space align="center" :size="1">
                 <MidCheck style="font-size: 20px"/>
                 <Typography.Text>已扫码</Typography.Text>
               </Space>
             </Flex>
            </div>
            <div v-else-if="personalLoginStore.qrCodeInfo.status === 'success'">
               <Flex vertical align="center" justify="center">
               <Space align="center" :size="1">
                 <MidApprovals style="font-size: 20px"/>
                 <Typography.Text>认证中...</Typography.Text>
               </Space>
             </Flex>
            </div>
            <div v-else-if="personalLoginStore.qrCodeInfo.status === 'expired'">
             <Flex vertical align="center" justify="center">
               <Space align="center" :size="1">
                 <MidDismiss style="font-size: 20px"/>
                 <Typography.Text>二维码过期</Typography.Text>
               </Space>
               <Button type="link" @click="restartScan">
                 <Space align="center">
                   <MidReloadOutlined/>
                   <span>点击刷新</span>
                 </Space>
               </Button>
             </Flex>
            </div>
          </Flex>
        </div>
      </div>
    </Spin>
   <Typography.Text class="scan-hint">
     请使用<span style="color: red;">「百度网盘APP」</span>扫码授权
   </Typography.Text>
  </div>
</template>

<style scoped>
.qr-code-container {
  padding: 5px 20px 20px 20px;
  text-align: center;
}

.qr-code-border {
  position: relative;
  border: 1px solid #ededed;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: inline-block;
  line-height: 0;
}

.status-overlay {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  background-color: rgba(255, 255, 255, 0.98);
  border-radius: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-content {
  width: 100%;
  height: 100%;
  padding: 10px;
}

.scan-hint {
  display: block;
  margin-top: 15px;
  color: #666;
  font-size: 14px;
}
</style>

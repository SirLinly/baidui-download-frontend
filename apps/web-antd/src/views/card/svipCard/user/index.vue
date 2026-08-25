<script setup lang="ts">
import { onMounted,watch,ref } from 'vue';
import { Flex } from 'ant-design-vue';
import BaseCard from './base-card.vue';
import {queryInfo} from '#/api/svipCard/user'
import { useRedemptionStore } from '#/store/redemption';


const redemptionStore = useRedemptionStore();
const isReady = ref(false);
// 获取gid
redemptionStore.updateGid();

onMounted(async () => {
  try {
    const key = new URLSearchParams(location.search).get('key');
    if (!key) throw new Error('卡密格式错误');
    const vipKeyInfo = await queryInfo({ key });
    if (!vipKeyInfo || vipKeyInfo.vipKey === null) throw new Error('卡密不存在');
    redemptionStore.cardInfo = vipKeyInfo;
  } catch (error) {
    console.log(error);
  }
});

watch(
  () => redemptionStore.cardInfo,
  () => {
    // 如果更新,挂载组件
    isReady.value = true;
  }
);
</script>

<template>
  <div class="bg-wrapper">
    <Flex justify="center" align="center" vertical class="content">
      <BaseCard v-if="isReady"/>
    </Flex>
  </div>
</template>

<style scoped>
/* 背景层：全屏但可滚动 */
.bg-wrapper {
  min-height: 100vh;
  min-width: 100vw;
  background: #0f172a;
  background-image:
    radial-gradient(at 0% 0%, rgba(29, 78, 216, 0.18) 0px, transparent 55%),
    radial-gradient(at 100% 100%, rgba(30, 58, 138, 0.18) 0px, transparent 55%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.content {
  width: 100%;
  max-width: 1200px;
  padding: 1rem;
  box-sizing: border-box;
}
</style>

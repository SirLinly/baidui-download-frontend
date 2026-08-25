<script setup lang="ts">
import { onMounted} from 'vue';

import { Card, Flex, message, Alert, Button } from 'ant-design-vue';
import { useConvertCardStore } from '#/store/convertCard';
import { useRouter } from 'vue-router';


import CardInfo from './card-info.vue';
import Show from './show.vue';
import Base from './base.vue';
const convertCardStore = useConvertCardStore();
const router = useRouter(); // 在 setup 中定义 router 实例

onMounted(async () => {
  const key = new URLSearchParams(location.search).get('key');
  if (!key) {
    message.error('卡密地址有误，请检查');
    await router.push('/404');
    return; // 添加 return 语句，避免后续代码执行
  }
  // 卡密有效
  convertCardStore.setKey(key);
});
</script>

<!-- src/views/home/HomePage.vue -->
<template>
  <div class="home-page">
    <header class="header">
      <h1>{{ convertCardStore.cardInfo.setConfig.siteTitle }}</h1>
      <h2>{{ convertCardStore.cardInfo.setConfig.description }}</h2>
    </header>
    <main class="main-content">
      <Flex vertical gap="middle">
        <Alert banner v-if="convertCardStore.cardInfo.setConfig.commercialFirst.enabled">
          <template #action v-if="convertCardStore.cardInfo.setConfig.commercialFirst.buttonEnabled">
            <a :href="convertCardStore.cardInfo.setConfig.commercialFirst.buttonUrl" target="_blank" rel="noopener noreferrer">
              <Button size="small" type="primary">
                {{ convertCardStore.cardInfo.setConfig.commercialSecond.buttonText }}
              </Button>
            </a>
          </template>
          <template #message>
            <div class="announcement-wrapper">
              <div class="announcement-content">
                {{ convertCardStore.cardInfo.setConfig.commercialFirst.content }}
              </div>
            </div>
          </template>
        </Alert>
        <Alert type="info" v-if="convertCardStore.cardInfo.setConfig.commercialSecond.enabled">
           <template #action v-if="convertCardStore.cardInfo.setConfig.commercialSecond.buttonEnabled">
            <a :href="convertCardStore.cardInfo.setConfig.commercialSecond.buttonUrl" target="_blank" rel="noopener noreferrer">
              <Button size="small" type="primary">
                {{ convertCardStore.cardInfo.setConfig.commercialSecond.buttonText }}
              </Button>
            </a>
          </template>
          <template #message>
            {{ convertCardStore.cardInfo.setConfig.commercialSecond.content }}
          </template>
        </Alert>
        <!-- <Alert type="info">
          <template #message>
            提示⚠️：无法加速，检查网盘客户端版本是否最新版
          </template>
        </Alert> -->
        <!-- <Alert type="error">
          <template #message>
            注意❗️：文件限制 20GB，下载完成后，再次转换
          </template>
        </Alert> -->
        <!-- 实现3:7分栏比例 -->
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card class="md:col-span-1">
            <CardInfo />
          </Card>
          <Card class="md:col-span-2" hoverable>
            <Base />
          </Card>
        </div>
        <div class="grid grid-cols-1">
          <Card title="简要步骤:">
            <Show />
          </Card>
        </div>
      </Flex>
    </main>
    <footer class="footer">
      <p>{{ convertCardStore.cardInfo.setConfig.copyrightText }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* 轮播公告样式 */
.announcement-wrapper {
  overflow: hidden;
  white-space: nowrap;
}

.announcement-content {
  display: inline-block;
  padding-left: 100%;
  animation: marquee 15s linear infinite;
  color: red;
  font-weight: 500;
  font-size: 15px;
}

.announcement-content:hover {
  animation-play-state: paused;
}

@keyframes marquee {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, 0);
  }
}

.home-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  /* 使用 Tailwind 的条件类语法 */
  @apply bg-gray-100 dark:bg-gray-900;
}

.header {
  @apply bg-blue-500 py-4 text-center text-white dark:bg-blue-800;
}

.header h1 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.header nav button {
  @apply mr-4 cursor-pointer rounded border-none bg-white px-4 py-2 text-blue-500 dark:bg-gray-700 dark:text-blue-300;
}

.main-content {
  flex: 1;
  padding: 1rem 1rem 0;
  max-width: 1150px;
  margin: 0 auto;
  width: 100%;
}

.footer {
  @apply bg-gray-100 p-4 text-center dark:bg-gray-800 dark:text-gray-300;
}
</style>

<script lang="ts" setup>
import type {
  WorkbenchProjectItem,
  WorkbenchQuickNavItem, WorkbenchTrendItem
} from '@vben/common-ui';

import { useRouter } from 'vue-router';
import Headder from './headder.vue';
import {
  WorkbenchProject,
  WorkbenchQuickNav, WorkbenchTrends
} from '@vben/common-ui';
import { preferences } from '@vben/preferences';
import { openWindow } from '@vben/utils';
import { useUserStore } from '@vben/stores';
const userStore = useUserStore();

// 这是一个示例数据，实际项目中需要根据实际情况进行调整
// url 也可以是内部路由，在 navTo 方法中识别处理，进行内部跳转
// 例如：url: /dashboard/workspace
const projectItems: WorkbenchProjectItem[] = [
  {
    color: '',
    content: '不要等待机会，而要创造机会。',
    date: '2021-04-01',
    group: '学习是一种信仰',
    icon: 'https://img0.baidu.com/it/u=2847275791,897687200&fm=253&fmt=auto&app=138&f=JPEG?w=243&h=243',
    title: '学习通/超星尔雅',
    url: 'https://erya.mooc.chaoxing.com',
  },
  {
    color: '#3fb27f',
    content: '现在的你决定将来的你。',
    date: '2021-04-01',
    group: '智慧树下智慧果，欢乐多又多',
    icon: 'https://miaobi-lite.bj.bcebos.com/miaobi/5mao/b%2755%2Bl5Yiw5pm65oWn5qCRXzE3MzU4Mzc0ODQuNDQ4NTU4OA%3D%3D%27/0.png',
    title: '知到/智慧树',
    url: 'https://www.zhihuishu.com/',
  },
  {
    color: '#e18525',
    content: '没有什么才能比努力更重要。',
    date: '2021-04-01',
    group: '中国大学Mooc',
    icon: 'https://img1.baidu.com/it/u=498719213,120281600&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
    title: '慕课/中国大学Mooc',
    url: 'https://www.icourse163.org/',
  },
];

// 同样，这里的 url 也可以使用以 http 开头的外部链接
const quickNavItems: WorkbenchQuickNavItem[] = [
  {
    color: '#1fdaca',
    icon: 'ion:home-outline',
    title: '首页',
    url: '/',
  },
  {
    color: '#bf0c2c',
    icon: 'ion:grid-outline',
    title: '课程查询',
    url: '/course',
  },
  {
    color: '#e18525',
    icon: 'ion:layers-outline',
    title: '订单列表',
    url: '/orders',
  },
  {
    color: '#3fb27f',
    icon: 'ant-design:user-add-outlined',
    title: '代理列表',
    url: '/agents', // 这里的 URL 是示例，实际项目中需要根据实际情况进行调整
  },
  {
    color: '#4daf1bc9',
    icon: 'ant-design:alipay-circle-filled',
    title: '在线充值',
    url: '/online',
  },
  {
    color: '#00d8ff',
    icon: 'ion:bar-chart-outline',
    title: '个人中心',
    url: '/Info',
  },
];


const trendItems: WorkbenchTrendItem[] = [
  {
    avatar: 'svg:avatar-2',
    content: `学习通大量接单,不暂停。`,
    date: '2025-7-3',
    title: '作者',
  },
];

const router = useRouter();

// 这是一个示例方法，实际项目中需要根据实际情况进行调整
// This is a sample method, adjust according to the actual project requirements
function navTo(nav: WorkbenchProjectItem | WorkbenchQuickNavItem) {
  if (nav.url?.startsWith('http')) {
    openWindow(nav.url);
    return;
  }
  if (nav.url?.startsWith('/')) {
    router.push(nav.url).catch((error) => {
      console.error('Navigation failed:', error);
    });
  } else {
    console.warn(`Unknown URL for navigation item: ${nav.title} -> ${nav.url}`);
  }
}
</script>

<template>
  <div class="p-5">
    <Headder
      :avatar="userStore.userInfo?.avatar || preferences.app.defaultAvatar"
    >
      <template #title>
        早安, {{ userStore.userInfo?.realName }}, 开始您一天的工作吧！
      </template>
      <template #description> 今日晴，20℃ - 32℃！ </template>
    </Headder>

    <div class="mt-5 flex flex-col lg:flex-row">
      <div class="mr-4 w-full lg:w-3/5">
        <WorkbenchProject :items="projectItems" title="项目" @click="navTo" />
        <WorkbenchTrends :items="trendItems" class="mt-5" title="最新动态" />
      </div>
      <div class="w-full lg:w-2/5">
        <WorkbenchQuickNav
          :items="quickNavItems"
          class="mt-5 lg:mt-0"
          title="快捷导航"
          @click="navTo"
        />
      </div>
    </div>
  </div>
</template>

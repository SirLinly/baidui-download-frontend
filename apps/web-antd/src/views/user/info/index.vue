<script setup lang="ts">
import { ref,onMounted } from 'vue';
import { Page } from '@vben/common-ui';
import { Card } from 'ant-design-vue';
import Welcome from './welcome.vue';
import ShowInfo from './show-info.vue';
import UserSetting from './user-setting.vue';
import ProxySetting from './proxy-setting.vue';
import ApiSetting from './api-setting.vue';
import AppleNotice from './apple-notice.vue';
import BasicSetting from './basic-setting.vue';

import { useUserSettingStore } from '#/store/userSetting';
const userSettingStore = useUserSettingStore();


const tabList = [
  { key: 'tab1', tab: '基本设置' },
  { key: 'tab2', tab: '代理设置' },
  { key: 'tab3', tab: '推送配置' },
  { key: 'tab4', tab: '前端配置' },
];

const activeTabKey = ref('tab1');

const handleTabChange = (key: string) => {
  activeTabKey.value = key;
};
// 挂载时获取用户配置
onMounted(()=>{
 userSettingStore.getCofing();
})
</script>

<template>
  <Page>
    <div class="grid grid-cols-1 items-start gap-4 md:grid-cols-[25%_75%]">
      <div>
        <ShowInfo />
      </div>
      <div class="grid grid-cols-1 gap-4 md:mr-4 md:grid-cols-1">
        <Card>
          <Welcome />
        </Card>
        <Card
          :tab-list="tabList"
          :active-tab-key="activeTabKey"
          @tab-change="handleTabChange"
          title="设置"
        >
          <!-- 使用条件渲染显示不同内容 -->
          <div v-if="activeTabKey === 'tab1'">
            <UserSetting />
          </div>
          <div v-else-if="activeTabKey === 'tab2'">
            <ProxySetting/>
          </div>
          <div v-else-if="activeTabKey === 'tab3'">
           <AppleNotice/>
          </div>
          <div v-else-if="activeTabKey === 'tab4'">
            <BasicSetting/>
          </div>
        </Card>
      </div>
    </div>
  </Page>
</template>

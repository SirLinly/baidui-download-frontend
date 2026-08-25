<script setup lang="ts">
import { h } from 'vue';
import {
  Flex,
  Descriptions,
  Button,
  Tag,
  Input,
  message,
} from 'ant-design-vue';

import { useConvertCardStore } from '#/store/convertCard';
import { alert, prompt, confirm, useAlertContext } from '@vben/common-ui';
import { useCardRenewal } from '#/api/cardRenewal';
import { clearQuota } from '#/api/convert';

const convertCardStore = useConvertCardStore();

function showSlotsPrompt() {
  const cardKey = new URLSearchParams(location.search).get('key');
  prompt({
    component: () => {
      // 获取弹窗上下文。注意：只能在setup或者函数式组件中调用
      const { doConfirm } = useAlertContext();
      return h(Input, {
        onKeydown(e: KeyboardEvent) {
          if (e.key === 'Enter') {
            e.preventDefault();
            // 调用弹窗提供的确认方法
            doConfirm();
          }
        },
        placeholder: '请输入您的CDK兑换码',
        prefix: 'CDK:',
        type: 'text',
      });
    },
    content: '增加卡密使用时长\n请输入您获得的CDK兑换码,增加卡密使用时长。',
    icon: 'question',
    modelPropName: 'value',
    title: 'CDK兑换码',
    beforeClose: async ({ isConfirm, value }) => {
      // 如果是确认操作但没有输入值，阻止关闭
      if (isConfirm && !value) {
        message.error('请输入您的CDK兑换码');
        return false; // 阻止关闭
      }

      // 如果是确认操作且有输入值，执行续费逻辑
      if (isConfirm && value) {
        try {
          await useCardRenewal({
            cardKey: cardKey,
            cardRenewalKey: value,
          });
          // 续费成功，允许关闭
          alert({
            content: '充值成功，即将刷新界面',
            icon: 'success',
            title: '提示',
          }).then(() => {
            // 在用户关闭成功提示后刷新界面
            window.location.reload();
          });
          return true;
        } catch {
          return false; // 阻止关闭
        }
      }
      return true; // 其他情况允许关闭
    },
  });
}
function clearQuotaBtn() {
  confirm({
    content: '是否要删除曾经转换的文件？',
    icon: 'error',
    title: '清理文件',
    async beforeClose({ isConfirm }) {
      if (isConfirm) {
        convertStore.spin.state = true;
        convertStore.spin.tip = '文件清理中,请稍后...';
        // 调用删除方法
        clearQuota({ key: convertStore.cardInfo.cardKey, type: 'outUser' })
          .then(() => {
            message.success('清理成功');
          })
          .finally(() => {
            convertStore.spin.state = false;
          });
        return true;
      }
    },
  });
}


</script>

<template>
  <Flex vertical>
    <div>
      <Descriptions :column="1">
        <Descriptions.Item label="卡密">{{
          convertCardStore.cardInfo.cardKey
        }}</Descriptions.Item>
        <Descriptions.Item label="卡密状态">
          <Tag v-if="convertCardStore.cardInfo.status === 0" color="processing"
            >未使用</Tag
          >
          <Tag v-else-if="convertCardStore.cardInfo.status === 1" color="cyan"
            >已启用</Tag
          >
          <Tag v-else-if="convertCardStore.cardInfo.status === 2" color="green"
            >已使用</Tag
          >
          <Tag v-else-if="convertCardStore.cardInfo.status === 3" color="red"
            >已过期</Tag
          >
          <Tag v-else-if="convertCardStore.cardInfo.status === 4" color="red"
            >已禁用</Tag
          >
          <Tag v-else color="red">已失效</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="到期时间">{{
          convertCardStore.cardInfo.expireTime
        }}</Descriptions.Item>
        <Descriptions.Item label="剩余次数">
          <Tag v-if="convertCardStore.cardInfo.restUsedCount < 0" color="#1890ff">
            无限制
          </Tag>
          <Tag v-if="convertCardStore.cardInfo.restUsedCount < 0" color="#1890ff">
            <a href="https://pan.baidu.com/disk/cert/download" target="_blank"
              >百度网盘最新版（下载）</a
            >
          </Tag>
          <span v-else>
            <Tag color="#87d068"
              >{{ convertCardStore.cardInfo.restUsedCount }} 次</Tag
            >
            <Tag color="#1890ff">
              <a href="https://pan.baidu.com/disk/cert/download" target="_blank"
                >百度网盘最新版（下载）</a>
            </Tag>
          </span>
        </Descriptions.Item>
      </Descriptions>
    </div>
    <div>
      <Flex vertical gap="middle" v-if="convertCardStore.cardInfo.status < 5">
  <!-- 第一行：两个按钮 -->
  <Flex gap="middle">
    <Button
      class="custom-danger-btn"
      type="default"
      style="flex: 1; max-width: 150px;"
      href="https://www.yuque.com/used/yr9num/doc"
      target="_blank"
    >
      教程(必看)
    </Button>
    <Button
      danger
      style="flex: 1; max-width: 150px;"
      href="https://www.yuque.com/r/note/2ad262e3-1216-4e9d-bcb6-06d68c8585c8?#"
      target="_blank"
    >
      领取500G空间
    </Button>
  </Flex>

  <!-- 第二行：一个按钮 -->
  <Flex gap="middle">
    <Button
      class="custom-blue-btn"
      style="flex: 1; max-width: 150px;"
      @click="showSlotsPrompt"
    >
      充值兑换
    </Button>
  </Flex>

  <!-- 第三行：一个按钮 -->
  <Flex gap="middle">
    <Button
      type="primary"
      style="flex: 1; max-width: 150px;"
      @click="clearQuotaBtn"
    >
      清理文件
    </Button>
  </Flex>
</Flex>
    </div>
  </Flex>
</template>
<style scoped>
.custom-blue-btn {
  background-color: #1ed8d8 !important; /* 深粉色 */
  border-color: #1ed8d8 !important;
  color: white !important;
}

.custom-blue-btn:hover {
  background-color: #68ece1 !important;
  border-color: #68ece1 !important;
}
.custom-danger-btn {
  background-color: #ff4d4f !important; /* 深粉色 */
  border-color: #ff4d4f !important;
  color: white !important;
}

.custom-danger-btn:hover {
  background-color: #ff7875 !important;
  border-color: #ff7875 !important;
}
</style>

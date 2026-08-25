<script lang="ts" setup>
import { Flex,Tabs,TabPane } from 'ant-design-vue';
import LoginQrCode from './baseModule/login-qr-code.vue';
import LoginSmsCode from './baseModule/login-sms-code.vue';
// 修改 items 定义
</script>
<template>
  <Flex justify="center">
    <Flex>
      <Tabs defaultActiveKey="1" centered>
        <TabPane key="1" tab="扫码登录">
          <LoginQrCode/>
        </TabPane>
        <TabPane key="2" tab="短信登录">
          <LoginSmsCode/>
        </TabPane>
      </Tabs>
    </Flex>
  </Flex>
</template>
<style scoped>
</style>

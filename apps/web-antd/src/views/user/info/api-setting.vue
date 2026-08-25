<script lang="ts" setup>
import { watch, h} from 'vue';

import {Space,Input,Button, message,Tooltip, Typography } from 'ant-design-vue';

import { useVbenForm,z } from '#/adapter/form';


import { getTokenCofig } from '#/api/userSetting';
import { useUserSettingStore } from '#/store/userSetting';

const userSettingStore = useUserSettingStore();

const [Form, formApi] = useVbenForm({
  // 所有表单项共用，可单独在表单内覆盖
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    // labelClass: 'w-1/6',
  },
  // 提交函数
  // handleSubmit: onSubmit,
  showDefaultActions:false,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'token',
      label: 'ApiToken',
      rules: 'required',
    },
  ],
  wrapperClass: 'grid-cols-1',
});

function onSubmit() {
  getTokenCofig().then((res)=>{
    message.success('生成token成功');
    console.log(res);
    userSettingStore.settingConfig.apiToken = res.token;
    formApi.setFieldValue('token',res.token)
  })
}

// 使用 watch 监听 store 变化
watch(
  () => userSettingStore.settingConfig?.apiToken,
  (apiInfo) => apiInfo && formApi.setFieldValue('token', apiInfo),
  { immediate: true }
);
</script>

<template>
  <Form>
    <template #token="slotProps">
      <Space>
        <Space.Compact block>
          <Input  v-bind="slotProps.componentProps" v-model:value="slotProps.modelValue" disabled  style="width: 300px;"/>
          <Button type="primary" @click="onSubmit()">点击生成</Button>
          <Button type="default">对接文档</Button>
        </Space.Compact>
        <Tooltip title="请妥善保管,防止泄露">
          <Typography.Text type="danger">ApiToken用于对接本站</Typography.Text>
        </Tooltip>
      </Space>
    </template>
  </Form>
</template>

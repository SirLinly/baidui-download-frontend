<script lang="ts" setup>
import { watch, ref} from 'vue';

import {Space,Input,Button, message,Tooltip, Typography } from 'ant-design-vue';

import { useVbenForm,z } from '#/adapter/form';

import { saveConfig } from '#/api/userSetting';

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
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'ipLocation',
      label: '本机IP',
    },
    {
      component: 'Input',
      fieldName: 'proxyUrl',
      componentProps: {
        placeholder: '请输入JSON格式接口地址',
      },
      label: '接口地址',
      rules: 'required',
    },
    
  ],
  wrapperClass: 'grid-cols-1',
});


function onSubmit(values: Record<string, any>) {
  saveConfig({configKey:'proxyUrl',value:values.proxyUrl}).then(()=>{
    message.success('修改成功');
  })
}


// 使用 watch 监听 store 变化
watch(
  () => userSettingStore.settingConfig,
  (info) => info && formApi.setValues(info),
  { immediate: true }
);
</script>

<template>
  <Form>
    <template #ipLocation="slotProps">
      <Space>
        <Space.Compact>
          <Input v-bind="slotProps.componentProps" v-model:value="slotProps.modelValue" disabled />
          <Button>复制</Button>
        </Space.Compact>
        <Tooltip title="Useful information">
          <Typography.Text type="danger">注意:请添加本机至白名单</Typography.Text>
        </Tooltip>
      </Space>
    </template>
  </Form>
</template>

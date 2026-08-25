<script lang="ts" setup>
import { watch, h } from 'vue';

import { message } from 'ant-design-vue';
import { useVbenForm, z } from '#/adapter/form';

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
    labelClass: 'w-1/6',
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 垂直布局，label和input在不同行，值为vertical
  // 水平布局，label和input在同一行
  layout: 'horizontal',
  schema: [
    {
      component: 'Input',
      fieldName: 'appleNotice.url',
      componentProps: {
        placeholder: '请输入推送地址',
      },
      label: 'url',
    },
    {
      component: 'Input',
      fieldName: 'appleNotice.sound',
      componentProps: {
        placeholder: '请输入推送铃声',
      },
      label: '铃声',
    },
    {
      component: 'Input',
      fieldName: 'appleNotice.level',
      componentProps: {
        placeholder: '请输入通知级别',
      },
      label: '通知级别',
    }
  ],
  wrapperClass: 'grid-cols-1',
});

function onSubmit(values: Record<string, any>) {
  saveConfig(values).then(()=>{
    message.success('修改成功');
  })
}
// 使用 watch 监听 store 变化
watch(
  () => userSettingStore.settingConfig,
  (settings) => settings && formApi.setValues(settings),
  { immediate: true }
);
</script>

<template>
  <Form />
</template>

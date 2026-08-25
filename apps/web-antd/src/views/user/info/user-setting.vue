<script lang="ts" setup>
import { onMounted, h } from 'vue';

import { message } from 'ant-design-vue';

import { useVbenForm, z } from '#/adapter/form';

import { updateUser } from '#/api/core/user';

import { useUserStore } from '@vben/stores';
const userStore = useUserStore();
const { userInfo } = userStore;
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
      fieldName: 'email',
      componentProps: {
        placeholder: '请输入邮箱，用于接收紧急通知',
      },
      label: '邮 箱',
      help: '邮箱用于接收紧急通知',
      rules: z.string().email('请输入正确的邮箱'),
    },
    {
      component: 'Input',
      fieldName: 'password',
      componentProps: {
        placeholder: '不修改密码请留空',
      },
      label: '密 码',
      
    },
  ],
  wrapperClass: 'grid-cols-1',
});

function onSubmit(values: Record<string, any>) {
  updateUser(values).then(() => {
    message.success('修改成功');
  });
}

// 设置初始值
onMounted(() => {
  formApi.setValues({
    ...userInfo,
    password: '', // 密码单独处理
  });
});
</script>

<template>
  <Form />
</template>

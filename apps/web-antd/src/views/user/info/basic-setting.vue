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
      fieldName: 'siteTitle',
      componentProps: {
        placeholder: '请输入页面的标题',
      },
      label: '标题',
    },
    {
      component: 'Input',
      fieldName: 'description',
      componentProps: {
        placeholder: '请输入页面展示的副标题',
      },
      label: '副标题',
    },
    {
      component: 'Input',
      fieldName: 'copyrightText',
      componentProps: {
        placeholder: '请输入页面底部描述',
      },
      label: '底部描述',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '开启',
            value: true,
          },
          {
            label: '关闭',
            value: false,
          },
        ],
      },
      fieldName: 'noticePopup.showOnce',
      label: '右上角提示',
    },
    {
      component: 'Input',
      fieldName: 'noticePopup.title',
      componentProps: {
        placeholder: '请输入通知标题',
      },
      label: '提示标题',
    },
    {
      component: 'Input',
      fieldName: 'noticePopup.content',
      componentProps: {
        placeholder: '请输入通知内容',
      },
      label: '通知内容',
    },
    {
  component: 'Divider',
  fieldName: 'divider1',
  componentProps: {
    type: 'horizontal',
    children: '基础设置',
    orientation: 'left',
    style: { margin: '16px 0' }
  },
  // Divider 通常不需要 label
  label: '', 
},
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '开启',
            value: true,
          },
          {
            label: '关闭',
            value: false,
          },
        ],
      },
      fieldName: 'commercialFirst.enabled',
      label: '广告位1',
    },
    
    {
      component: 'Input',
      fieldName: 'commercialFirst.content',
      componentProps: {
        placeholder: '请输入广告位内容',
      },
      label: '内容',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '开启',
            value: true,
          },
          {
            label: '关闭',
            value: false,
          },
        ],
      },
      fieldName: 'commercialFirst.buttonEnabled',
      label: '按钮',
    },
    {
      component: 'Input',
      fieldName: 'commercialFirst.buttonText',
      componentProps: {
        placeholder: '请输入按钮文字',
      },
      label: '按钮文字',
    },
    {
      component: 'Input',
      fieldName: 'commercialFirst.buttonUrl',
      componentProps: {
        placeholder: '请输入跳转链接',
      },
      label: '跳转链接',
    },
    {
      component: 'Divider',
      fieldName: 'divider1',
      componentProps: {
        type: 'horizontal',
        children: '基础设置',
        orientation: 'left',
        style: { margin: '16px 0' }
      },
      // Divider 通常不需要 label
      label: '', 
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '开启',
            value: true,
          },
          {
            label: '关闭',
            value: false,
          },
        ],
      },
      fieldName: 'commercialSecond.enabled',
      label: '广告位2',
    },
    
    {
      component: 'Input',
      fieldName: 'commercialSecond.centent',
      componentProps: {
        placeholder: '请输入广告位内容',
      },
      label: '内容',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        options: [
          {
            label: '开启',
            value: true,
          },
          {
            label: '关闭',
            value: false,
          },
        ],
      },
      fieldName: 'commercialSecond.buttonEnabled',
      label: '按钮',
    },
    {
      component: 'Input',
      fieldName: 'commercialSecond.buttonText',
      componentProps: {
        placeholder: '请输入按钮文字',
      },
      label: '按钮文字',
    },
    {
      component: 'Input',
      fieldName: 'commercialSecond.buttonUrl',
      componentProps: {
        placeholder: '请输入跳转链接',
      },
      label: '跳转链接',
    },
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

<script setup lang="ts">
import { useVbenForm, z } from '#/adapter/form';
import { useConvertCardStore } from '#/store/convertCard';
import { Flex,Alert } from 'ant-design-vue';
import { useDebounceFn } from '@vueuse/core'; // 导入防抖函数

const convertCardStore = useConvertCardStore();
const [convertForm, convertFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelWidth: 0,
  },
  // 提交函数
  handleSubmit: onSubmit,

  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    content: '开始极速转换',
    class: 'w-full',
  },
  actionWrapperClass: 'text-center',
  layout: 'horizontal',
  schema: [
    {
      component: 'Textarea',
      componentProps: {
        rows: 5,
        placeholder:
          '请输入网盘分享链接，一般格式:\n通过网盘分享的文件：课程链接: https://pan.baidu.com/s/1pcKwlMVgKQgsp0dS4ZBEtw 提取码: 44jw',
      },
      formItemClass: 'cols-span-12 items-start',
      fieldName: 'fileUrl',
      label: '',
      rules: z
        .string()
        .min(1, '请输入百度网盘分享链接')
        .refine(
          (val) => {
            // 验证是否包含链接和提取码
            const hasLink =
              val.includes('http') ||
              val.includes('https') ||
              val.includes('baidu.com');
            const hasCode = val.includes('提取码') || val.includes('pwd');
            return hasLink && hasCode;
          },
          {
            message: '请输入包含提取码的百度网盘分享链接',
          },
        ),
    },
  ],
});
// 使用防抖函数，延迟 500ms
const debouncedSubmit = useDebounceFn(async (values: Record<string, any>) => {
  convertFormApi.setState({
    submitButtonOptions: {
      loading: true,
      content: '转换中请稍后...',
    },
  });
  
  try {
    // 使用 await 等待异步操作完成
    await convertCardStore.convert(values.fileUrl);
  } finally {
    convertFormApi.setState({
      submitButtonOptions: {
        loading: false,
        content: '开始极速转换',
      },
    });
  }
}, 500);
function onSubmit(values: Record<string, any>) {
  debouncedSubmit(values);
}
</script>
<template>
  <Flex vertical gap="small">
    <Alert type="success" showIcon>
      <template #message>
            请在下方输入框，按格式键入文件分享链接
      </template>
    </Alert>
    <convertForm />
  </Flex>
</template>

<template>
  <Flex vertical gap="small">
    <!-- 账号信息 -->
    <!-- <Flex 
      :vertical="isMobile" 
      :align="isMobile ? 'flex-start' : 'center'"  
      class="w-full"
    >
      <Flex align="center" :class="isMobile ? 'mb-2 w-full' : ''">
        <Avatar
          size="large"
          :src="convertCardStore.cardInfo.personalUser.photoUrl"
        />
        <Tooltip title="此卡密绑定账号" class="ml-2">
          <span style="color: red; cursor: pointer;">{{ convertCardStore.cardInfo.personalUser.username }}</span>
        </Tooltip>
      </Flex>
      
      <Tag 
        color="geekblue"
        :class="isMobile ? 'w-full text-center' : ''">
        空间存储:{{ quotaInfo.total }} GB / 已用:{{ quotaInfo.used }} GB
      </Tag>
    </Flex> -->
    <List item-layout="horizontal">
      <List.Item  style="margin-left: -15px;">
        <List.Item.Meta>
          <template #title>
            <Tooltip title="此卡密绑定账号" class="ml-2">
              <span style="color: red;margin-left: -5px;">{{ convertCardStore.cardInfo.personalUser.username }}</span>
            </Tooltip>
          </template>
          <template #description>
            <Tag color="geekblue"  style="margin-left: -8px;">
              网盘空间:{{ quotaInfo.total }} GB / 已用:{{ quotaInfo.used }} GB
            </Tag>
          </template>
          <template #avatar>
            <Avatar
              size="large"
              :src="convertCardStore.cardInfo.personalUser.photoUrl"
            />
          </template>
        </List.Item.Meta>
      </List.Item>
    </List>
    <convertForm />
  </Flex>
</template>

<script setup lang="ts">
import { onMounted,computed,ref, onUnmounted } from 'vue';
import { useVbenForm, z } from '#/adapter/form';
import { useConvertCardStore } from '#/store/convertCard';
import { message, Flex, Space, Tag, Avatar,Tooltip,List, } from 'ant-design-vue';
import { useDebounceFn } from '@vueuse/core'; // 导入防抖函数
const convertCardStore = useConvertCardStore();
// 使用计算属性确保响应式更新
const quotaInfo = computed(() => convertCardStore.quotaInfo);

// 检测屏幕尺寸
const screenWidth = ref(window.innerWidth);
const isMobile = computed(() => screenWidth.value < 768); // 小于 768px 认为是移动设备

// 监听窗口大小变化
const handleResize = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  convertCardStore.fetchQuota();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  
});

const [convertForm,convertFormApi] = useVbenForm({
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

<script lang="ts" setup>
import {ref} from 'vue';
import {
  Input,
  Space,
  Flex,
  message,
  Typography,
  Image,
} from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import { useVbenModal } from '@vben/common-ui';
import { usePersonalLoginStore } from '#/store/personalLogin';
const personalLoginStore = usePersonalLoginStore();
const data = ref();
const imgUrl = ref('');
const [Form, formApi] = useVbenForm({
  // 属性
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    hideLabel: true, // 隐藏标签
  },

  // 提交按钮
  submitButtonOptions: {
    show: false,
  },
  // 重制按钮
  resetButtonOptions: {
    show: false,
  },
  layout: 'horizontal',

  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '验证码',
      },
      fieldName: 'catchCode',
      label: '验证码',
      rules:'required'
    },
  ],
  // 事件
});
const [CatchModal, CatchmodalApi] = useVbenModal({
  fullscreen: false, //展示全屏
  fullscreenButton: false,
  closeOnClickModal: false, // 点击zero-modal时是否关闭modal
  title: '安全验证', // 标题
  centered: true, // 是否居中
  confirmText: '确定', // 确定按钮的文字
  showCancelButton: false, // 是否显示取消按钮
  cancelText: '取消', // 取消按钮的文字
  contentClass:'p-4',
  //事件
   onOpenChange(isOpen: boolean) {
    if (isOpen) {
      data.value = CatchmodalApi.getData<Record<string, any>>();
      // console.log('data', data.value.apiParams);
      refreshCaptcha();
    }
  },
  // 点击确认按钮触发
  async onConfirm() {
    // 校验输入框
    const validate =  await formApi.validate();
    // 如果校验不通过，则不继续执行
    if(!validate.valid){
      return;
    }
    const values = await formApi.getValues();
    personalLoginStore.setCatchCode(values.catchCode)
    personalLoginStore.inCatchsendSms().then((res)=>{
      if (res && res.errno === 20) {
        // 验证码错误
        message.error('验证码错误,请重新输入');
        personalLoginStore.setVcode(res.vcodesign,res.vcodestr);
        refreshCaptcha();
      }
      if (res && res.errno === 0) {
        // 验证码正确
        message.success('验证码已发送，注意查收');
        CatchmodalApi.close()
      }
    })
  },
});

// 添加刷新验证码的函数
function refreshCaptcha() {
  const vcodeStr = personalLoginStore.getVocdeStr();
  imgUrl.value = 'https://passport.baidu.com/cgi-bin/genimage?'+ vcodeStr+'&v='+ Date.now()
}

</script>
<template>
  <CatchModal title="安全验证">
    <Form>
      <template #catchCode="slotProps">
        <Flex vertical>
          <Typography.Text>请输入图片中的验证码</Typography.Text>
          <Space :size="8">
            <!-- 设置较小的间距 -->
            <Input placeholder="验证码" v-bind="slotProps" />
            <Image :src="imgUrl" :preview="false" @click="refreshCaptcha" class="image_class" />
          </Space>
        </Flex>
      </template>
    </Form>
  </CatchModal>
</template>
<style scoped>
.image_class {
  border: 1px solid #d9d9d9;
  cursor: pointer;
  border-radius: 4px;
  width: 100px; /* 设置固定宽度 */
  height: 40px; /* 设置固定高度 */
  object-fit: contain; /* 保持图片比例 */
}
</style>

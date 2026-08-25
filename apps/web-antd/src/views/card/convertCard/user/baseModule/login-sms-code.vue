<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useVbenForm, z } from '#/adapter/form';
import { useVbenModal } from '@vben/common-ui';
import { Input, Button, Space, message } from 'ant-design-vue';
import SendSmsCatch from './send-sms-catch.vue';
import { useConvertCardStore } from '#/store/convertCard';
import { usePersonalLoginStore } from '#/store/personalLogin';
const convertCardStore = useConvertCardStore();
const personalLoginStore = usePersonalLoginStore();
const captchaBtn = ref(false);
const countdown = ref(60);
const countdownInterval = ref<NodeJS.Timeout | null>(null);

// Form 为弹窗组件
// formApi 为弹窗的方法
const [Form, formApi] = useVbenForm({
  // 属性
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
    hideLabel: true, // 隐藏标签
  },
  // 提交函数
  handleSubmit: onSubmit,
  // 提交按钮
  submitButtonOptions: {
    content: '登录',
    class: 'w-full',
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
        placeholder: '请输入手机号',
      },
      fieldName: 'phone',
      label: '手机号',
      rules: z.string().regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '验证码',
      },
      fieldName: 'password',
      label: '验证码',
      rules: 'required',
    },
  ],
  // 事件
});
const [CatchModal, CatchmodalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: SendSmsCatch,
  // 监听关闭事件
  onOpenChange(isOpen: boolean) {
    // 获取验证码成功
    if (
      !isOpen &&
      personalLoginStore.getCatchCode() !== null &&
      personalLoginStore.getCatchCode() !== ''
    ) {
      // 获取验证码成功
      startCountdown();
    }
  },
});

// 开始倒计时
const startCountdown = () => {
  captchaBtn.value = true;
  countdown.value = 60;

  countdownInterval.value = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      stopCountdown();
    }
  }, 1000);
};

// 停止倒计时
const stopCountdown = () => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
    countdownInterval.value = null;
  }
  captchaBtn.value = false;
  countdown.value = 60;
};

// 清理定时器
onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value);
  }
});

// 获取验证码 按钮
async function captchaBtnClick() {
  // 校验表单规则
  const result = await formApi.validateField('phone');

  // 检查验证结果
  if (result && result.errors && result.errors.length > 0) {
    // 存在验证错误，不继续执行
    message.error('手机号错误,请检查');
    return;
  }
  const formValues = await formApi.getValues();
  personalLoginStore.setPhone(formValues.phone);
  const sendInfo = await personalLoginStore.sendSms();
  // 验证通过，执行后续操作
  if (sendInfo && sendInfo.errno === 18) {
    personalLoginStore.setVcode(sendInfo.vcodesign, sendInfo.vcodestr);
    // 请填写验证码
    CatchmodalApi.open();
  } else if (sendInfo && sendInfo.errno === 0) {
    // 开始倒计时
    startCountdown();
    message.success('发送成功,请注意查收');
  }
}
// 登录按钮
async function onSubmit(values: any) {
  // 登录按钮加载中...
  formApi.setState({
    submitButtonOptions: { loading: true, content: '认证中...' },
  });
  // 这里添加实际的登录处理逻辑
  try {
    personalLoginStore.setPassword(values.password);
    const newCardKey = await personalLoginStore.login(); // 等待 Promise 完成
    if (newCardKey) {
      // 更新卡密信息 - 这会触发 watch 回调
      // personalLoginStore.setCardInfo(newCardKey);
      convertCardStore.cardInfo = newCardKey;
    }
  } catch (error) {
    formApi.setState({
      submitButtonOptions: { loading: false, content: '登 录' },
    });
  }
}

onMounted(() => {
  personalLoginStore.init();
  personalLoginStore.getApi();
});
</script>
<template>
  <Form>
    <template #password="slotProps">
      <Space.Compact>
        <Input type="text" class="w-full" v-bind="slotProps" />
        <Button type="primary" @click="captchaBtnClick" :disabled="captchaBtn">
          {{ captchaBtn ? `重新发送(${countdown})` : '获取验证码' }}
        </Button>
      </Space.Compact>
    </template>
  </Form>
  <CatchModal />
</template>
<style scoped></style>

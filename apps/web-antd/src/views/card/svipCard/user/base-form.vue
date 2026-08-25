<script setup lang="ts">
import { ref,onMounted,onUnmounted } from 'vue';
import { Button, Input, Space, message } from 'ant-design-vue';
import { useVbenForm, z } from '#/adapter/form';
import { useRedemptionStore } from '#/store/redemption';
import { useVbenModal } from '@vben/common-ui';
import { useDebounceFn } from '@vueuse/core'; // 导入防抖函数
import SendSmsCatch from './send-sms-catch.vue';
const redemptionStore = useRedemptionStore();
const captchaBtn = ref(false);
const countdown = ref(60);
const countdownInterval = ref<NodeJS.Timeout | null>(null);

const [BaseForm, formApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    labelClass: 'text-white', // 设置标签为白色
  },
  // 提交函数
  handleSubmit: onSubmit,
  layout: 'vertical',
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
  ],
  resetButtonOptions: {
    show: false,
  },
  submitButtonOptions: {
    class: 'w-full font-medium',
    content: '立即兑换',
  },
});

const [CatchModal, CatchmodalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: SendSmsCatch,
  // 监听关闭事件
  onOpenChange(isOpen: boolean) {
    // 获取验证码成功
    if (
      !isOpen &&
      redemptionStore.getCatchCode() !== null &&
      redemptionStore.getCatchCode() !== ''
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



// 提交函数
async function onSubmit(values: any) {
  console.log('values', values);

  // 检查是否已经有验证码字段，如果没有手机号才添加验证码字段
  const currentSchema = formApi.getState()?.schema ?? [];
  const hasCaptchaField = currentSchema.some(
    (field: any) => field.fieldName === 'password',
  );

  // 如果没有验证码字段且有手机号，才添加验证码字段
  if (!hasCaptchaField && values.phone) {
    formApi.setState((prev) => {
      const currentSchema = prev?.schema ?? [];
      // 再次确认是否已存在验证码字段，避免重复添加
      const hasCaptchaField = currentSchema.some(
        (field: any) => field.fieldName === 'password',
      );
      if (hasCaptchaField) {
        return prev; // 如果已存在，直接返回当前状态
      }
      // 添加提示
      message.error('请获取验证码,进行安全认证');
      const newSchema = [...currentSchema];
      newSchema.push({
        component: 'Input',
        fieldName: 'password',
        label: '验证码',
        rules: 'required',
      });
      return {
        schema: newSchema,
      };
    });
  }
  // 如果已经有验证码字段且验证码已填写，执行登录逻辑
  else if (hasCaptchaField && values.password) {
    // 执行登录逻辑
    await performLogin(values);
  }
}
// 获取验证码 按钮
async function captchaBtnClick() {
 debouncedSubmit();
}

// 使用防抖函数，延迟 500ms
const debouncedSubmit = useDebounceFn(async () => {
   // 校验表单规则
  const result = await formApi.validateField('phone');
  // 检查验证结果
  if (result && result.errors && result.errors.length > 0) {
    // 存在验证错误，不继续执行
    message.error('手机号错误,请检查');
    return;
  }
  const formValues = await formApi.getValues();
  redemptionStore.setPhone(formValues.phone);
  const sendInfo = await redemptionStore.sendSms();
  console.log('sendInfo', sendInfo);
  // 验证通过，执行后续操作
  if (sendInfo && sendInfo.errno === 50052) {
    redemptionStore.setVcode(sendInfo.vcodesign, sendInfo.vcodestr);
    // 请填写验证码
    CatchmodalApi.open();
  } else if (sendInfo && sendInfo.errno === 0) {
    // 开始倒计时
    startCountdown();
    message.success('发送成功,请注意查收');
  }
}, 500);
// 单独的登录处理函数
async function performLogin(values: any) {
  console.log('执行登录逻辑', values);
  // 登录按钮加载中...
  formApi.setState({
    submitButtonOptions: { loading: true, content: '认证中...' },
  });
  // 这里添加实际的登录处理逻辑
  try {
    redemptionStore.setPassword(values.password);
    const newCardKey = await redemptionStore.login(); // 等待 Promise 完成
    if (newCardKey) {
      // 更新卡密信息 - 这会触发 watch 回调
      redemptionStore.setCardInfo(newCardKey);
    }
  } catch (error) {
    formApi.setState({
      submitButtonOptions: { loading: false, content: '立即兑换' },
    });
  }
}
onMounted(() => {
  setTimeout(() => {
    // 初始化验证码参数
    redemptionStore.init();
    redemptionStore.getApi();
  }, 2000);
});
</script>

<template>
  <BaseForm>
    <template #password="slotProps">
      <Space.Compact style="width: 100%">
        <Input type="text" v-bind="slotProps" style="flex: 1" />
        <Button style="width: 120px" type="primary" @click="captchaBtnClick" :disabled="captchaBtn">
          {{ captchaBtn ? `重新发送(${countdown})` : '获取验证码' }}
        </Button>
      </Space.Compact>
    </template>
  </BaseForm>
  <CatchModal />
</template>

<style scoped></style>

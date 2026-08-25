<script lang="ts" setup>
import { ref, watch, computed, onUnmounted } from 'vue';
import { useVbenModal } from '@vben/common-ui';
import { message, Steps, Step, RadioGroup, Radio, Button } from 'ant-design-vue';
import { useVbenForm } from '#/adapter/form';
import {
  getQrLoginCode,
  queryEpInfo,
  addEp,
  getLoginStatus,
  qrBdussLogin,
} from '#/api/enterprise';

defineOptions({ name: 'FormModelDemo' });

interface EnterpriseItem {
  cid: string;
  orgInfo: { name: string };
  [key: string]: any;
}

// ========== Modal 按钮状态 ==========
const confirmText = ref('下一步') as any;
const confirmLoading = ref(false) as any;
const confirmDisabled = ref(false) as any;

// ========== Modal ==========
const [Modal, modalApi] = useVbenModal({
  title: '新增企业账户',
  fullscreenButton: false,
  cancelText: '取消',
  confirmText,
  confirmLoading,
  confirmDisabled,
  onCancel: () => modalApi.close(),
  onConfirm: async () => {
    confirmLoading.value = true;
    try {
      if (currentStep.value === 0) {
        currentStep.value = 1;
      } else if (currentStep.value === 1) {
        if (addMode.value === 'ck') {
          await firstFormApi.validateAndSubmitForm();
        } else {
          message.info('请使用手机扫码登录');
        }
      } else if (currentStep.value === 2) {
        await secondFormApi.validateAndSubmitForm();
      }
    } finally {
      confirmLoading.value = false;
    }
  },
});

// ========== 状态 ==========
const currentStep = ref(0);
const addMode = ref<'ck' | 'qrcode'>('ck');
const selectData = ref<any[]>([]);
const firstStepData = ref<Record<string, any>>({});
const qrCodeUrl = ref('');
const currentGid = ref<string>('');
const currentSign = ref<string>('');
const cancelPolling = ref<(() => void) | null>(null);
const scanStatus = ref<'waiting' | 'scanned' | 'expired'>('waiting');
const countdown = ref(600); // 10分钟

// 最大轮询次数：20 次 ≈ 10 分钟（后端每次超时 ~30 秒）
const MAX_ATTEMPTS = 20;

// 响应式 options
const selectOptions = computed(() =>
  selectData.value.map(item => ({
    label: item.orgInfo?.name || '未知企业',
    value: item.cid,
  })),
);

const cidToItem = computed(() => {
  const map = new Map<string, EnterpriseItem>();
  selectData.value.forEach(item => map.set(item.cid, item));
  return map;
});

// ========== UUID 生成 ==========
const uuid = () =>
  crypto.randomUUID?.() ||
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

// ========== 生成二维码 ==========
async function generateQRCode() {
  try {
    stopPolling(); // 必须先停止旧轮询

    const gid = uuid();
    currentGid.value = gid;
    currentSign.value = '';
    scanStatus.value = 'waiting';
    countdown.value = 600;

    const qrCodeInfo = await getQrLoginCode({ gid });
    qrCodeUrl.value = qrCodeInfo.imgurl.startsWith('http')
      ? qrCodeInfo.imgurl
      : `https://${qrCodeInfo.imgurl}`;
    currentSign.value = qrCodeInfo.sign;

    startLongPolling(gid, qrCodeInfo.sign);
  } catch (err) {
    message.error('生成二维码失败');
    console.error(err);
  }
}

// ========== 长轮询：真正的 Long Polling（终极版）==========
function startLongPolling(gid: string, sign: string) {
  if (!gid || !sign) {
    console.warn('gid 或 sign 为空，跳过启动');
    return;
  }

  console.log('开始长轮询，gid:', gid, 'sign:', sign);

  let isCancelled = false;

  const poll = async (attempt: number = 1) => {
    // 取消或超次
    if (isCancelled || attempt > MAX_ATTEMPTS) {
      if (!isCancelled) {
        console.warn('已达最大轮询次数（20次），二维码失效');
        scanStatus.value = 'expired';
        message.warning('二维码已过期，请刷新');
      }
      stopPolling();
      return;
    }

    console.log(`第 ${attempt} 次查询状态...`);

    try {
      const res = await getLoginStatus({ gid, sign });

      // 1. 未扫码（errno === 1）
      if (res.errno === 1) {
        scanStatus.value = 'waiting';
        countdown.value = Math.max(0, countdown.value - 30); // 快进 30 秒
        poll(attempt + 1);
        return;
      }

      // 2. 已扫码，等待确认（status === 1）
      if (res.channel_v?.status === 1) {
        scanStatus.value = 'scanned';
        countdown.value = Math.max(0, countdown.value - 30); // 快进
        poll(attempt + 1);
        return;
      }

      // 3. 登录成功（status === 0 且有 v）
      if (res.channel_v?.status === 0 && res.channel_v?.v) {
        console.log('登录成功！v =', res.channel_v.v);
        stopPolling();
        try {
          const eps = await qrBdussLogin({ v: res.channel_v.v });
          selectData.value = eps || [];
          message.success('扫码登录成功');
          currentStep.value = 2;
        } catch (e) {
          console.error('qrBdussLogin 失败', e);
          message.error('获取企业列表失败');
        }
        return;
      }

      // 4. 其他情况 → 过期
      console.warn('未知状态，视为过期:', res);
      stopPolling();
      scanStatus.value = 'expired';
      message.warning('二维码已过期，请刷新');

    } catch (err: any) {
      console.error('轮询请求失败:', err);

      // 网络错误：不计次数，延迟 3 秒后重试
      setTimeout(() => {
        if (!isCancelled && attempt <= MAX_ATTEMPTS) {
          poll(attempt); // attempt 不变
        }
      }, 3000);
    }
  };

  // 启动第一次轮询
  poll(1);

  // 提供取消函数
  cancelPolling.value = () => {
    isCancelled = true;
    console.log('轮询被取消');
  };
}

// ========== 停止轮询（增强版：同时停止倒计时）==========
function stopPolling() {
  // 1. 取消轮询
  if (cancelPolling.value) {
    cancelPolling.value();
    cancelPolling.value = null;
  }

  // 2. 清除倒计时定时器
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }

  // 3. 重置状态
  currentGid.value = '';
  currentSign.value = '';
  qrCodeUrl.value = '';
  scanStatus.value = 'waiting';
  countdown.value = 0;
}

// ========== 模拟登录（开发用）==========
function simulateScanSuccess() {
  stopPolling();
  selectData.value = [
    { cid: 'ep1', orgInfo: { name: '字节跳动' } },
    { cid: 'ep2', orgInfo: { name: '美团' } },
  ];
  message.success('模拟登录成功');
  currentStep.value = 2;
}

// ========== 表单提交 ==========
async function onFirstSubmit(values: Record<string, any>) {
  firstStepData.value = values;
  try {
    const res = await queryEpInfo(values);
    selectData.value = res || [];
    currentStep.value = 2;
  } catch {
    message.error('查询失败');
  }
}

function onSecondSubmit(values: Record<string, any>) {
  const cid = values.formSecond as string;
  const item = cidToItem.value.get(cid);
  if (!item) {
    message.error('企业信息丢失');
    return;
  }

  const finalData = { ...firstStepData.value, organization: item };
  addEp(finalData)
    .then(() => {
      message.success(`添加成功：${item.orgInfo.name}`);
      modalApi.close();
    })
}

// ========== 表单 ==========
const [FirstForm, firstFormApi] = useVbenForm({
  layout: 'horizontal',
  handleSubmit: onFirstSubmit,
  resetButtonOptions: {
    show: true,
    content: '上一步',
    onClick: () => {
      currentStep.value = 0;
      addMode.value = 'ck';
    },
  },
  submitButtonOptions: { show: false },
  commonConfig: { componentProps: { class: 'w-full' }, labelWidth: 50 },
  schema: [
    {
      component: 'Textarea',
      fieldName: 'cookies',
      label: 'Ck',
      rules: 'required',
      componentProps: { rows: 4, placeholder: '请输入 Ck' },
    },
    {
      component: 'Input',
      fieldName: 'remark',
      label: '备注',
      componentProps: { placeholder: '选填' },
    },
  ],
  wrapperClass: 'grid-cols-1',
});

const [SecondForm, secondFormApi] = useVbenForm({
  layout: 'horizontal',
  handleSubmit: onSecondSubmit,
  resetButtonOptions: {
    show: true,
    content: '上一步',
    onClick: () => {
      currentStep.value = 1;
      selectData.value = [];
    },
  },
  submitButtonOptions: { show: false },
  commonConfig: { componentProps: { class: 'w-full' } },
  schema: [
    {
      component: 'Select',
      fieldName: 'formSecond',
      label: '选择企业',
      rules: 'required',
      componentProps: () => ({
        options: selectOptions.value,
        placeholder: selectData.value.length ? '请选择企业' : '暂无数据',
        showSearch: true,
        optionFilterProp: 'label',
        filterOption: (input: string, option: any) =>
          option.label.toLowerCase().includes(input.toLowerCase()),
      }),
    },
  ],
  wrapperClass: 'grid-cols-1',
});
// 监听 selectData 变化
watch(selectData, (newVal) => {
  console.log('selectData changed:', newVal);
});
// ========== 动态按钮 ==========
watch(
  () => [currentStep.value, addMode.value] as const,
  ([step, mode]) => {
    if (step === 0) {
      confirmText.value = '下一步';
      confirmDisabled.value = !mode;
    } else if (step === 1) {
      confirmText.value = mode === 'ck' ? '查询企业' : '等待扫码...';
      confirmDisabled.value = mode === 'qrcode';
    } else if (step === 2) {
      confirmText.value = '提交';
      confirmDisabled.value = false;
    }
  },
  { immediate: true },
);

// ========== 监听步骤切换 ==========
watch(currentStep, (val) => {
  if (val === 1 && addMode.value === 'qrcode') {
    generateQRCode();
  }
  if (val === 0 || addMode.value === 'ck') {
    stopPolling();
  }
});

// ========== 倒计时：10分钟 ==========
let countdownTimer: any = null;
watch(currentGid, (gid) => {
  if (gid) {
    countdown.value = 600;
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(countdownTimer);
        if (scanStatus.value !== 'expired') {
          scanStatus.value = 'expired';
          message.warning('二维码已过期');
        }
      }
    }, 1000);
  }
});

onUnmounted(() => {
  stopPolling();
  clearInterval(countdownTimer);
});
</script>

<template>
  <Modal>
    <div class="p-6">
      <Steps :current="currentStep" size="small" class="mb-6">
        <Step title="选择方式" />
        <Step title="登录账号" />
        <Step title="选择企业" />
      </Steps>

      <!-- 步骤 0：选择方式 -->
      <div v-if="currentStep === 0" class="max-w-md mx-auto">
        <RadioGroup v-model:value="addMode" class="w-full space-y-3">
          <Radio value="ck" class="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer transition">
            <div class="ml-3 flex-1">
              <div class="font-medium">输入 Ck</div>
              <div class="text-sm text-gray-500">手动输入 Cookie 登录</div>
            </div>
          </Radio>
          <Radio value="qrcode" class="flex items-center p-4 border rounded-lg hover:border-primary cursor-pointer transition">
            <div class="ml-3 flex-1">
              <div class="font-medium">扫码登录</div>
              <div class="text-sm text-gray-500">使用手机扫描二维码</div>
            </div>
          </Radio>
        </RadioGroup>
      </div>

      <!-- 步骤 1：登录账号 -->
      <div v-if="currentStep === 1">
        <!-- 输入 Ck -->
        <div v-if="addMode === 'ck'">
          <FirstForm />
        </div>

        <!-- 扫码登录 -->
        <div v-else class="text-center py-8 max-w-xs mx-auto">
          <img v-if="qrCodeUrl" :src="qrCodeUrl" alt="扫码登录" class="mx-auto border rounded mb-4 w-60" />
          <div v-else class="h-60 flex items-center justify-center">
            <div class="i-eos-icons-loading text-4xl" />
          </div>

          <!-- 动态提示文字 -->
          <p class="text-lg mb-2">
            <template v-if="scanStatus === 'waiting'">请使用手机扫描二维码</template>
            <template v-else-if="scanStatus === 'scanned'">已扫码，请在手机上确认登录</template>
            <template v-else-if="scanStatus === 'expired'">二维码已过期</template>
          </p>

          <p class="text-sm text-gray-500 mb-4">
            <template v-if="scanStatus === 'scanned'">请在手机上点击确认</template>
            <template v-else-if="scanStatus === 'waiting'">有效期：{{ Math.floor(countdown / 60) }}分{{ countdown % 60 }}秒</template>
            <template v-else>请刷新二维码</template>
          </p>

          <!-- 过期显示刷新按钮 -->
          <Button v-if="scanStatus === 'expired'" type="primary" @click="generateQRCode">
            刷新二维码
          </Button>

          <!-- 开发模拟按钮 -->
          <Button v-else type="primary" @click="simulateScanSuccess">
            模拟登录成功（开发）
          </Button>
        </div>
      </div>

      <!-- 步骤 2：选择企业 -->
      <div v-if="currentStep === 2">
        <SecondForm />
        <div v-if="!selectData.length" class="text-center py-8 text-gray-500">
          <div class="i-carbon-warning text-4xl mb-2" />
          <p>未查询到企业，请检查登录信息</p>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
:deep(.ant-steps) { margin-bottom: 24px; }
:deep(.ant-form-item) { margin-bottom: 16px; }
:deep(.ant-radio-wrapper) { margin: 0; width: 100%; }
</style>

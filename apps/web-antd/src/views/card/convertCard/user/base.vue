<script setup lang="ts">
import { ref, watch,h } from 'vue';
import { Loading } from '@vben/common-ui';
import { Result,Button,message,Alert,Image,notification } from 'ant-design-vue';
import { useConvertCardStore } from '#/store/convertCard';

// 导入组件
import ShowLogin from './show-login.vue';
import InputForm from './baseModule/input-form.vue';
import LoginInputForm from './baseModule/login-input-form.vue';
import { MidInfo } from '@vben/icons'

const convertCardStore = useConvertCardStore();
const isShowLogin = ref(true); 
const isBiandUser = ref(false);
const cardStatus = ref(false);
const tipTitle = ref(''); // 提示标题
const tipContent = ref(''); // 提示内容
const showCardError = ref(false); // 新增：显示卡密错误状态
const renewalBtn = ref(false); // 续费按钮
const isShowConvertResult = ref(false);
// 添加一个标志来判断 store 是否已准备就绪
const storeReady = ref(false);


// 复制卡密
async function copyShareLink() {
  const fullUrl = convertCardStore.convertResult.shortLink;
  try {
    await navigator.clipboard.writeText(fullUrl);
    message.success('卡密已复制到剪切板');
  } catch (err) {
    fallbackCopyTextToClipboard(fullUrl);
  }
}

// 备用复制方法
function fallbackCopyTextToClipboard(text: string) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  
  try {
    document.execCommand('copy');
    message.success('卡密已复制到剪切板');
  } catch (err) {
    message.error('复制失败');
  } finally {
    document.body.removeChild(textArea);
  }
}

function windowOpenShareLink() {
  window.open(convertCardStore.convertResult.shortLink,'_blank');
}

// 监听 cardInfo 的变化，而不是在 mounted 时一次性判断
watch(() => convertCardStore.cardInfo, (newCardInfo) => {
  console.log("监听到cardInfo变化")
  if (!newCardInfo || !newCardInfo.cardKey) {
    return;
  }

  // 判断卡密是否不存在 (status 为 5)
  if(newCardInfo.status === 4) {
    showCardError.value = true;
    tipTitle.value = '禁止使用';
    tipContent.value = '当前卡密已禁用，请联系客服';
    storeReady.value = true;
    return;
  }

  // 判断卡密是否不存在 (status 为 5)
  if(newCardInfo.status === 5) {
    showCardError.value = true;
    tipTitle.value = '卡密不存在';
    tipContent.value = '请检查您输入的卡密是否正确';
    storeReady.value = true;
    return;
  }
  
  // 判断卡密是否已过期 (status > 2 且 < 4)
  if(newCardInfo.status > 2 && newCardInfo.status < 4) {
    cardStatus.value = false;
    tipTitle.value = '老客户, 续费更优惠哦！';
    tipContent.value = '卡密过期了？别担心！';
    showCardError.value = true;
    storeReady.value = true;
    renewalBtn.value = true;
    return;
  }

  // 开始提示通知
  // 更通用的换行处理函数
  const renderWithLineBreaks = (text: string) => {
    if (!text) return h('span');
    
    const parts = text.split('\n');
    return h('div', parts.map((part, index) => 
      h('div', { key: index, style: 'margin-bottom: 4px;' }, part)
    ));
  };
  if(convertCardStore.cardInfo.setConfig.noticePopup.enabled){
    notification.info({
      icon: ()=> h(MidInfo, { style: 'color: #ff4d4f' }),
      message: convertCardStore.cardInfo.setConfig.noticePopup.title,
        description: renderWithLineBreaks(convertCardStore.cardInfo.setConfig.noticePopup.content),
      duration: 0,
    });
  }
  // 重置错误状态
  showCardError.value = false;
  cardStatus.value = false;
  // 判断是否显示登录
  if(newCardInfo.isShowLogin === 1) {
    // 需要展示登录
    isShowLogin.value = true; // 修正：需要展示登录时，isShowLogin 应为 true
    // 判断是否已经登录绑定
    if(newCardInfo.bindUserStatus === 1) {
      // 已经绑定
      isBiandUser.value = true;
    } else {
      // 未绑定，需要展示登录
      isBiandUser.value = false;
    }
  } else {
    // 不需要展示登录，显示表单
    isShowLogin.value = false;
    isBiandUser.value = false; // 确保在不需要登录时，不显示绑定表单
  }

  storeReady.value = true;
}, { immediate: true }); // 立即执行，以便在 cardInfo 已经存在时也能触发

// 监听 convertResult 的变化
watch(() => convertCardStore.convertResult, () => {
    // 转换成功
    isShowConvertResult.value = true;
});
</script>

<template>
  <!-- 等待 store 准备就绪 -->
  <div v-if="!storeReady" class="loading-container">
    <!-- 可以添加加载动画 -->
    <Loading/>
  </div>
  <Result
    v-else-if="showCardError || cardStatus"
    status="error"
    :title="tipTitle"
    :sub-title="tipContent"
  >
    <template #extra v-if="renewalBtn">
      <Button type="primary" @click="" >立即续费</Button>
    </template>
  </Result>

  <!-- 2. 登录方式 -->
  <!-- 需要展示登录 且 用户未绑定时，显示登录组件 -->
  <ShowLogin v-if="storeReady && !showCardError && !cardStatus && isShowLogin && !isBiandUser" />
  <!-- 用户已绑定，显示绑定后的表单 -->
  <LoginInputForm v-if="storeReady && !showCardError && !cardStatus && isShowLogin && isBiandUser" />
  <!-- 不需要登录时，显示普通表单 -->
  <InputForm v-if="storeReady && !showCardError && !cardStatus && !isShowLogin" />

  <!-- 3. 转换成功结果 -->
  <Flex v-if="!showCardError && !cardStatus && !isShowLogin && isShowConvertResult" vertical gap="middle" class="success-result">
    <Alert
      :message="convertCardStore.convertResult.toTitle"
      :description="convertCardStore.convertResult.to"
      type="success"
      show-icon
    >
      <template #action>
        <Flex vertical gap="small">
          <Button type="primary" @click="copyShareLink">复制链接</Button>
          <Button @click="windowOpenShareLink">浏览器打开</Button>
        </Flex>
      </template>
    </Alert>
    <Image src="https://i0.wp.com/sirlinly.github.io/v3/2025/07/docs.png" />
  </Flex>
  <Flex v-else-if="isShowLogin && isBiandUser && isShowConvertResult" vertical gap="middle">
    <Alert
      :message="convertCardStore.convertResult.toTitle"
      :description="convertCardStore.convertResult.to"
      type="success"
      show-icon
    >
    </Alert>
    <Image :src="convertCardStore.convertResult.docImg" />
  </Flex>
</template>

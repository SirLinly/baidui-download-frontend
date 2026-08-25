import { defineStore, storeToRefs } from 'pinia'
import { ref, computed } from 'vue'
import { queryUserKey } from '#/api/card';
import { queryQuota,convertFile } from '#/api/convert';

export const useConvertCardStore = defineStore('convertCard',() =>{
  const gid = ref('')
  const key = ref<string>('') 
  const cardInfo = ref({
    cardKey: '',
    expireHours: 0,
    expireTime: '1970/01/01 08:00:00',
    personalUser: {
      username: '百度网盘',
      photoUrl: 'https://himg.bdimg.com/sys/portrait/item/pp',
    },
    restUsedCount: 0,
    status: 5,
    bindUserStatus: -1,
    isShowLogin: -1,
    setConfig:{
          siteTitle: "网盘下载券转换",
          copyrightText: "© 2026 MouDu管理系统",
          description: "一键转换百度网盘分享链接，轻松实现极速下载",
          commercialFirst:{
            content: "禁止分享、倒卖账号或下载券",
            enabled: false,
            buttonUrl: "",
            buttonText: "按钮文字",
            buttonEnabled: false
          },
          commercialSecond:{
            content: "",
            enabled: false,
            buttonUrl: "",
            buttonText: "测试按钮",
            buttonEnabled: false
          },
          firstPopup: {
              firstPopup: "使用须知",
              content: "1. 仅支持20GB以内文件\n2. 请保持百度网盘为最新版本\n3. 禁止分享、倒卖账号或下载券",
              enabled: false,
              showOnce: false,
              confirmText: "我已了解"
          },
          noticePopup: {
              title: "使用须知",
              content: "1. 仅支持20GB以内文件\n2. 请保持百度网盘为最新版本\n3. 禁止分享、倒卖账号或下载券",
              enabled: false,
              showOnce: false,
              cancelText: null,
              confirmText: "我已了解",
              showIntervalDays: 7
          }
      }
  })
  const quota = ref({ total: 0, used: 0 })
  const convertResult = ref({
    status: false,
    toTitle: '',
    to: '',
    shortLink: '',
    docImg: '',
  })

  // ==================== 计算属性 ====================
  const quotaInfo = computed(() => {
    const totalBytes = quota.value.total
    const usedBytes = quota.value.used
    const totalGB = totalBytes / (1024 ** 3)
    const usedGB = usedBytes / (1024 ** 3)

    return {
      total: Number(totalGB.toFixed(2)),
      used: Number(usedGB.toFixed(2)),
      totalBytes,
      usedBytes,
    }
  })
  const currentKey = computed(() => key.value || cardInfo.value.cardKey)

  function setKey(value: string) {
    key.value = value;
    // 开始异步调用接口
    fetchCardInfo();
  }

  // ==================== 方法 ====================
  async function fetchCardInfo() {
    try {
      const data = await queryUserKey({ key: key.value })
      cardInfo.value = { ...cardInfo.value, ...data } // 合并更新
      return true
    } catch (e) {
      console.error('获取卡密信息失败', e)
      return false
    }
  }

  async function fetchQuota() {
    if (!key.value) return
    try {
      quota.value = await queryQuota({ key: key.value })
    } catch (e) {
      console.error('获取配额失败', e)
    }
  }

  async function convert(fileUrl: string) {
    if (!key.value) throw new Error('请先设置 key')
    try {
      convertResult.value = await convertFile({ key: key.value, fileUrl })
    } catch (e) {
      console.error('转换失败', e)
      throw e
    }
  }

  // ==================== 导出 ====================
  return {
    // 状态
    key,
    gid,
    cardInfo,
    quota,
    convertResult,

    // 计算属性
    quotaInfo,
    currentKey,

    // 方法
    setKey,
    fetchCardInfo,
    fetchQuota,
    convert,
  }

})

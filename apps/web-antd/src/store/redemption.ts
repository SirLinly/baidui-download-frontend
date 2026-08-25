import { defineStore } from 'pinia';
import { getApi, getInit, sendSms, smsBdussLogin } from '#/api/convert';
// 提取 UUID 生成函数到 store 外部或作为辅助函数
const generateUUID = () =>
  crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const useRedemptionStore = defineStore('redemption', {
  state: () => ({
    gid: '',
    type: 2,
    cardInfo: {
      vipKey: '',
      type: '未知卡密',
      price: 0.00,
      status: 1,
      bindUserStatus: -1,
      personalUser: {
        username: '未知用户',
        photoUrl:
          'https://himg.bdimg.com/sys/portrait/item/public.1.1a90c017.5OpoasPUjLCNao239ShVHg.jpg',
        uk: '未知用户',
      },
      baiduVipInfo: {
        expireTime: '',
        hasBuyRecord: true,
        hasEverOpenedMember: true,
        historyExpireTime: '',
        historyHighestType: '',
        isFirstCharge: false,
        leftDays: 0,
        memberType: 0,
        startTime: '',
        tipMessage: '',
      },
    },
    smsParmas: {
      token: '',
      dv: '',
      phone: '',
      password: '',
      ds: '',
      tk: '',
      s: '',
      k: '',
      vcodesign: '',
      vcodestr: '',
      verifycode: '', // 图形验证码
    },
    spin: {
      state: false,
      tip: '正在加载中....',
    },
  }),
  actions: {
    // 初始化必要参数
    init() {
      getInit({ key: this.cardInfo.vipKey, gid: this.gid, type: 2 }).then(
        (res) => {
          this.smsParmas.ds = res.ds;
          this.smsParmas.tk = res.tk;
        },
      );
    },
    // 获取api
    getApi() {
      getApi({ key: this.cardInfo.vipKey, gid: this.gid, type: 2 }).then(
        (res) => {
          this.smsParmas.token = res.token;
          this.smsParmas.dv = res.dv;
        },
      );
    },
    // 在需要时更新 gid
    updateGid() {
      this.gid = generateUUID();
    },
    // 发送验证码
    async sendSms() {
      // 等待初始化完成
      const res = await getInit({
        key: this.cardInfo.vipKey,
        gid: this.gid,
        type: 2,
      });

      // 更新参数
      this.smsParmas.s = res.ds;
      this.smsParmas.k = res.tk;
      // 发送短信
      return sendSms({
        key: this.cardInfo.vipKey,
        gid: this.gid,
        token: this.smsParmas.token,
        dv: this.smsParmas.dv,
        phone: this.smsParmas.phone,
        ds: this.smsParmas.ds,
        tk: this.smsParmas.tk,
        s: this.smsParmas.s,
        k: this.smsParmas.k,
        type: 2,
      });
    },
    // 通过输入图形验证码 发送短信验证码
    async inCatchsendSms() {
      // 等待初始化完成
      const res = await getInit({
        key: this.cardInfo.vipKey,
        gid: this.gid,
        type: 2,
      });

      // 更新参数
      this.smsParmas.s = res.ds;
      this.smsParmas.k = res.tk;
      // 发送短信
      return sendSms({
        key: this.cardInfo.vipKey,
        gid: this.gid,
        token: this.smsParmas.token,
        dv: this.smsParmas.dv,
        phone: this.smsParmas.phone,
        vcodesign: this.smsParmas.vcodesign,
        vcodestr: this.smsParmas.vcodestr,
        verifycode: this.smsParmas.verifycode,
        type: 2,
      });
    },
    // 设置手机号
    setPhone(phone: string) {
      this.smsParmas.phone = phone;
    },
    // 设置密码
    setPassword(password: string) {
      this.smsParmas.password = password;
    },
    // 需要验证码
    setVcode(vcodesign: string, vcodestr: string) {
      this.smsParmas.vcodesign = vcodesign;
      this.smsParmas.vcodestr = vcodestr;
    },
    
    // 设置图形验证码
    setCatchCode(catchCode: string){
      this.smsParmas.verifycode = catchCode;
    },
    getCatchCode(){
      return this.smsParmas.verifycode;
    },
    // 更新卡密值
    setCardInfo(cardInfo: any) {
      this.cardInfo = cardInfo;
    },
    // 获取验证码图片标识字符串
    getVocdeStr() {
      return this.smsParmas.vcodestr;
    },
    // 登录
    login() {
      return smsBdussLogin({
        key: this.cardInfo.vipKey,
        gid: this.gid,
        token: this.smsParmas.token,
        dv: this.smsParmas.dv,
        phone: this.smsParmas.phone,
        password: this.smsParmas.password,
        type: this.type,
      });
    },
    
  },
});

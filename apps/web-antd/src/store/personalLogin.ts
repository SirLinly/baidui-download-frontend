// src/store/personalLogin.ts
import { defineStore } from 'pinia';
import { getQrCode, qrSign, qrBdussLogin } from '#/api/personalLogin';
import { getApi, getInit, sendSms, smsBdussLogin } from '#/api/convert';
// 生成uuid
const generateUUID = () =>
  crypto?.randomUUID?.() ??
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

export const usePersonalLoginStore = defineStore('personalLogin', {
  state: () => ({
    qrCodeInfo: {
      image: '',
      status: 'loading',
      gid: '', // 添加gid字段存储
    },
    qrParams: {
      key: '',
      gid: '',
      sign: '',
      bduss: '',
      type: 1,
    },
    smsParmas: {
      key: '',
      gid: '',
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
      type: 1,
    },
    cardKey: {},
  }),
  actions: {
    // 生成Gid
    createGid() {
      const gid = generateUUID();
      this.qrParams.gid = gid;
      this.smsParmas.gid = gid;
    },
    // 获取登录二维码
    async getQrCode() {
      // 生成新的gid
      this.createGid();
      const result = await getQrCode(this.qrParams);
      this.qrCodeInfo.image = result.imgurl.startsWith('http')
        ? result.imgurl
        : `https://${result.imgurl}`;
      this.qrParams.sign = result.sign;
      this.qrCodeInfo.gid = this.qrParams.gid; // 保存gid
      this.qrCodeInfo.status = 'active';
    },
    // 获取二维码状态 - 只负责查询状态，不处理登录逻辑
    async qrSign() {
      const response = await qrSign(this.qrParams);
      // 更新状态
      if (response.errno === 1) {
        // 未扫码，保持等待状态
        this.qrCodeInfo.status = 'active';
      } else if (response.channel_v?.status === 1) {
        // 扫码成功
        this.qrCodeInfo.status = 'scanned';
      } else if (response.channel_v?.status === 0) {
        // 登录成功
        this.qrParams.bduss = response.channel_v.v;
        this.qrCodeInfo.status = 'success';
      } else {
        // 其他状态
        this.qrCodeInfo.status = 'expired';
      }
      // 返回响应数据供外部处理
      return response;
    },
    // 扫码登录并更新卡密信息
    async loginWithBduss() {
      const newCardKey = await qrBdussLogin(this.qrParams);
      this.cardKey = newCardKey;
      return newCardKey;
    },
    // 初始化必要参数
    init() {
      getInit(this.smsParmas).then((res) => {
        this.smsParmas.ds = res.ds;
        this.smsParmas.tk = res.tk;
      });
    },
    // 获取api
    getApi() {
      getApi(this.smsParmas).then((res) => {
        this.smsParmas.token = res.token;
        this.smsParmas.dv = res.dv;
      });
    },
    // 发送验证码
    async sendSms() {
      // 等待初始化完成
      const res = await getInit(this.smsParmas);
      // 更新参数
      this.smsParmas.s = res.ds;
      this.smsParmas.k = res.tk;
      // 发送短信
      return sendSms(this.smsParmas);
    },
    // 通过输入图形验证码 发送短信验证码
    async inCatchsendSms() {
      // 等待初始化完成
      const res = await getInit(this.smsParmas);

      // 更新参数
      this.smsParmas.s = res.ds;
      this.smsParmas.k = res.tk;
      // 发送短信
      return sendSms(this.smsParmas);
    },
    setCardKey(key: string) {
      this.qrParams.key = key;
      this.smsParmas.key = key;
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
    // 获取图形验证码
    getCatchCode() {
      return this.smsParmas.verifycode;
    },
    // 更新卡密值
    setCardInfo(cardInfo: any) {
      this.cardKey = cardInfo;
    },
    // 获取验证码图片标识字符串
    getVocdeStr() {
      return this.smsParmas.vcodestr;
    },
    // 登录
    login() {
      return smsBdussLogin(this.smsParmas);
    },
  },
});

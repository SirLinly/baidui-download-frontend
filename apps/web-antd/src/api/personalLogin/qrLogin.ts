import { requestClient } from '#/api/request';
/**
 * 获取登录二维码
 * @param params 
 * @returns 
 */
export async function getQrCode(params: any) {
  return requestClient.get('/user/getQrCode',{params});
}
export async function qrSign(params: any) {
  return requestClient.get('/user/qrSign', { 
    params,
    timeout: 60000  // 设置超时时间为1分钟(60秒)
  });
}

/**
 * 登录鉴权
 * @returns 获取二维码
 */
export async function qrBdussLogin(params: any) {
  return requestClient.get('/user/qrBdussLogin',{params});
}

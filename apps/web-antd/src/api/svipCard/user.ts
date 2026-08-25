import { requestClient } from '#/api/request';


/**
 * 获取卡密状态
 */
export async function queryInfo(params: any) {
  return requestClient.get('/svipCard/query', { params });
}

/**
 * 网盘登录二维码
 * @returns 获取二维码
 */
export async function qrCode(params: any) {
  return requestClient.get('/svipCard/qrCode',{params});
}
export async function loginStatus(params: any) {
  return requestClient.get('/svipCard/loginStatus', { 
    params,
    timeout: 60000  // 设置超时时间为1分钟(60秒)
  });
}

/**
 * 登录鉴权
 * @returns 获取二维码
 */
export async function qrBdussLogin(params: any) {
  return requestClient.get('/svipCard/qrBdussLogin',{params});
}


/**
 * 确认提交
 * @returns 获取二维码
 */
export async function userConfirm(params: any) {
  return requestClient.get('/svipCard/confirm',{params});
}




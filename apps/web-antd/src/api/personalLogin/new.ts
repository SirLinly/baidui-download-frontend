import { requestClient } from '#/api/request';
/**
 * 获取登录二维码
 * @param params 
 * @returns 
 */
export async function getApi(params: any) {
  return requestClient.get('https://passport.baidu.com/v2/api/',{params});
}


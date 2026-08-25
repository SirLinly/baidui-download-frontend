import { requestClient } from '#/api/request';



/**
 * 网盘登录二维码
 * @returns 获取二维码
 */
export async function getQrCode(params: any) {
  return requestClient.get('/user/getQrCode',{params});
}
export async function getLoginStatus(params: any) {
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

/**
 * 获取token
 * @param params 
 * @returns 
 */
export async function getApi(params: any) {
  return requestClient.get('/user/getApi',{params});
}

/**
 * 初始化
 * @param params 
 * @returns 
 */
export async function getInit(params: any) {
  return requestClient.get('/user/getInit',{params});
}

/**
 * 发送短信
 * @param params 
 * @returns 
 */
export async function sendSms(params: any) {
  return requestClient.get('/user/sendSmsCatch',{params});
}

/**
 * 短信验证登录
 * @param params 
 * @returns 
 */
export async function smsBdussLogin(params: any) {
  return requestClient.get('/user/smsBdussLogin',{params});
}

/**
 * 获取网盘存储空间
 * @returns 
 */
export async function queryQuota(params: any) {
  return requestClient.get('/convert/queryQuota',{params});
}


/**
 * 文件转换
 * @param params 
 * @returns 
 */
export async function convertFile(params: { key: string; fileUrl: string }) {
  const formData = new FormData();
  
  // 将fileUrl添加到formData中
  formData.append('fileUrl', params.fileUrl);
  
  // 构造带查询参数的URL
  const url = `/convert/convertFile?key=${encodeURIComponent(params.key)}`;
  
  return requestClient.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000  // 设置超时时间为1分钟(60秒)
  });
}

/**
 * 清理空间文件
 * @param params 
 * @returns 
 */
export async function clearQuota(params: any) {
  // 创建 FormData 对象
  const formData = new FormData();
  // 将 params 的键值对添加到 FormData
  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      formData.append(key, params[key]);
    }
  }
  return requestClient.post('/convert/ClearQuota', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}


import { requestClient } from '#/api/request';

/**
 *  查询企业账户列表
 * @param params any
 * @returns 
 */
export async function getEnterprises(params: any) {
  return requestClient.get('/enterprise/queryBusAccount', { params });
}
/**
 * 查询企业成员
 * @param params 
 * @returns 
 */
export async function queryEpMember(params: any) {
  return requestClient.get('/enterprise/member/queryEpMembers', { params });
}

/**
 * 删除企业成员
 * @param id 
 * @returns 
 */
export async function delEpMember(id: number) {
  return requestClient.delete(`enterprise/member/delMember/${id}`);
}

export async function modifyMember(params: any) {
  return requestClient.post('/enterprise/member/modify', params );
}

/**
 * 通过ck 查询企业
 * @param params 
 * @returns 
 */
export async function queryEpInfo(params: any) {
  return requestClient.post('/enterprise/queryEp', params);
}



export async function addEp(params: any) {
  return requestClient.post('/enterprise/addEp', params);
}


/**
 * 获取登录二维码
 * @returns 
 */
export async function getQrLoginCode(params: any) {
  return requestClient.get('/enterprise/getLoginQr',{params});
}

/**
 * 获取登录状态
 * @returns 
 */
export async function getLoginStatus(params: any) {
  return requestClient.get('/enterprise/getLoginStatus', { 
    params,
    timeout: 60000  // 设置超时时间为1分钟(60秒)
  });
}
/**
 * 扫码登录
 * @param params 
 * @returns 
 */
export async function qrBdussLogin(params: any) {
  return requestClient.get('/enterprise/qrBdussLogin', { 
    params,
  });
}


/**
 * 刷新ep数据
 * @param id 
 * @returns 
 */
export async function refreshInfo(id: number) {
  return requestClient.put(`/enterprise/refreshEpInfo/${id}`);
}
/**
 * 清理空间
 * @param id 企业id
 * @returns 
 */
export async function clearFile(id: number) {
  return requestClient.get(`/enterprise/clearFile/${id}`);
}
/**
 * 删除账号
 * @param id 企业id
 * @returns 
 */
export async function delAccount(id: number) {
  return requestClient.delete(`/enterprise/DeleteEp/${id}`);
}
/**
 * 修改账号信息
 * @param params any
 * @returns 
 */
export async function editEpInfo(params: any) {
  return requestClient.post(`/enterprise/editEpInfo`,params);
}
/**
 * 是否展示登录
 * @param id 
 * @returns 
 */
export async function isShowLogin(id: number) {
  return requestClient.put(`/enterprise/isShowLogin/${id}`);
}
/**
 * 是否文件限制
 * @param id 
 * @returns 
 */
export async function isFileLimit(id: number) {
  return requestClient.put(`/enterprise/isFileLimit/${id}`);
}
/**
 * 是否绑定卡密
 * @param id 
 * @returns 
 */
export async function isBindCard(id: number) {
  return requestClient.put(`/enterprise/member/isBindCard/${id}`);
}

/**
 * 是否分享链接
 * @param id 
 * @returns 
 */
export async function isShareLink(id: number) {
  return requestClient.put(`/enterprise/member/isShareLink/${id}`);
}
/**
 * 是否自动删除
 * @param id 
 * @returns 
 */
export async function isAutoDel(id: number) {
  return requestClient.put(`/enterprise/isAutoDel/${id}`);
}

/**
 * 购买下载卷
 * @param id 
 * @returns 
 */
export async function buySpeedRoll(params:any) {
  return requestClient.get('/enterprise/buySpeedDownload',{params});
}

/**
 * 购买下载卷
 * @param id 
 * @returns 
 */
export async function pay(urlParams: {epId: any, memberId: any},params: any) {
    const { epId, memberId } = urlParams;
  return requestClient.post(`/enterprise/pay?epId=${epId}&memberId=${memberId}`,params);
}

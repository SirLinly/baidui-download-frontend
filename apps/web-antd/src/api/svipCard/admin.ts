import { requestClient } from '#/api/request';
/**
 *  查询订单列表
 * @param params any
 * @returns 
 */
export async function query(params: any) {
  return requestClient.get('/admin/svipCard/query', { params });
}
/**
 * 新增卡密
 * @param params 
 * @returns 
 */
export async function add(params: any) {
  return requestClient.post('/admin/svipCard/add', params);
}
/**
 * 删除卡密
 * @param id 
 * @returns 
 */
export async function del(id: number) {
  return requestClient.delete(`/admin/svipCard/del/${id}`);
}
/**
 * 批量删除卡密
 * @param ids 
 * @returns 
 */
export async function delBatch(ids: any) {
  return requestClient.post(`/admin/svipCard/delBatch`,ids);
}

/**
 * 批量删除卡密
 * @param ids 
 * @returns 
 */
export async function update(params: any) {
  return requestClient.put('/admin/svipCard/update',params);
}

/**
 * 获取活动信息
 * @returns 获取二维码
 */
export async function activitys(id: number) {
  return requestClient.get(`/admin/svipCard/activity/${id}`);
}

/**
 * 获取推广联盟活动信息
 * @returns 获取二维码
 */
export async function activityPromotion(id: number) {
  return requestClient.get(`/admin/svipCard/activity/promotion/${id}`);
}

/**
 * 确认支付
 * @returns 获取二维码
 */
export async function payActivity(id: number,params: any) {
  return requestClient.post(`/admin/svipCard/payActivity/${id}`,params);
}
/**
 * H5确认支付
 * @returns 获取二维码
 */
export async function payPromotion(id: number,params: any) {
  return requestClient.post(`/admin/svipCard/payPromotion/${id}`,params);
}


/**
 * 检测支付状态
 * @returns 获取二维码
 */
export async function pay(id: number,params: any) {
  return requestClient.post(`/admin/svipCard/pay/${id}`,params);
}

import { requestClient } from '#/api/request';


/**
 *  查询卡密列表
 * @param params any
 * @returns 
 */
export async function getCodes(params: any) {
  return requestClient.get('/codes/codes', { params });
}


/**
 * 新增用户
 * @param data 
 * @returns 
 */
export async function addCode(data:any) {
  return requestClient.post('/codes/addCode', data);
}

/**
 * 批量删除卡密
 * @param ids number | number[]
 * @returns 
 */
export async function delCodes(ids: number | number[]) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const idStr = idArray.join(',');
  return requestClient.delete(`/codes/remove/${idStr}`);
}

export async function updCodes(ids: number | number[]) {
  const idArray = Array.isArray(ids) ? ids : [ids];
  const idStr = idArray.join(',');
  return requestClient.put(`/codes/status/${idStr}`);
}


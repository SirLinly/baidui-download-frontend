import { requestClient } from '#/api/request';

/**
 *  查询租户配置
 * @param params any
 * @returns 
 */
export async function getConfigAll() {
  return requestClient.get("/tenant-config/getConfig");
}

/**
 *  查询租户配置
 * @param params any
 * @returns 
 */
export async function saveConfig(param: any) {
  return requestClient.post("/tenant-config/set",param);
}

export async function getTokenCofig() {
  return requestClient.get("/tenant-config/getToken");
}

import { requestClient } from '#/api/request';
interface platform {
  page: number; // 当前页码
  pageSize: number; // 每页数量
}


export async function getPlatform() {
  return requestClient.get<platform>('/platform/platforms');
}

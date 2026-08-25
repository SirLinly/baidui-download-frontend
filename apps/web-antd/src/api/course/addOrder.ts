import { requestClient } from '#/api/request';

export async function addOrder(data: any) {
  return requestClient.post('/order/addOrder',data);
}

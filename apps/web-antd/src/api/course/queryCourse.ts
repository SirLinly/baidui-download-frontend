import { requestClient } from '#/api/request';



export async function getCourses(data: any) {
  return requestClient.post('/platform/queryCourse',data);
}

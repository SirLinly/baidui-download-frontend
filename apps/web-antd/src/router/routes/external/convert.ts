import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Convert',
    path: '/convert',
    component: () => import('#/views/card/convertCard/user/index.vue'),
    meta: {
      title: '转换下载',
    },
  },
];

export default routes;

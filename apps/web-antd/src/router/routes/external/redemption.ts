import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'Redemption',
    path: '/redemption',
    component: () => import('#/views/card/svipCard/user/index.vue'),
    meta: {
      title: '百度网盘SVIP自助开通',
    },
  },
];

export default routes;

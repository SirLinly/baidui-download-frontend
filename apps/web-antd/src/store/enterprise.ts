import { defineStore } from 'pinia'

export const useEnterpriseStore = defineStore('agent', {
  state: () => ({
    shouldRefreshGrid: false, //刷新表格状态
    checkTablerows: {},
  }),
  actions: {
    // 👇 正确定义一个 action 来触发刷新
    triggerGridRefresh() {
      this.shouldRefreshGrid = !this.shouldRefreshGrid;
    },
  },
});

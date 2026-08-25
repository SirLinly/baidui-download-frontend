<script lang="ts" setup>
import { Page } from '@vben/common-ui';
import Table from './table.vue';
</script>

<template>
  <Page auto-content-height>
    <Table />
  </Page>
</template>
<style scoped>
.menu-item-content {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
}

.menu-item-icon {
  margin-right: 4px;
  vertical-align: -0.125em;
  /* 微调图标垂直位置 */
}
</style>

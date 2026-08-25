<script lang="ts" setup>
import { ref } from 'vue';
import { Loading } from '@vben/common-ui';
import Table from './table.vue'
const loading = ref(false);
const loadingText = ref('正在加载中...');
</script>
<template>
  <Loading :spinning="loading" :text="loadingText">
    <Table/>
  </Loading>
</template>

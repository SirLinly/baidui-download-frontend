<script lang="ts" setup>
import { computed } from 'vue';

import { AuthPageLayout } from '@vben/layouts';
import { preferences } from '@vben/preferences';

// import { $t } from '#/locales';

const appName = computed(() => preferences.app.name);
// const logo = computed(() => preferences.logo.source);
</script>

<template>
  <AuthPageLayout
    :copyright= false
    :app-name="appName"
    sloganImage="https://i0.wp.com/sirlinly.github.io/v3/2025/07/bgLogin.png"
    logo="https://i0.wp.com/sirlinly.github.io/v3/2025/07/1751542737538.webp"
    page-description="—— 于谦 《观书》"
    page-title="活水源流随处满，东风花柳逐时新。"
  >
    <!-- 自定义工具栏 -->
    <!-- <template #toolbar></template> -->
  </AuthPageLayout>
</template>

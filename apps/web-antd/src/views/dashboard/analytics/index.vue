<script lang="ts" setup>
import type { AnalysisOverviewItem } from '@vben/common-ui';
import type { TabOption } from '@vben/types';

import {
  AnalysisChartCard,
  AnalysisChartsTabs,
  AnalysisOverview,
} from '@vben/common-ui';
import {
  SvgBellIcon,
  SvgCakeIcon,
  SvgCardIcon,
  SvgDownloadIcon,
} from '@vben/icons';

import AnalyticsTrends from './analytics-trends.vue';
import AnalyticsVisitsData from './analytics-visits-data.vue';
import AnalyticsVisitsSales from './analytics-visits-sales.vue';
import AnalyticsVisitsSource from './analytics-visits-source.vue';
import AnalyticsVisits from './analytics-visits.vue';
import { getStats } from '#/api/stats/index'
import { onMounted, ref, computed } from 'vue';
const cardKeyTotalCount = ref(0);
const createCardKeyTodayCount =ref(0);
const usedTotalCount =ref(0);
const usedTodayCount =ref(0);
const downloadTotalCount =ref(0);
const accessTotalCount =ref(0);
onMounted(async () => {
  // const res = await getStats()
  // cardKeyTotalCount.value = res.cardKeyTotalCount;
  // createCardKeyTodayCount.value = res.createCardKeyTodayCount;
  // usedTotalCount.value = res.usedTotalCount;
  // usedTodayCount.value = res.usedTodayCount;
  // downloadTotalCount.value = res.downloadTotalCount;
  // accessTotalCount.value = res.accessTotalCount;
})

const overviewItems = computed<AnalysisOverviewItem[]>(() => [
  {
    icon: SvgCardIcon,
    title: '今日量',
    totalTitle: '总卡密量',
    totalValue: cardKeyTotalCount.value,
    value: createCardKeyTodayCount.value,
  },
  {
    icon: SvgBellIcon,
    title: '使用量',
    totalTitle: '总使用量',
    totalValue: usedTotalCount.value,
    value: usedTodayCount.value,
  },
  {
    icon: SvgDownloadIcon,
    title: '下载量',
    totalTitle: '总下载量',
    totalValue: downloadTotalCount.value,
    value: 8000,
  },
  {
    icon: SvgCakeIcon,
    title: '访问量',
    totalTitle: '总访问量',
    totalValue: accessTotalCount.value,
    value: 20_000,
  },
]);

const chartTabs: TabOption[] = [
  {
    label: '流量趋势',
    value: 'trends',
  },
  {
    label: '月访问量',
    value: 'visits',
  },
];
</script>

<template>
  <div class="p-5">
    <AnalysisOverview :items="overviewItems" />
    <AnalysisChartsTabs :tabs="chartTabs" class="mt-5">
      <template #trends>
        <AnalyticsTrends />
      </template>
      <template #visits>
        <AnalyticsVisits />
      </template>
    </AnalysisChartsTabs>

    <div class="mt-5 w-full md:flex">
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问数量">
        <AnalyticsVisitsData />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mr-4 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSource />
      </AnalysisChartCard>
      <AnalysisChartCard class="mt-5 md:mt-0 md:w-1/3" title="访问来源">
        <AnalyticsVisitsSales />
      </AnalysisChartCard>
    </div>
  </div>
</template>

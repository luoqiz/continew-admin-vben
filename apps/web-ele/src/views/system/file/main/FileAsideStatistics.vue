<script setup lang="ts">
import type { FileStatisticsResp } from '#/api/system';

import { onMounted, ref } from 'vue';
import VCharts from 'vue-echarts';

import { $t } from '@vben/locales';

import { PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

import { getFileStatistics } from '#/api/system';
import { FileTypeList } from '#/constant/file';
import { useChart } from '#/hooks';
import { formatFileSize } from '#/utils/file';
import mittBus from '#/utils/mitt';

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
  GridComponent,
]);

const totalData = ref<FileStatisticsResp>({
  type: 0,
  size: 0,
  number: 0,
  unit: '',
  data: [],
});
const chartData = ref<Array<{ name: string; size: string; value: number }>>([]);
const statisticValueStyle = { color: '#5856D6', 'font-size': '18px' };
// useChart 的回调自带 isDark 参数（computed 驱动，切主题自动重渲染）
const { chartOption } = useChart((isDark) => {
  return {
    grid: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    legend: {
      show: true,
      bottom: -5,
      icon: 'circle',
      itemWidth: 6,
      itemHeight: 6,
      textStyle: {
        color: isDark ? 'rgba(255, 255, 255, 0.65)' : '#4E5969',
      },
    },
    tooltip: {
      show: true,
      formatter(params: any) {
        return `${$t('system.file.statistic.total', { value: params.value })}<br>${params.data.size}`;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: true,
        label: {
          show: false,
          position: 'center',
        },
        data: chartData.value,
      },
    ],
  };
});

const loading = ref(false);
const getStatisticsData = async () => {
  try {
    loading.value = true;
    chartData.value = [];
    const resData = await getFileStatistics();
    const formatSize = formatFileSize(resData.size).split(' ');
    totalData.value = {
      type: 0,
      size: Number.parseFloat(formatSize[0] ?? '0'),
      number: resData.number ?? 0,
      unit: formatSize[1] ?? '',
      data: [],
    };
    resData?.data.forEach((fs: FileStatisticsResp) => {
      const matchedItem = FileTypeList.find((item) => item.value === fs.type);
      chartData.value.unshift({
        name: matchedItem ? $t(matchedItem.nameKey) : '',
        value: fs.number,
        size: formatFileSize(fs.size),
      });
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getStatisticsData();
  mittBus.on('file-total-refresh', () => {
    getStatisticsData();
  });
});
</script>

<template>
  <ElCard>
    <div class="statistic-space">
      <el-statistic
        class="statistic-item"
        :title="$t('system.file.statistic.storage')"
        :value="totalData.size"
        :value-style="statisticValueStyle"
      >
        <template #suffix>&nbsp;{{ totalData.unit }}</template>
      </el-statistic>
      <el-divider direction="vertical" border-style="solid" />
      <el-statistic
        class="statistic-item"
        :title="$t('system.file.statistic.count')"
        :value="totalData.number"
        :value-style="statisticValueStyle"
      />
    </div>
    <div v-if="chartData.length > 0" class="w-full justify-center align-middle">
      <el-divider />
      <div class="border rounded-md">
        <VCharts
          :option="chartOption"
          autoresize
          :style="{ height: '120px', width: '150px' }"
        />
      </div>
    </div>
  </ElCard>
</template>

<style scoped lang="scss">
.statistic-space {
  display: flex;
  align-items: center;
  justify-content: center;
}

.statistic-item {
  flex: 1;
  text-align: center;
}

.percent {
  box-sizing: border-box;
  padding: 20px;
  margin-top: 10px;
  background-color: hsl(var(--card));
}
</style>

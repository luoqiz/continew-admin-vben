<script setup lang="ts">
import type { FileStatisticsResp } from '#/api/system';

import { onMounted, ref } from 'vue';
import VCharts from 'vue-echarts';

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
  type: '',
  size: 0,
  number: 0,
  unit: '',
  data: [],
});
const chartData = ref<Array<{ name: string; size: string; value: number }>>([]);
const statisticValueStyle = { color: '#5856D6', 'font-size': '18px' };
const { chartOption } = useChart(() => {
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
        color: '#4E5969',
      },
    },
    tooltip: {
      show: true,
      formatter(params) {
        return `总计：${params.value}<br>${params.data.size}`;
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
      type: '',
      size: Number.parseFloat(formatSize[0]!),
      number: resData.number ?? 0,
      unit: formatSize[1]!,
      data: [],
    };
    resData?.data.forEach((fs: FileStatisticsResp) => {
      const matchedItem = FileTypeList.find((item) => item.value === fs.type);
      chartData.value.unshift({
        name: matchedItem ? matchedItem.name : '',
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
        title="存储量"
        :value="totalData.size"
        :value-style="statisticValueStyle"
      >
        <template #suffix>&nbsp;{{ totalData.unit }}</template>
      </el-statistic>
      <el-divider direction="vertical" border-style="solid" />
      <el-statistic
        class="statistic-item"
        title="数量"
        :value="totalData.number"
        :value-style="statisticValueStyle"
      />
    </div>
    <div v-if="chartData.length > 0" class="w-full justify-center align-middle">
      <el-divider />
      <div class="border border-red-950">
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
  background-color: var(--color-bg-1);
}
</style>

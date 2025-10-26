<script setup lang="ts">
import type { CronPropType } from './type';

import { computed, onMounted, reactive, ref, watch } from 'vue';

import { dateFormat } from '@vben/utils';

import { useDebounceFn } from '@vueuse/core';
import CronParser from 'cron-parser';

import DayForm from './component/day-form.vue';
import HourForm from './component/hour-form.vue';
import MinuteForm from './component/minute-form.vue';
import MonthForm from './component/month-form.vue';
import SecondForm from './component/second-form.vue';
import WeekForm from './component/week-form.vue';
import YearForm from './component/year-form.vue';

const props = withDefaults(defineProps<Partial<CronPropType>>(), {
  disabled: false,
  hideSecond: false,
  hideYear: false,
  placeholder: '请输入 Cron 表达式',
});
const emit = defineEmits(['change', 'update:modelValue']);
const activeKey = ref(props.hideSecond ? 'minute' : 'second');
const second = ref('*');
const minute = ref('*');
const hour = ref('*');
const day = ref('*');
const month = ref('*');
const week = ref('?');
const year = ref('*');
const cronInputs = reactive({
  second: '',
  minute: '',
  hour: '',
  day: '',
  month: '',
  week: '',
  year: '',
  cron: '',
});

const previewTimes = ref('执行预览');

// cron 表达式
const cronExpression = computed(() => {
  const result: string[] = [];
  if (!props.hideSecond) {
    result.push(second.value ?? '*');
  }
  result.push(
    minute.value ?? '*',
    hour.value ?? '*',
    day.value ?? '*',
    month.value ?? '*',
    week.value ?? '?',
  );
  if (!props.hideYear && !props.hideSecond) {
    result.push(year.value ?? '*');
  }
  return result.join(' ');
});

// 不含年的 cron 表达式
const expressionNoYear = (corn: string) => {
  if (props.hideYear || props.hideSecond) return corn;
  const vs = corn.split(' ');
  return vs.slice(0, -1).join(' ');
};

// 计算触发时间
const calculateNextExecutionTimes = (corn: string = cronExpression.value) => {
  try {
    const parse = expressionNoYear(corn);
    // 解析表达式
    const date = dateFormat(new Date());
    const iter = CronParser.parse(parse, {
      currentDate: date,
    });
    const result: string[] = [];
    for (let i = 1; i <= 5; i++) {
      result.push(dateFormat(new Date(iter.next() as any)));
    }
    previewTimes.value = result.length > 0 ? result.join('\n') : '无执行时间';
    // 回调
    if (props.callback) {
      props.callback(cronExpression.value, Date.now(), true);
    }
  } catch {
    previewTimes.value = '表达式错误';
    // 回调
    if (props.callback) {
      props.callback(cronExpression.value, Date.now(), false);
    }
  }
};

const calcTriggerTimeList = useDebounceFn(calculateNextExecutionTimes, 500);

// 监听 cron 修改
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal === cronExpression.value) {
      return;
    }
    parseCron();
  },
);

// 监听 cron 修改
watch(cronExpression, (newValue) => {
  calcTriggerTimeList();
  emitValue(newValue);
  assignInput();
});

// 根据 cron 解析
const parseCron = () => {
  // 计算执行时间
  calcTriggerTimeList();
  if (!props.modelValue) {
    return;
  }
  const values = props.modelValue
    .toString()
    .split(' ')
    .filter((item) => !!item);
  if (!values || values.length <= 0) {
    return;
  }
  let i = 0;
  if (!props.hideSecond) second.value = values[i++]!;
  if (values.length > i) minute.value = values[i++]!;
  if (values.length > i) hour.value = values[i++]!;
  if (values.length > i) day.value = values[i++]!;
  if (values.length > i) month.value = values[i++]!;
  if (values.length > i) week.value = values[i++]!;
  if (values.length > i) year.value = values[i]!;
  // 重新分配
  assignInput();
};

// 重新分配
const assignInput = () => {
  cronInputs.second = second.value;
  cronInputs.minute = minute.value;
  cronInputs.hour = hour.value;
  cronInputs.day = day.value;
  cronInputs.month = month.value;
  cronInputs.week = week.value;
  cronInputs.year = year.value;
  cronInputs.cron = cronExpression.value;
};

// 修改 cron 解析内容
const onInputChange = () => {
  second.value = cronInputs.second;
  minute.value = cronInputs.minute;
  hour.value = cronInputs.hour;
  day.value = cronInputs.day;
  month.value = cronInputs.month;
  week.value = cronInputs.week;
  year.value = cronInputs.year;
};

// 修改 cron 输入框
const onInputCronChange = (value: string) => {
  emitValue(value);
};

// 修改 cron
const emitValue = (value: string) => {
  emit('change', value);
  emit('update:modelValue', value);
};

onMounted(() => {
  assignInput();
  parseCron();
  // 如果 modelValue 没有值则更新为 cronExpression
  if (!props.modelValue) {
    emitValue(cronExpression.value);
  }
});
const checkCron = () => {
  return day.value === '?' && week.value === '?';
};

defineExpose({ checkCron });
</script>

<template>
  <div class="cron-inner">
    <div class="content">
      <!-- 设置表单 -->
      <el-tabs v-model="activeKey" type="card" size="small">
        <!-- 秒 -->
        <el-tab-pane v-if="!hideSecond" name="second" label="秒">
          <SecondForm v-model="second" :disabled="disabled" />
        </el-tab-pane>
        <!-- 分 -->
        <el-tab-pane name="minute" label="分">
          <MinuteForm v-model="minute" :disabled="disabled" />
        </el-tab-pane>
        <!-- 时 -->
        <el-tab-pane name="hour" label="时">
          <HourForm v-model="hour" :disabled="disabled" />
        </el-tab-pane>
        <!-- 日 -->
        <el-tab-pane name="day" label="日">
          <DayForm v-model="day" :week="week" :disabled="disabled" />
        </el-tab-pane>
        <!-- 月 -->
        <el-tab-pane name="month" label="月">
          <MonthForm v-model="month" :disabled="disabled" />
        </el-tab-pane>
        <!-- 周 -->
        <el-tab-pane name="week" label="周">
          <WeekForm v-model="week" :day="day" :disabled="disabled" />
        </el-tab-pane>
        <!-- 年 -->
        <el-tab-pane v-if="!hideYear && !hideSecond" name="year" label="年">
          <YearForm v-model="year" :disabled="disabled" />
        </el-tab-pane>
      </el-tabs>

      <!-- 执行时间预览 -->
      <el-row :gutter="8" justify="space-between">
        <!-- 快捷修改 -->
        <el-col :span="18" style="margin-top: 28px">
          <el-row :gutter="12">
            <!-- 秒 -->
            <el-col :span="8" class="mb-2">
              <el-input v-model="cronInputs.second" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'second'">
                    秒
                  </span>
                </template>
              </el-input>
            </el-col>
            <!-- 分 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.minute" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'minute'">
                    分
                  </span>
                </template>
              </el-input>
            </el-col>
            <!-- 时 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.hour" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'hour'">
                    时
                  </span>
                </template>
              </el-input>
            </el-col>
            <!-- 日 -->
            <el-col :span="8" class="mb-2">
              <el-input v-model="cronInputs.day" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'day'">日</span>
                </template>
              </el-input>
            </el-col>
            <!-- 月 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.month" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'month'">
                    月
                  </span>
                </template>
              </el-input>
            </el-col>
            <!-- 周 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.week" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'week'">
                    周
                  </span>
                </template>
              </el-input>
            </el-col>
            <!-- 年 -->
            <el-col :span="8">
              <el-input v-model="cronInputs.year" @change="onInputChange">
                <template #prepend>
                  <span class="allow-click" @click="activeKey = 'year'">
                    年
                  </span>
                </template>
              </el-input>
            </el-col>
            <!-- 表达式 -->
            <el-col :span="16">
              <el-input
                v-model="cronInputs.cron"
                :placeholder="placeholder"
                @change="onInputCronChange"
              >
                <template #prepend>
                  <span class="allow-click">表达式</span>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </el-col>

        <!-- 执行时间 -->
        <el-col :span="6">
          <div class="preview-times usn">近五次执行时间 (不解析年)</div>
          <el-input
            type="textarea"
            v-model="previewTimes"
            :autosize="{ minRows: 5, maxRows: 5 }"
            readonly
          />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="less" scoped>
.cron-inner {
  user-select: none;

  :deep(.arco-tabs-content) {
    padding-top: 6px;
  }

  :deep(.cron-inner-config-list) {
    text-align: left;
    margin: 0 12px 4px 12px;

    .item {
      margin-top: 6px;
      font-size: 14px;
      width: 100%;
    }

    .choice {
      padding: 4px 8px 4px 0;
    }

    .w60 {
      margin: 0 8px !important;
      padding: 0 8px !important;
      width: 60px !important;
    }

    .w80 {
      margin: 0 8px !important;
      padding: 0 8px !important;
      width: 80px !important;
    }

    .list {
      margin: 0 20px;
    }

    .list-check-item {
      padding: 1px 3px;
      width: 4em;
    }

    .list-cn .list-check-item {
      width: 5em;
    }

    .tip-info {
      color: var(--color-text-3);
    }
  }
}

:deep(.arco-input-prepend) {
  padding: 0 !important;
}

:deep(.arco-input-append) {
  padding: 0 !important;
}

.preview-times {
  color: var(--color-text-3);
  margin: 2px 0 8px 0;
}

.allow-click {
  width: 100%;
  height: 100%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}
</style>

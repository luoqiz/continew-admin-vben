<script lang="ts">
import { defineComponent } from 'vue';

import { useFormProps, useFormSetup, useFromEmits } from './use-mixin';

export default defineComponent({
  name: 'YearForm',
  props: useFormProps({
    defaultValue: '*',
  }),
  emits: useFromEmits(),
  setup(props, context) {
    const nowYear = new Date().getFullYear();
    return useFormSetup(props, context, {
      defaultValue: '*',
      minValue: 0,
      valueRange: { start: nowYear, end: nowYear + 100 },
      valueLoop: { start: nowYear, interval: 1 },
    });
  },
});
</script>

<template>
  <div class="cron-inner-config-list">
    <el-radio-group v-model="type">
      <div class="item">
        <el-radio :label="TypeEnum.every" v-bind="beforeRadioAttrs">
          每年
        </el-radio>
      </div>
      <div class="item">
        <el-radio :label="TypeEnum.range" v-bind="beforeRadioAttrs">
          区间
        </el-radio>
        <span>从</span>
        <el-input-number
          v-model="valueRange.start"
          v-bind="typeRangeAttrs"
          :controls="false"
        />
        <span>年 至</span>
        <el-input-number
          v-model="valueRange.end"
          v-bind="typeRangeAttrs"
          :controls="false"
        />
        <span>年</span>
      </div>
      <div class="item">
        <el-radio :label="TypeEnum.loop" v-bind="beforeRadioAttrs">
          循环
        </el-radio>
        <span>从</span>
        <el-input-number
          v-model="valueLoop.start"
          v-bind="typeLoopAttrs"
          :controls="false"
        />
        <span>年开始, 间隔</span>
        <el-input-number
          v-model="valueLoop.interval"
          v-bind="typeLoopAttrs"
          :controls="false"
        />
        <span>年</span>
      </div>
    </el-radio-group>
  </div>
</template>

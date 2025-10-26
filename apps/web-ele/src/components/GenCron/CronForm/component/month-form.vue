<script lang="ts">
import { defineComponent } from 'vue';

import { useFormProps, useFormSetup, useFromEmits } from './use-mixin';

export default defineComponent({
  name: 'MonthForm',
  props: useFormProps({
    defaultValue: '*',
  }),
  emits: useFromEmits(),
  setup(props, context) {
    return useFormSetup(props, context, {
      defaultValue: '*',
      minValue: 1,
      maxValue: 12,
      valueRange: { start: 1, end: 12 },
      valueLoop: { start: 1, interval: 1 },
    });
  },
});
</script>

<template>
  <div class="cron-inner-config-list">
    <el-radio-group v-model="type">
      <div class="item">
        <el-radio :label="TypeEnum.every" v-bind="beforeRadioAttrs">
          每月
        </el-radio>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.range" v-bind="beforeRadioAttrs">
          区间
        </el-radio>
        <span>从</span>
        <el-input-number v-model="valueRange.start" v-bind="typeRangeAttrs" />
        <span>月 至</span>
        <el-input-number v-model="valueRange.end" v-bind="typeRangeAttrs" />
        <span>月</span>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.loop" v-bind="beforeRadioAttrs">
          循环
        </el-radio>
        <span>从</span>
        <el-input-number v-model="valueLoop.start" v-bind="typeLoopAttrs" />
        <span>月开始, 间隔</span>
        <el-input-number v-model="valueLoop.interval" v-bind="typeLoopAttrs" />
        <span>月</span>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.specify" v-bind="beforeRadioAttrs">
          指定
        </el-radio>
        <div class="list">
          <el-checkbox-group v-model="valueList">
            <el-row :gutter="12">
              <el-col v-for="i in specifyRange" :key="i" :span="2">
                <el-checkbox :label="i" v-bind="typeSpecifyAttrs">
                  {{ i }}
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </div>
      </div>
    </el-radio-group>
  </div>
</template>

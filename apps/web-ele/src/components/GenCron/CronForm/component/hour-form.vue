<script lang="ts">
import { defineComponent } from 'vue';

import { useFormProps, useFormSetup, useFromEmits } from './use-mixin';

export default defineComponent({
  name: 'HourForm',
  props: useFormProps({
    defaultValue: '*',
  }),
  emits: useFromEmits(),
  setup(props, context) {
    return useFormSetup(props, context, {
      defaultValue: '*',
      minValue: 0,
      maxValue: 23,
      valueRange: { start: 0, end: 23 },
      valueLoop: { start: 0, interval: 1 },
    });
  },
});
</script>

<template>
  <div class="cron-inner-config-list">
    <el-radio-group v-model="type">
      <div class="item">
        <el-radio :label="TypeEnum.every" v-bind="beforeRadioAttrs">
          每时
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
          :min="minValue"
          :max="maxValue"
          :controls="false"
        />
        <span>时 至</span>
        <el-input-number
          v-model="valueRange.end"
          v-bind="typeRangeAttrs"
          :min="minValue"
          :max="maxValue"
          :controls="false"
        />
        <span>时</span>
      </div>
      <div class="item">
        <el-radio :label="TypeEnum.loop" v-bind="beforeRadioAttrs">
          循环
        </el-radio>
        <span>从</span>
        <el-input-number
          v-model="valueLoop.start"
          v-bind="typeLoopAttrs"
          :min="minValue"
          :max="maxValue"
          :controls="false"
        />
        <span>时开始, 间隔</span>
        <el-input-number
          v-model="valueLoop.interval"
          v-bind="typeLoopAttrs"
          :min="1"
          :controls="false"
        />
        <span>时</span>
      </div>
      <div class="item">
        <el-radio :label="TypeEnum.specify" v-bind="beforeRadioAttrs">
          指定
        </el-radio>
        <div class="list">
          <el-checkbox-group v-model="valueList">
            <el-row :gutter="12">
              <el-col :span="3" v-for="i in specifyRange" :key="i">
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

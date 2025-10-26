<script lang="ts">
import { computed, defineComponent, watch } from 'vue';

import {
  TypeEnum,
  useFormProps,
  useFormSetup,
  useFromEmits,
} from './use-mixin';

export default defineComponent({
  name: 'DayForm',
  props: useFormProps({
    defaultValue: '*',
    props: {
      week: { type: String, default: '?' },
    },
  }),
  emits: useFromEmits(),
  setup(props, context) {
    const isDisabled = computed(() => {
      return (props.week && props.week !== '?') || props.disabled;
    });
    const setup = useFormSetup(props, context, {
      defaultValue: '*',
      valueWork: 1,
      minValue: 1,
      maxValue: 31,
      valueRange: { start: 1, end: 31 },
      valueLoop: { start: 1, interval: 1 },
      disabled: isDisabled,
    });
    const typeWorkAttrs = computed(() => ({
      disabled:
        setup.type.value !== TypeEnum.work ||
        props.disabled ||
        isDisabled.value,
      ...setup.inputNumberAttrs.value,
    }));

    watch(
      () => props.week,
      () => {
        setup.updateValue(isDisabled.value ? '?' : setup.computeValue.value);
      },
    );

    return { ...setup, typeWorkAttrs };
  },
});
</script>

<template>
  <div class="cron-inner-config-list">
    <el-radio-group v-model="type">
      <div class="item">
        <el-radio :label="TypeEnum.unset" v-bind="beforeRadioAttrs">
          不设置
        </el-radio>
        <span class="tip-info">日和周只能设置其中之一</span>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.every" v-bind="beforeRadioAttrs">
          每日
        </el-radio>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.range" v-bind="beforeRadioAttrs">
          区间
        </el-radio>
        <span>从</span>
        <el-input-number
          v-model="valueRange.start"
          v-bind="inputNumberAttrs"
          :controls="false"
        />
        <span>日 至</span>
        <el-input-number
          v-model="valueRange.end"
          v-bind="inputNumberAttrs"
          :controls="false"
        />
        <span>日</span>
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
        <span>日开始, 间隔</span>
        <el-input-number
          v-model="valueLoop.interval"
          v-bind="typeLoopAttrs"
          :controls="false"
        />
        <span>日</span>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.last" v-bind="beforeRadioAttrs">
          最后一日
        </el-radio>
      </div>

      <div class="item">
        <el-radio :label="TypeEnum.specify" v-bind="beforeRadioAttrs">
          指定
        </el-radio>
        <div class="list">
          <el-checkbox-group v-model="valueList">
            <div class="specify-grid">
              <div class="specify-item" v-for="i in specifyRange" :key="i">
                <el-checkbox :label="i" v-bind="typeSpecifyAttrs">
                  {{ i }}
                </el-checkbox>
              </div>
            </div>
          </el-checkbox-group>
        </div>
      </div>
    </el-radio-group>
  </div>
</template>

<style scoped>
.specify-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.specify-item {
  width: calc(100% / 11 - 8px);
  min-width: 28px;
}
</style>

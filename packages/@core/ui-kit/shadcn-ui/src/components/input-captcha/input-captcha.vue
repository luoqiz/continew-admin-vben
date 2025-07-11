<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

import { Input as VbenInput } from '../../ui/input';

interface Props {
  captcha?: string;
  expireTime?: number;
  label?: string;
  loading?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  captcha: '',
  label: '验证码',
  loading: false,
  placeholder: '请输入验证码',
  expireTime: 0,
});

const emit = defineEmits<{ captchaClick: [] }>();

const modelValue = defineModel<string>({ default: '' });

const expired = ref<boolean>(false);

const onRefreshClick = () => {
  emit('captchaClick');
  expired.value = false;
};

// 验证码过期定时器
let timer: any;
const startTimer = (expireTime: number, curTime = Date.now()) => {
  if (timer) {
    clearTimeout(timer);
  }
  const remainingTime = expireTime - curTime;
  if (remainingTime <= 0) {
    expired.value = true;
    return;
  }
  timer = setTimeout(() => {
    expired.value = true;
  }, remainingTime);
};

// 组件销毁时清理定时器
onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer);
  }
});

watch(
  () => props.expireTime,
  () => {
    if (props.expireTime - Date.now() > 0) {
      startTimer(props.expireTime);
    }
  },
  { immediate: true },
);
</script>

<!-- 图片验证码 -->
<template>
  <div class="flex w-full">
    <div class="flex-1">
      <VbenInput
        id="code"
        name="code"
        type="text"
        autocomplete="off"
        required
        v-model="modelValue"
        :class="$attrs?.class ?? {}"
        :label="label"
        :placeholder="placeholder"
      />
    </div>
    <div class="captcha-image--container relative">
      <img
        :src="captcha"
        class="h-[40px] w-[115px] cursor-pointer rounded-r-md"
        :class="{ 'pointer-events-none': loading }"
        @click="$emit('captchaClick')"
      />
      <div
        v-if="loading"
        class="absolute inset-0 flex cursor-not-allowed items-center justify-center rounded-r-md bg-black/30"
      >
        <span class="captcha-loading"></span>
      </div>
      <div v-if="expired" class="overlay" @click="onRefreshClick">
        <p>已过期，请刷新</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@keyframes loading-rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.captcha-loading {
  box-sizing: border-box;
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: loading-rotation 1s linear infinite;
}

/**
  验证码输入框样式
  去除右边的圆角
*/
input[id='code'] {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: rgb(51 51 51 / 80%);
}

.overlay p {
  font-size: 12px;
  color: white;
}
</style>

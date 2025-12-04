<script setup lang="ts">
import { computed, ref } from 'vue';
import { VueCropper } from 'vue-cropper';
import 'vue-cropper/dist/index.css';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

// 定义emits
const emits = defineEmits(['cropSuccess']);

const options = ref({
  img: '',
  autoCrop: true,
  autoCropWidth: 160,
  autoCropHeight: 160,
  fixedBox: true,
  fixed: true,
  fixedNumber: [1, 1],
  full: false,
  centerBox: true,
  canMove: true,
  outputSize: 1,
  outputType: 'png',
  original: false,
});

const visible = ref(false);
const img = computed(() => options.value.img);
// 打开裁剪框
const onBeforeUpload = (file: File) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.addEventListener('load', () => {
    options.value.img = reader.result as string;
    visible.value = true;
  });
  // 处理读取失败的情况
  reader.addEventListener('error', () => {
    console.error('图片读取失败');
    reset();
  });
};

// 预览数据：明确类型定义
const previews = ref({
  url: '',
  div: {},
  img: {},
  html: '',
  w: 0,
  h: 0,
});
const previewStyle = ref<any>({});

const cropperRef = ref<VueCropper>();

// 实时预览
// 实时预览：仅更新尺寸信息，不处理 URL（URL 在确认时生成）
const handleRealTime = (data: {
  div: string;
  h: number;
  html: string;
  img: any;
  url: string;
  w: number;
}) => {
  previewStyle.value = {
    width: `${data.w}px`,
    height: `${data.h}px`,
    overflow: 'hidden',
    margin: '0 auto',
    zoom: 100 / data.h,
    borderRadius: '50%',
    border: '1px solid #ccc',
  };
  // 修复缩放逻辑：基于容器尺寸和裁剪尺寸计算缩放比例
  const scale = Math.min(
    // Number(previewStyle.value.width.replace('px', '')) / data.img.width,
    // Number(previewStyle.value.height.replace('px', '')) / data.img.height
    Number(previewStyle.value.width.replace('px', '')) / data.w,
    Number(previewStyle.value.height.replace('px', '')) / data.h,
  );
  previewStyle.value.zoom = scale;

  // const imgScale = data.img.transform.match(/scale\(([^)]+)\)/);
  // const imgTranslate3d = data.img.transform.match(/translate3d\(([^)]+)\)/);
  // const imgRotateZ = data.img.transform.match(/rotateZ\(([^)]+)\)/);
  // const xyz = imgTranslate3d ? imgTranslate3d[1].replaceAll('px', '').replaceAll(' ', '').split(',') : [0, 0, 0];
  previews.value = {
    ...previews.value,
    url: data.url,
    w: data.w,
    h: data.h,
    img: data.img,
    div: {
      width: `${data.img.width}`,
      height: `${data.img.height}`,
    },
    html: data.html,
  };
};

// 重置
const reset = () => {
  options.value.img = '';
  visible.value = false;
};

const [VerifyModel, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: true,
  showConfirmButton: true,
  bordered: true,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData();
      if (data) {
        onBeforeUpload(data as File);
      }
    }
  },
  onConfirm: async () => {
    // 修复：通过 cropperRef 实例获取裁剪结果
    if (!cropperRef.value) return;
    cropperRef.value.getCropBlob((data: any) => {
      // 发送有效结果
      emits('cropSuccess', data);
    });
  },
});

// 弹窗标题
const getWindowTitle = computed(() => {
  return `${$t('pages.common.edit')}${$t('system.user.avatar')}`;
});
</script>

<template>
  <VerifyModel :title="getWindowTitle">
    <div class="border">
      <ElRow>
        <ElCol
          v-if="visible"
          :span="14"
          style="width: 200px; height: 200px"
          class="border border-blue-500"
        >
          <VueCropper
            ref="cropperRef"
            :img="img"
            :info="true"
            :auto-crop="options.autoCrop"
            :auto-crop-width="options.autoCropWidth"
            :auto-crop-height="options.autoCropHeight"
            :fixed-box="options.fixedBox"
            :fixed="options.fixed"
            :full="options.full"
            :center-box="options.centerBox"
            :can-move="options.canMove"
            :output-type="options.outputType"
            :output-size="options.outputSize"
            @real-time="handleRealTime"
            class="h-full w-full"
          />
        </ElCol>
        <ElCol :span="10" class="flex flex-col items-center justify-center">
          <div class="mb-2 text-center">预览区域</div>
          <!-- 只有预览数据存在时才渲染预览图 -->
          <div v-if="previews.url" :style="previewStyle">
            <div :style="previews.div">
              <img :src="previews.url" :style="previews.img" alt="裁剪预览" />
            </div>
          </div>
          <div
            v-else
            class="flex h-40 w-40 items-center justify-center border border-dashed text-gray-400"
          >
            暂无预览
          </div>
        </ElCol>
      </ElRow>
    </div>
  </VerifyModel>
</template>
<style lang="scss" scoped></style>

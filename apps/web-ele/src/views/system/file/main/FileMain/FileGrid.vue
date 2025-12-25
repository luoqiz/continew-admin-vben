<script setup lang="ts">
import type { FileItem } from '#/api/system';

import { defineAsyncComponent } from 'vue';

import FileRightMenu from './FileRightMenu.vue';

const props = withDefaults(defineProps<Props>(), {
  data: () => [], // 文件数据
  selectedFileIds: () => [], // 批量模式下选中的文件id数组
  isBatchMode: false, // 是否是批量模式
});

const emit = defineEmits<{
  (e: 'click', record: FileItem): void;
  (e: 'dblclick', record: FileItem): void;
  (e: 'select', record: FileItem): void;
  (e: 'right-menu-click', mode: string, item: FileItem): void;
}>();

const FileImage = defineAsyncComponent(
  () => import('../../components/FileImage.vue'),
);

interface Props {
  data?: FileItem[];
  selectedFileIds?: string[];
  isBatchMode?: boolean;
}

// 点击事件
const handleClickFile = (item: FileItem) => {
  emit('click', item);
};

// 双击事件
const handleDblclickFile = (item: FileItem) => {
  emit('dblclick', item);
};

// 选中事件
const handleCheckFile = (item: FileItem) => {
  emit('select', item);
};

// 右键菜单点击事件
const handleRightMenuClick = (mode: string, item: FileItem) => {
  // eslint-disable-next-line vue/custom-event-name-casing
  emit('right-menu-click', mode, item);
};
</script>

<template>
  <div class="file-grid">
    <el-row :gutter="12">
      <el-col
        v-for="item in data"
        :key="item.id"
        :xs="4"
        :sm="4"
        :md="3"
        :lg="3"
        :xl="2"
        :xxl="2"
      >
        <FileRightMenu :data="item" @click="handleRightMenuClick($event, item)">
          <div
            class="file-grid-item"
            @click.stop="handleClickFile(item)"
            @dblclick="handleDblclickFile(item)"
          >
            <section class="file-grid-item__wrapper">
              <div class="file-icon">
                <FileImage :data="item" :title="item.originalName" />
              </div>
              <p class="gi_line_1 file-name">{{ item.originalName }}</p>
            </section>
            <!-- 勾选模式 -->
            <section
              v-show="props.isBatchMode"
              class="check-mode"
              :class="{ checked: props.selectedFileIds.includes(item.id) }"
              @click.stop="handleCheckFile(item)"
            >
              <el-checkbox
                class="checkbox"
                :model-value="props.selectedFileIds.includes(item.id)"
              />
            </section>
          </div>
        </FileRightMenu>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.file-grid {
  flex: 1;
  margin-top: 12px;
  // overflow: scroll;
  background: var(--color-bg-2);
}

.file-grid-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100px;
  cursor: pointer;

  &:hover {
    background: var(--color-primary-light-1);
  }

  &:active {
    svg,
    img {
      transform: scale(0.9);
    }
  }

  .check-mode {
    position: absolute;
    inset: 0;
    z-index: 9;
    background: rgb(0 0 0 / 10%);

    &.checked {
      background: none;
    }

    .checkbox {
      position: absolute;
      top: 5px;
      left: 5px;
      padding-left: 0;
    }
  }

  &__wrapper {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 76%;
    max-width: 100px;
    height: 100%;
    overflow: hidden;

    .file-icon {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 60px;
      overflow: hidden;

      > img {
        width: auto;
        height: 100%;
        transition: all 0.3s;
      }

      > svg {
        height: 100%;
        transition: all 0.3s;
      }
    }

    .file-name {
      box-sizing: border-box;
      width: 100%;
      padding: 0 5px;
      margin-top: 8px;
      font-size: 12px;
      text-align: center;
    }
  }
}
</style>

<script lang="ts" setup>
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { FileTask } from '#/hooks/modules/useMultipartUploader';

import { h, ref, resolveComponent, watch } from 'vue';

import {
  SvgCloseIcon,
  SvgDeleteIcon,
  SvgPauseIcon,
  SvgPlayArrowIcon,
  SvgRefreshIcon,
} from '@vben/icons';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { useMultipartUploader } from '#/hooks/modules/useMultipartUploader';
import {
  getFilesFromDataTransferItems,
  isFileSystemAccessAPISupported,
} from '#/utils/drag-drop-file-util';

// 组件props定义
const props = defineProps<{
  extraParams?: Record<string, any>;
  maxConcurrentChunks?: number;
  maxConcurrentFiles?: number;
  maxUploadWorkers?: number;
  rootPath?: string;
}>();
// 文件/文件夹选择input引用
const fileInput = ref<HTMLInputElement | null>(null);
const folderInput = ref<HTMLInputElement | null>(null);
// 拖拽高亮状态
const isDragOver = ref(false);
const pagination = {
  pageSize: 10,
  showTotal: true,
  showJumper: true,
  position: ['bottomCenter'],
};

// 文件大小格式化工具
function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
}

// 使用 useMultipartUploader composable
const {
  fileTasks,
  // uploadingCount: _uploadingCount,
  // maxConcurrent: _maxConcurrent,
  // maxChunkConcurrent: _maxChunkConcurrent,
  startAllUpload,
  addFiles,
  pauseTask,
  resumeTask,
  cancelTask,
  startTask,
  retryTask,
  clearAllTasks,
  removeTask,
  // formatFileSize: _formatFileSize,
  md5CalculatingTaskUid,
} = useMultipartUploader({
  maxConcurrentFiles: props.maxConcurrentFiles,
  maxConcurrentChunks: props.maxConcurrentChunks,
  maxUploadWorkers: props.maxUploadWorkers,
  rootPath: props.rootPath,
});

// 触发文件选择
function triggerFileInput() {
  fileInput.value?.click();
}
// 触发文件夹选择
function triggerFolderInput() {
  folderInput.value?.click();
}
// 文件选择事件处理
function onFileChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  // 移除 clearAllTasks()，改为追加模式
  // 普通文件上传路径 = rootPath
  addFiles([...files], props.rootPath || '', false);
  // 不要自动 startAllUpload()
  (e.target as HTMLInputElement).value = '';
}
// 文件夹选择事件处理
function onFolderChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;
  // 移除 clearAllTasks()，改为追加模式
  // 带目录文件上传路径 = rootPath
  // 文件夹上传时，webkitRelativePath会自动包含文件夹路径
  addFiles([...files], props.rootPath || '', true);
  // 不要自动 startAllUpload()
  (e.target as HTMLInputElement).value = '';
}
// 拖拽进入区域
function onDragOver(_e: DragEvent) {
  isDragOver.value = true;
}
// 拖拽离开区域
function onDragLeave(_e: DragEvent) {
  isDragOver.value = false;
}
// 拖拽释放文件/文件夹
async function onDrop(e: DragEvent) {
  isDragOver.value = false;
  e.preventDefault();

  let files: File[];
  if (isFileSystemAccessAPISupported()) {
    files = await getFilesFromDataTransferItems(e.dataTransfer!.items);
    addFiles(files, props.rootPath || '', true);
  } else {
    files = [...(e.dataTransfer?.files || [])];
    // 验证文件的有效性
    const validFiles = files.filter((file) => {
      return !(!file || file.size === 0);
    });
    if (validFiles.length === 0) {
      return;
    }
    // 检查是否有文件夹结构
    const hasFolder = validFiles.some((f) => {
      if ((f as any).webkitRelativePath) {
        return true;
      }
      return f.name.includes('/') || f.name.includes('\\');
    });
    addFiles(validFiles, props.rootPath || '', hasFolder);
  }
}
// 状态文本映射
function statusText(status: string) {
  switch (status) {
    case 'cancelled': {
      return '已取消';
    }
    case 'completed': {
      return '已完成';
    }
    case 'failed': {
      return '失败';
    }
    case 'paused': {
      return '已暂停';
    }
    case 'uploading': {
      return '上传中';
    }
    case 'waiting': {
      return '等待中';
    }
    default: {
      return status;
    }
  }
}
// 状态颜色映射
function statusColor(status: string) {
  switch (status) {
    case 'cancelled': {
      return '#C0C4CC';
    }
    case 'completed': {
      return '#67C23A';
    }
    case 'failed': {
      return '#F56C6C';
    }
    case 'paused': {
      return '#E6A23C';
    }
    case 'uploading': {
      return '#409EFF';
    }
    case 'waiting': {
      return '#909399';
    }
    default: {
      return '#909399';
    }
  }
}

// 表格列定义
const useFileColumns = () => {
  return [
    {
      field: 'fileName',
      title: '名称',
      minwidth: 280,
      slots: { default: 'fileName' },
      showOverflow: true,
    },
    {
      title: '文件目录',
      field: 'relativePath',
      // slots: { default: 'relativePath' },
      showOverflow: true,
      render: ({ record }) => {
        // 显示完整路径
        const displayPath = record.parentPath;

        // 确保路径格式正确
        if (record.relativePath && record.relativePath !== '/') {
          // 对于文件夹上传，relativePath格式为：folderName/file.txt
          // 我们只需要显示parentPath，因为它已经包含了正确的路径
          const pathParts = record.relativePath.split('/');
          if (pathParts.length > 1) {
            // 如果是文件夹内的文件，只显示parentPath
            // parentPath已经是/test/upload这样的格式
          }
        }

        return h(
          resolveComponent('el-tooltip'),
          { content: displayPath, placement: 'top' },
          () => h('span', displayPath),
        );
      },
    },
    {
      title: '文件类型',
      field: 'fileType',
      slots: { default: 'fileType' },
      showOverflow: true,
    },
    {
      title: '文件大小',
      field: 'fileSize',
      slots: { default: 'fileSize' },
      showOverflow: true,
      width: 120,
    },
    { title: '进度', slots: { default: 'progress' }, width: 140 },
    { title: '状态', slots: { default: 'status' }, width: 80 },
    { title: '操作', slots: { default: 'actions' }, width: 150 },
  ];
};

const [GridTable, gridTableApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useFileColumns(),
    data: [],
    border: true,
    height: 'auto',
    keepSource: true,
    pagerConfig: {
      enabled: false,
    },
    columnConfig: {
      resizable: true,
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    checkboxConfig: {
      highlight: true,
    },
  } as VxeTableGridOptions<FileTask>,
});

watch(
  () => fileTasks.value,
  async (newVal) => {
    await gridTableApi.grid.loadData(newVal || []);
  },
  { immediate: true, deep: true },
);
</script>

<template>
  <el-row :gutter="16" class="multipart-uploader-responsive-row">
    <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
      <div
        class="multipart-uploader-table-flex"
        :class="{ dragover: isDragOver }"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <!-- 文件/文件夹选择和全局操作按钮 -->
        <div class="upload-select-area-flex">
          <div class="upload-btns-left">
            <el-button @click="triggerFileInput">选择文件</el-button>
            <el-button style="margin-left: 8px" @click="triggerFolderInput">
              选择文件夹
            </el-button>
            <input
              ref="fileInput"
              type="file"
              multiple
              style="display: none"
              @change="onFileChange"
            />
            <input
              ref="folderInput"
              type="file"
              webkitdirectory
              directory
              style="display: none"
              @change="onFolderChange"
            />
          </div>
          <div class="upload-btns-right">
            <el-button type="primary" @click="startAllUpload">
              开始上传
            </el-button>
            <el-button
              style="margin-left: 8px"
              status="danger"
              @click="clearAllTasks"
            >
              清空
            </el-button>
          </div>
        </div>
        <div style="margin-bottom: 8px; font-size: 13px; color: #888">
          支持拖拽文件到此区域上传（文件夹请使用"选择文件夹"按钮）
          <br />
          <small style="color: #999">
            提示：拖拽上传时，所有文件将上传到根目录
          </small>
        </div>
        <!-- 表格区域 -->
        <div class="gi-table-flex-body">
          <div class="gi-table-flex-container">
            <GridTable
              row-key="uid"
              :pagination="pagination"
              style="height: 100%; background: transparent"
            >
              <template #fileName="{ row: record }">
                <el-tooltip :content="record.fileName">
                  <span>
                    {{ record.fileName }}
                  </span>
                </el-tooltip>
              </template>
              <template #fileType="{ row: record }">
                <el-tooltip :content="record.fileType">
                  <span>
                    {{ record.fileType }}
                  </span>
                </el-tooltip>
              </template>
              <template #fileSize="{ row: record }">
                {{ formatFileSize(record.fileSize) }}
              </template>
              <template #progress="{ row: record }">
                <div class="item-center">
                  <template v-if="md5CalculatingTaskUid === record.uid">
                    <span style="color: #888">正在计算MD5...</span>
                  </template>
                  <template v-else>
                    <el-progress
                      :percentage="record.progress * 100"
                      stroke-width="10"
                      :status="record.progress * 100 === 100 ? 'success' : ''"
                    />
                  </template>
                </div>
              </template>
              <template #status="{ row: record }">
                <div>
                  <el-tag
                    :color="statusColor(record.status)"
                    size="small"
                    effect="dark"
                  >
                    {{ statusText(record.status) }}
                  </el-tag>
                  <div
                    v-if="record.status === 'failed' && record.errorMessage"
                    style="margin-top: 4px; font-size: 12px; color: #f56c6c"
                  >
                    {{ record.errorMessage }}
                  </div>
                </div>
              </template>
              <template #actions="{ row: record }">
                <el-space>
                  <el-tooltip v-if="record.status === 'waiting'" content="开始">
                    <el-button link @click="startTask(record)">
                      <SvgPlayArrowIcon />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip
                    v-if="record.status === 'uploading'"
                    content="暂停"
                  >
                    <el-button link @click="pauseTask(record)">
                      <SvgPauseIcon />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip v-if="record.status === 'paused'" content="继续">
                    <el-button link @click="resumeTask(record)">
                      <SvgPlayArrowIcon />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip v-if="record.status === 'failed'" content="重试">
                    <el-button link type="primary" @click="retryTask(record)">
                      <SvgRefreshIcon />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="取消">
                    <el-button
                      v-if="
                        record.status !== 'completed' &&
                        record.status !== 'cancelled'
                      "
                      link
                      type="warning"
                      @click="cancelTask(record)"
                    >
                      <SvgCloseIcon />
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="删除">
                    <el-button type="danger" link @click="removeTask(record)">
                      <SvgDeleteIcon />
                    </el-button>
                  </el-tooltip>
                </el-space>
              </template>
            </GridTable>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.multipart-uploader-table-flex {
  display: flex;
  flex-direction: column;
  min-width: 1000px;
  max-width: 1200px;
  height: 700px;
  padding: 24px;
  margin: 0 auto;
  border: 2px dashed #e5e6eb;
  border-radius: 8px;
  box-shadow: 0 2px 8px #0000000d;
  transition:
    border-color 0.2s,
    background 0.2s;
}

.multipart-uploader-table-flex.dragover {
  border: 2px dashed #409eff;
}

.upload-select-area-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.upload-btns-left {
  display: flex;
  align-items: center;
}

.upload-btns-right {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.upload-select-area {
  margin-bottom: 16px;
}

.gi-table-flex-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 400px;
  padding: 8px 0 0;
  border-radius: 8px;
  box-shadow: 0 1px 4px #0001;
}

.gi-table-flex-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  min-height: 400px;
  background: transparent;
}

.multipart-uploader-responsive-row {
  width: 100%;
  margin: 0;
}

@media (max-width: 1200px) {
  .multipart-uploader-table-flex {
    min-width: 100%;
    max-width: 100%;
    padding: 12px;
  }
}

@media (max-width: 900px) {
  .multipart-uploader-table-flex {
    min-width: 100%;
    max-width: 100%;
    padding: 6px;
  }

  .gi-table-flex-body {
    height: 300px;
    min-height: 200px;
    padding: 0;
  }
}

@media (max-width: 600px) {
  .multipart-uploader-table-flex {
    min-width: 100vw;
    max-width: 100vw;
    padding: 2px;
    border-radius: 0;
  }

  .gi-table-flex-body {
    height: 180px;
    min-height: 120px;
    padding: 0;
  }

  .upload-select-area-flex {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }

  .upload-btns-right {
    margin-left: 0;
  }
}
</style>

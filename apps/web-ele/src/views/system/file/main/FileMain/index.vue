<script setup lang="ts">
import type { UploadRequestOptions } from 'element-plus';

import type { FileItem, FileQuery } from '#/api/system/file';
import type { ExcelConfig } from '#/components/FilePreview/type';

import { computed, defineAsyncComponent, onMounted, reactive, ref } from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

import {
  SvgAppsIcon,
  SvgDeleteIcon,
  SvgFolderIcon,
  SvgListIcon,
  SvgSearchIcon,
  SvgSelectAllIcon,
  SvgUploadIcon,
} from '@vben/icons';

import { useWindowSize } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import { api as viewerApi } from 'v-viewer';

import { createDir, deleteFile, listFile, uploadFile } from '#/api/system/file';
import MultipartUpload from '#/components/MultipartUpload/index.vue';
import { ImageTypes, OfficeTypes } from '#/constant/file';
import { useTable } from '#/hooks/modules/useTable';
import { downloadByUrl } from '#/utils/downloadFile';
import mittBus from '#/utils/mitt';

import { openNewDirModal } from '../../components/FileNewModal';
import {
  openFileDetailModal,
  openFileRenameModal,
  previewFileAudioModal,
  previewFileVideoModal,
} from '../../components/index';
import FileGrid from './FileGrid.vue';
// import RecycleBinModal from './RecycleBinModal.vue';
import useFileManage from './useFileManage';

import 'viewerjs/dist/viewer.css';

// const FilePreview = defineAsyncComponent(
//   () => import('#/components/FilePreview/index.vue'),
// );

const FileList = defineAsyncComponent(() => import('./FileList.vue'));
const route = useRoute();
const { mode, selectedFileIds, toggleMode, addSelectedFileItem } =
  useFileManage();
const { width } = useWindowSize();
const queryForm = reactive<FileQuery>({
  originalName: undefined,
  parentPath:
    !route.query.type || route.query.type?.toString() === '0' ? '/' : undefined,
  type:
    route.query.type?.toString() && route.query.type?.toString() !== '0'
      ? route.query.type?.toString()
      : undefined,
  sort: ['type,asc', 'updateTime,desc'],
});

const paginationOption = reactive({
  defaultPageSize: 30,
  defaultSizeOptions: [30, 40, 50, 100, 120],
});
const isBatchMode = ref(false);
const {
  tableData: fileList,
  loading,
  pagination,
  search,
} = useTable((page) => listFile({ ...queryForm, ...page }), {
  immediate: false,
  paginationOption,
});
const filePreviewRef = ref();

const pathNameMap = ref<Map<string, string>>(new Map());

// 点击文件
const handleClickFile = (item: FileItem) => {
  if (ImageTypes.includes(item.extension) && item.url) {
    const imgList: string[] = fileList.value
      .filter((i) => ImageTypes.includes(i.extension))
      .map((a) => a.url || '');
    const index = imgList.indexOf(item.url);
    if (imgList.length > 0) {
      viewerApi({
        options: {
          initialViewIndex: index,
        },
        images: imgList,
      });
    }
  }
  if (OfficeTypes.includes(item.extension)) {
    const excelConfig: ExcelConfig = {
      xls: item.extension === 'xls',
      minColLength: 0,
      minRowLength: 0,
      widthOffset: 10,
      heightOffset: 10,
      beforeTransformData: (workbookData) => {
        return workbookData;
      },
      transformData: (workbookData) => {
        return workbookData;
      },
    };
    filePreviewRef.value.onPreview({
      fileInfo: {
        data: item.url,
        fileName: item.originalName,
        fileType: item.extension,
      },
      excelConfig,
    });
  }
  if (item.extension === 'mp4') {
    previewFileVideoModal(item);
  }
  if (item.extension === 'mp3') {
    previewFileAudioModal(item);
  }
};

// 双击文件
const handleDblclickFile = (item: FileItem) => {
  if (item.type === 0) {
    const path = `${item.parentPath === '/' ? '' : item.parentPath}/${item.name}`;
    pathNameMap.value.set(path, item.originalName);
    queryForm.parentPath = path;
    search();
  }
};

// 下载文件
const onDownload = async (fileInfo: FileItem) => {
  const res = await downloadByUrl({
    url: fileInfo.url,
    target: '_self',
    fileName: fileInfo.originalName,
  });
  res ? ElMessage.success('下载成功') : ElMessage.error('下载失败');
  search();
};

// 右键菜单
const handleRightMenuClick = async (mode: string, fileInfo: FileItem) => {
  switch (mode) {
    case 'delete': {
      ElMessageBox.confirm(
        `是否确定删除${fileInfo.type === 0 ? '文件夹' : '文件'}「${fileInfo.originalName}」？`,
        '提示',
        {
          confirmButtonClass: 'el-button--danger',
          confirmButtonText: 'OK',
          cancelButtonText: 'Cancel',
          type: 'warning',
        },
      )
        .then(async () => {
          await deleteFile([fileInfo.id]);
          ElMessage.success('删除成功');
          search();
          mittBus.emit('file-total-refresh');
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: 'Delete canceled',
          });
        });
      break;
    }
    case 'detail': {
      openFileDetailModal(fileInfo);
      break;
    }
    case 'download': {
      await onDownload(fileInfo);
      break;
    }
    case 'rename': {
      openFileRenameModal(fileInfo, search);
      break;
    }
    // No default
  }
};

// 勾选文件
const handleSelectFile = (item: FileItem) => {
  addSelectedFileItem(item);
};

// 批量删除
const handleMulDelete = () => {
  ElMessageBox.confirm(
    `是否确定删除所选的${selectedFileIds.value.length}个文件？`,
    '提示',
    {
      confirmButtonClass: 'el-button--danger',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    },
  )
    .then(async () => {
      await deleteFile(selectedFileIds.value);
      ElMessage.success('删除成功');
      search();
      mittBus.emit('file-total-refresh');
      isBatchMode.value = false;
    })
    .catch(() => {});
};

// 普通上传
const handleUpload = (options: UploadRequestOptions) => {
  const controller = new AbortController();
  (async function requestWrap() {
    const { file, onSuccess } = options;
    const formData = new FormData();
    formData.append('parentPath', queryForm.parentPath ?? '/');
    formData.append('file', file);
    try {
      const res = await uploadFile(formData);
      ElMessage.success('上传成功');
      onSuccess(res);
      search();
    } catch {
      ElMessage.error('上传失败');
    } finally {
      mittBus.emit('file-total-refresh');
    }
  })();
  return {
    abort() {
      controller.abort();
    },
  };
};
const visible = ref(false);

onBeforeRouteUpdate((to) => {
  if (!to.query.type) return;
  if (to.query.type === '0' || !to.query.type) {
    queryForm.type = undefined;
    queryForm.parentPath = '/';
  } else {
    queryForm.type = to.query.type?.toString();
    queryForm.parentPath = undefined;
  }
  search();
});

// 新建文件夹弹窗窗口确认事件
const handleCreateDir = async (newDirName: string) => {
  await createDir(queryForm.parentPath ?? '/', newDirName);
  search();
};

// 解析路径生成面包屑列表
const breadcrumbList = computed(() => {
  const path = queryForm.parentPath || '/';
  if (path === '/') {
    return [];
  }
  const parts = path.split('/').filter((p) => p !== '');

  return parts.map((part, index) => {
    const fullPath = `/${parts.slice(0, index + 1).join('/')}`;
    let displayName = pathNameMap.value.get(fullPath);

    if (!displayName) {
      const foundItem = fileList.value.find((item) => {
        const itemPath = `${item.parentPath === '/' ? '' : item.parentPath}/${item.name}`;
        return itemPath === fullPath && item.type === 0;
      });

      if (foundItem) {
        displayName = foundItem.originalName;
        pathNameMap.value.set(fullPath, displayName);
      }
    }

    if (!displayName) {
      displayName = part;
    }

    return { name: displayName, path: fullPath };
  });
});

// 处理面包屑点击
const handleBreadcrumbClick = (item) => {
  queryForm.parentPath = item.path;
  search();
};

// 回收站
// const RecycleBinModalRef = ref<InstanceType<typeof RecycleBinModal>>();
const onRecycleBin = () => {
  // RecycleBinModalRef.value?.onOpen();
};

onMounted(() => {
  search();
});
</script>

<template>
  <div class="file-main">
    <!-- 目录导航面包屑 -->
    <el-breadcrumb class="file-main__breadcrumb">
      <el-breadcrumb-item
        v-if="queryForm.parentPath"
        @click="handleBreadcrumbClick({ name: '根目录', path: '/' })"
      >
        根目录
      </el-breadcrumb-item>
      <el-breadcrumb-item v-else>全部</el-breadcrumb-item>
      <el-breadcrumb-item
        v-for="(item, index) in breadcrumbList"
        :key="index"
        @click="handleBreadcrumbClick(item)"
      >
        {{ item.name || '根目录' }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <el-row justify="space-between" class="file-main__search">
      <!-- 左侧区域 -->
      <el-space wrap>
        <!-- 上传文件按钮改为下拉菜单，包含普通上传和分片上传 -->
        <el-dropdown trigger="click">
          <el-button type="primary" shape="round">
            <SvgUploadIcon
              style="width: 16px; height: 16px; margin-right: 4px"
            />
            上传文件
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item index="1">
                <!-- 普通上传-->
                <el-upload
                  :show-file-list="false"
                  :http-request="handleUpload"
                  v-access:code="['system:file:upload']"
                  action=""
                  class="flex w-full items-center justify-center"
                >
                  <el-button link> 普通上传 </el-button>
                </el-upload>
              </el-dropdown-item>
              <el-dropdown-item index="2">
                <!-- 分片上传 -->
                <el-button
                  link
                  style="width: 100%; text-align: left"
                  @click="visible = !visible"
                  v-access:code="['system:file:multipartUpload']"
                >
                  分片上传
                </el-button>
              </el-dropdown-item>

              <el-dropdown-item index="3">
                <el-divider style="margin: 0" />
              </el-dropdown-item>

              <el-dropdown-item disabled index="4">
                <!-- 新建文件夹 -->
                <el-button
                  v-access:code="['system:file:createDir']"
                  link
                  style="width: 100%; text-align: left"
                  :disabled="!queryForm.parentPath"
                  @click="openNewDirModal(handleCreateDir)"
                >
                  <template #icon>
                    <SvgFolderIcon />
                  </template>
                  新建文件夹
                </el-button>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <div>
          <el-input
            v-model="queryForm.originalName"
            :placeholder="
              queryForm.type && queryForm.type !== '0'
                ? '请输入名称'
                : '在当前目录下搜索名称'
            "
            allow-clear
            style="width: 200px"
          />
          <el-button type="primary" @click="search">
            <template #icon>
              <SvgSearchIcon />
            </template>
            <template #default>查询</template>
          </el-button>
        </div>
      </el-space>

      <!-- 右侧区域 -->
      <el-space wrap>
        <el-button
          v-if="isBatchMode"
          :disabled="selectedFileIds.length === 0"
          type="primary"
          status="danger"
          @click="handleMulDelete"
        >
          <template #icon>
            <SvgDeleteIcon />
          </template>
        </el-button>

        <el-button
          v-access:code="['system:file:delete']"
          type="primary"
          @click="isBatchMode = !isBatchMode"
        >
          <template #icon>
            <SvgSelectAllIcon />
          </template>
          <template #default>
            {{ isBatchMode ? '取消批量' : '批量操作' }}
          </template>
        </el-button>
        <el-button
          v-access:code="['system:fileRecycle:list']"
          type="primary"
          @click="onRecycleBin"
        >
          <template #icon>
            <SvgDeleteIcon />
          </template>
          <template #default>回收站</template>
        </el-button>
        <el-button-group>
          <el-tooltip content="视图">
            <el-button @click="toggleMode">
              <template #icon>
                <SvgListIcon v-if="mode === 'grid'" />
                <SvgAppsIcon v-else />
              </template>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </el-space>
    </el-row>

    <div class="file-main__list" v-loading="loading">
      <!-- 文件列表-宫格模式 -->
      <FileGrid
        v-show="fileList.length > 0 && mode === 'grid'"
        :data="fileList"
        :is-batch-mode="isBatchMode"
        :selected-file-ids="selectedFileIds"
        @click="handleClickFile"
        @select="handleSelectFile"
        @right-menu-click="handleRightMenuClick"
        @dblclick="handleDblclickFile"
      />

      <!-- 文件列表-列表模式 -->
      <FileList
        v-show="fileList.length > 0 && mode === 'list'"
        :data="fileList"
        :is-batch-mode="isBatchMode"
        :selected-file-ids="selectedFileIds"
        @click="handleClickFile"
        @select="handleSelectFile"
        @right-menu-click="handleRightMenuClick"
        @dblclick="handleDblclickFile"
      />
      <!-- 文件列表为空时显示 -->
      <el-empty v-if="fileList.length === 0" />
    </div>
    <!-- <FilePreview ref="filePreviewRef" /> -->
    <div class="pagination">
      <div>
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="pagination.pageSizeOptions"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </div>

    <el-dialog
      v-model="visible"
      title="分片上传"
      :width="width > 1350 ? 1350 : '100%'"
      top="8vh"
      :footer="false"
      @close="search"
    >
      <MultipartUpload
        v-if="visible"
        :root-path="queryForm.parentPath"
        :chunk-size="5 * 1024 * 1024"
        :max-concurrent-files="3"
      />
    </el-dialog>

    <!-- 回收站 -->
    <!-- <RecycleBinModal ref="RecycleBinModalRef" @close="" /> -->
  </div>
</template>

<style scoped lang="scss">
.file-main {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: #fff;
  // background: var(--color-bg-1);
  // border-radius: $radius-box;
  border-radius: 8px;
}

.file-main__search {
  margin: 16px 16px 0;
}

.file-main__breadcrumb {
  padding: 16px;
  font-size: 14px;
  color: var(--color-text-2);
  background: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border-3);
  border-radius: 4px;
}

.file-main__list {
  box-sizing: border-box;
  flex: 1;
  padding: 0 16px 16px;
  overflow: hidden;
  overflow-y: auto;
}

.pagination {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  padding: 0 var(--padding) var(--padding);
}
</style>

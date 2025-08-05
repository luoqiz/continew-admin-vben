<script setup lang="ts">
import type { TreeNodeData } from 'element-plus';

import type { GeneratePreviewResp } from '#/api/code/generator';

import { computed, ref, watch } from 'vue';

import {
  CnCodeView,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  useVbenModal,
} from '@vben/common-ui';
import {
  SvgCopyIcon,
  SvgDirectoryBlueIcon,
  SvgFileJavaIcon,
  SvgFileJavascriptIcon,
  SvgFileJsonIcon,
  SvgFileMavenIcon,
  SvgFileSqlIcon,
  SvgFileTypescriptIcon,
  SvgFileVueIcon,
  SvgFileXmlIcon,
} from '@vben/icons';

import { useClipboard } from '@vueuse/core';
import {
  ElAutoResizer,
  ElCard,
  ElIcon,
  ElLink,
  ElMessage,
  ElScrollbar,
  ElTreeV2,
} from 'element-plus';

import { downloadCode, generateCode, genPreview } from '#/api/code/generator';

const { copy, copied } = useClipboard();

const genPreviewList = ref<GeneratePreviewResp[]>([]);
const currentPreview = ref<GeneratePreviewResp>();
const visible = ref(false);
const previewTableNames = ref<string[]>([]);

const treeData = ref<TreeNodeData[]>([]);
// 合并目录
const mergeDir = (parent: TreeNodeData) => {
  // 合并目录
  if (
    parent.children?.length === 1 &&
    typeof parent.children[0].key === 'number'
  ) {
    const mergeTitle = mergeDir(parent.children[0]);
    if (mergeTitle !== '') {
      parent.title = `${parent.title}/${mergeTitle}`;
    }
    parent.children = parent.children[0].children;
    return parent.title;
  }
  // 合并子目录
  if (parent?.children) {
    for (const child of parent.children) {
      mergeDir(child);
    }
  }
  return parent.title;
};

const pushDir = (
  children: TreeNodeData[] | undefined,
  treeNode: TreeNodeData,
) => {
  if (children) {
    for (const child of children) {
      if (child.title === treeNode.title) {
        return child.children;
      }
    }
  }
  children?.push(treeNode);
  return treeNode.children;
};

// 自增的一个key 因为key相同的节点会出现一些问题
let autoIncrementKey = 0;
// 将生成的目录组装成树结构
const assembleTree = (genPreview: GeneratePreviewResp) => {
  const separator = genPreview.path.includes('/') ? '/' : '\\';
  const paths: string[] = genPreview.path.split(separator);
  let tempChildren: TreeNodeData[] | undefined = treeData.value;
  for (const path of paths) {
    autoIncrementKey++;
    // 向treeData中推送目录,如果该级目录有那么不推送进行下级的合并
    tempChildren = pushDir(tempChildren, {
      title: path,
      key: `${autoIncrementKey}-0`,
      children: new Array<TreeNodeData>(),
    });
  }
  tempChildren?.push({
    title: genPreview.fileName,
    key: genPreview.fileName,
    children: new Array<TreeNodeData>(),
  });
};

// 下载
const onDownload = async () => {
  const tableNames = previewTableNames.value;
  const res: any = await downloadCode(tableNames);
  const contentDisposition = res.headers['content-disposition'];
  const pattern = /filename=([^;]+\.[^.;]+);*/;
  const result = pattern.exec(contentDisposition) || '';
  // 对名字进行解码
  const fileName = window.decodeURI(result[1]!);
  // 创建下载的链接
  const blob = new Blob([res.data]);
  const downloadElement = document.createElement('a');
  const href = window.URL.createObjectURL(blob);
  downloadElement.style.display = 'none';
  downloadElement.href = href;
  // 下载后文件名
  downloadElement.download = fileName;
  document.body.append(downloadElement);
  // 点击下载
  downloadElement.click();
  // 下载完成，移除元素
  downloadElement.remove();
  // 释放掉 blob 对象
  window.URL.revokeObjectURL(href);
};

// 生成
const onGenerator = async () => {
  const tableNames = previewTableNames.value;
  await generateCode(tableNames);
  ElMessage.success('代码生成成功');
};

// 校验文件类型
const checkFileType = (title: string, type: string) => {
  return title.endsWith(type);
};

// 复制
const onCopy = () => {
  if (currentPreview.value) {
    copy(currentPreview.value?.content);
  }
};
watch(copied, () => {
  if (copied.value) {
    ElMessage.success('复制成功');
  }
});

const selectedKeys = ref();
// 选择文件预览
const onSelectPreview = (data: TreeNodeData) => {
  currentPreview.value = genPreviewList.value.find(
    (p) => p.fileName === data.key,
  );
};

// 打开
const onOpen = async (tableNames: Array<string>) => {
  treeData.value = [];
  previewTableNames.value = tableNames;
  const data = await genPreview(tableNames);
  genPreviewList.value = data;
  for (const genPreview of genPreviewList.value) {
    assembleTree(genPreview);
  }
  for (const valueElement of treeData.value) {
    mergeDir(valueElement);
  }
  selectedKeys.value = [genPreviewList.value[0]!.fileName];
  currentPreview.value = genPreviewList.value[0];
  visible.value = true;
};

const [Modal, modalApi] = useVbenModal({
  centered: true,
  showCancelButton: false,
  showConfirmButton: false,
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<string[]>();
      if (data) {
        onOpen(data);
      }
    }
  },
});
const getTitle = computed(() => {
  return previewTableNames.value?.join(',');
});

const treeProps = {
  value: 'key',
  label: 'title',
  children: 'children',
};

// 获取所有节点key
const allNodeKeys = computed(() => {
  // 递归函数，收集所有节点的 key
  const allNodeKeys: any[] = [];
  const getAllNodeKeys = (nodes: TreeNodeData[]) => {
    nodes.forEach((node) => {
      allNodeKeys.push(node.key);
      if (node.children && node.children.length > 0) {
        getAllNodeKeys(node.children);
      }
    });
  };
  getAllNodeKeys(treeData.value);
  return allNodeKeys;
});
</script>

<template>
  <Modal class="h-[90%] w-[90%]" :title="getTitle">
    <template #title>
      <div style="display: flex; align-items: end; justify-content: center">
        {{
          previewTableNames.length === 1
            ? `生成 ${previewTableNames[0]} 表预览`
            : '批量生成预览'
        }}
        <ElLink
          v-access:code="['code:generator:generate']"
          style="margin-left: 10px"
          @click="onDownload"
        >
          下载源码
        </ElLink>
        <ElLink
          v-access:code="['code:generator:generate']"
          style="margin-left: 10px"
          @click="onGenerator"
        >
          生成源码
        </ElLink>
      </div>
    </template>
    <div class="preview-content">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel :default-size="35">
          <div
            :style="{ minWidth: '250px', height: '100%' }"
            class="border-border bg-card mr-2 rounded-[var(--radius)] border p-2"
          >
            <ElAutoResizer>
              <template #default="{ height }">
                <ElTreeV2
                  v-if="treeData.length > 0"
                  :data="treeData"
                  :props="treeProps"
                  @node-click="onSelectPreview"
                  highlight-current
                  :height="height"
                  :default-expanded-keys="allNodeKeys"
                >
                  <template #default="{ node }">
                    <ElIcon
                      class="node-icon"
                      :class="{ 'is-leaf': node.isLeaf }"
                    >
                      <SvgDirectoryBlueIcon v-if="!node.isLeaf" />
                      <SvgFileJavaIcon
                        v-if="node.isLeaf && checkFileType(node.label, '.java')"
                      />
                      <SvgFileVueIcon
                        v-if="node.isLeaf && checkFileType(node.label, '.vue')"
                        :size="16"
                      />
                      <SvgFileTypescriptIcon
                        v-if="node.isLeaf && checkFileType(node.label, '.ts')"
                        :size="16"
                        name="file-typescript"
                      />
                      <SvgFileJavascriptIcon
                        v-if="node.isLeaf && checkFileType(node.label, '.js')"
                        :size="16"
                        name="file-javascript"
                      />
                      <SvgFileJsonIcon
                        v-if="node.isLeaf && checkFileType(node.label, '.json')"
                      />
                      <SvgFileMavenIcon
                        v-if="
                          node.isLeaf && checkFileType(node.label, 'pom.xml')
                        "
                      />
                      <SvgFileXmlIcon
                        v-if="
                          node.isLeaf &&
                          checkFileType(node.label, '.xml') &&
                          !checkFileType(node.label, 'pom.xml')
                        "
                      />
                      <SvgFileSqlIcon
                        v-if="node.isLeaf && checkFileType(node.label, '.sql')"
                      />
                    </ElIcon>
                    <span>{{ node.label }}</span>
                  </template>
                </ElTreeV2>
              </template>
            </ElAutoResizer>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel :default-size="65">
          <ElCard style="height: 100%" body-style="height:90%">
            <template #header>
              <div class="card-header">
                <span>
                  {{ currentPreview?.path }}
                  {{ currentPreview?.path.indexOf('/') !== -1 ? '/' : '\\' }}
                  {{ currentPreview?.fileName }}
                </span>
              </div>
            </template>
            <ElAutoResizer>
              <template #default="{ height }">
                <ElScrollbar :height="height">
                  <ElLink
                    style="position: absolute; right: 20px; z-index: 999"
                    title="复制"
                    @click="onCopy"
                  >
                    <template #icon>
                      <SvgCopyIcon />
                    </template>
                    <template #default>复制</template>
                  </ElLink>
                  <CnCodeView
                    v-if="currentPreview"
                    :type="
                      'vue' === currentPreview?.fileName.split('.')[1]
                        ? 'vue'
                        : 'javascript'
                    "
                    :code-json="currentPreview!.content"
                  />
                </ElScrollbar>
              </template>
            </ElAutoResizer>
          </ElCard>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </Modal>
</template>

<style scoped lang="scss">
.preview-content {
  height: 100%;
}

.preview-content :deep(.grid-content) {
  min-width: 200px;
  height: 100%;
  white-space: nowrap;
}

.preview-content :deep(.cep-bg-purple) {
  min-width: 200px;
  height: 100%;
  white-space: nowrap;
}
</style>

<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { DictItemResp } from '#/api';
import type { JobResp } from '#/api/schedule';

import { onMounted, ref } from 'vue';

import { useAccess } from '@vben/access';
import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { parseCron } from '@vben/utils';

import {
  ElButton,
  ElLink,
  ElMessage,
  ElPopconfirm,
  ElPopover,
  ElSpace,
  ElSwitch,
  ElTimeline,
  ElTimelineItem,
} from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  deleteJob,
  listGroup,
  listJob,
  triggerJob,
  updateJobStatus,
} from '#/api/schedule';
import { DictTag } from '#/components/dict';
import { useDict } from '#/hooks';

import { useGridFieldColumns, useGridSearchFormSchema } from './dataScope';
import PackageEditDrawer from './EditDrawer.vue';

const {
  job_status_enum,
  job_trigger_type_enum,
  job_task_type_enum,
  job_route_strategy_enum,
  job_block_strategy_enum,
} = useDict(
  'job_status_enum',
  'job_trigger_type_enum',
  'job_task_type_enum',
  'job_route_strategy_enum',
  'job_block_strategy_enum',
);
const groupList = ref<{ label: string; value: string }[]>([]);
const { hasAccessByCodes } = useAccess();

// 查询任务组列表
const getGroupList = async () => {
  const data = await listGroup();
  groupList.value = data?.map((item: string) => ({
    label: item,
    value: item,
  }));
  tableGridApi.formApi.form.setValues({
    groupName: groupList.value.length > 0 ? groupList.value[0]!.label : '',
  });
  tableGridApi.query();
};

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridSearchFormSchema(groupList, job_status_enum),
    submitOnChange: true,
    showCollapseButton: false,
    wrapperClass: 'grid-cols-1 md:grid-cols-4 lg:grid-cols-4',
  },
  gridOptions: {
    columns: useGridFieldColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    columnConfig: {
      resizable: true,
    },
    proxyConfig: {
      autoLoad: false,
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listJob({
            page: page.currentPage,
            size: page.pageSize,
            ...formValues,
          });
          return res;
        },
      },
    },
    rowConfig: {
      keyField: 'id',
      isHover: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: true,
      refreshOptions: {
        code: 'query',
      },
      search: true,
      zoom: true,
      zoomOptions: {},
    },
  } as VxeTableGridOptions<JobResp>,
});

const [EditorWindow, editorApi] = useVbenModal({
  connectedComponent: PackageEditDrawer,
  destroyOnClose: true,
});

const handleEdit = (record: JobResp) => {
  editorApi.setData(record);
  editorApi.open();
};

const handleAdd = () => {
  editorApi.setData({
    triggerType: job_trigger_type_enum?.value[0]?.value,
    taskType: job_task_type_enum?.value[0]?.value,
    routeKey: job_route_strategy_enum?.value[0]?.value,
    blockStrategy: job_block_strategy_enum?.value[0]?.value,
  });
  editorApi.open();
};

const handleDelete = async (row: JobResp) => {
  try {
    await deleteJob(row.id);
    ElMessage.success($t('pages.common.deleteSuccess'));
    await tableGridApi.query();
    return true;
  } catch {
    return false;
  }
};

// 执行
const onTrigger = (record: JobResp) => {
  triggerJob(record.id).then(() => {
    ElMessage.success('执行请求已下发');
  });
};

// 修改状态
const onUpdateStatus = (record: JobResp) => {
  const msg = record.jobStatus === 1 ? '启用成功' : '禁用成功';
  updateJobStatus({ jobStatus: record.jobStatus }, record.id)
    .then(() => {
      ElMessage.success(msg);
    })
    .catch(() => {
      record.jobStatus = record.jobStatus === 1 ? 0 : 1;
    });
};

onMounted(() => {
  getGroupList();
});
</script>

<template>
  <Page auto-content-height>
    <TableGrid :table-title="$t('tenant.package.listTitle')">
      <template #toolbar-tools>
        <ElSpace>
          <span v-access:code="['tenant:package:create']">
            <ElButton type="primary" @click="handleAdd">
              {{ $t('pages.common.add') }}
            </ElButton>
          </span>
        </ElSpace>
      </template>
      <template #triggerType="{ row }">
        <div class="flex flex-row items-center justify-center">
          <DictTag
            :value="row.triggerType"
            :dict-list="(job_trigger_type_enum as DictItemResp[]) ?? []"
          />
          :&nbsp;
          <span v-if="row.triggerType === 2">{{ row.triggerInterval }} 秒</span>
          <span v-else>
            <ElPopover title="最近5次运行时间" position="bottom" width="225px">
              <template #reference>
                <ElLink type="primary">{{ row.triggerInterval }}</ElLink>
              </template>
              <ElTimeline style="max-width: 225px; margin-top: 20px">
                <ElTimelineItem
                  v-for="(item, index) in parseCron(row.triggerInterval).split(
                    '\n',
                  )"
                  :key="index"
                  :timestamp="item"
                />
              </ElTimeline>
            </ElPopover>
          </span>
        </div>
      </template>
      <template #taskType="{ row }">
        <div class="flex flex-row items-center justify-center gap-2">
          <span
            class="py-4px rounded-sm border-2 border-solid bg-blue-100 px-2"
          >
            <DictTag
              :value="row.taskType"
              :dict-list="(job_task_type_enum as DictItemResp[]) ?? []"
            />
          </span>
          <span>{{ row.executorInfo }}</span>
        </div>
      </template>
      <template #jobStatus="{ row }">
        <ElSwitch
          v-model="row.jobStatus"
          :active-value="1"
          :inactive-value="0"
          :disabled="!hasAccessByCodes(['tool:job:update'])"
          @change="onUpdateStatus(row)"
        />
      </template>
      <template #action="{ row }">
        <ElSpace>
          <span v-access:code="['schedule:job:trigger']">
            <ElPopconfirm
              :title="$t('ui.actionMessage.confirmExecute', [row.jobName])"
              icon-color="red"
              @confirm="onTrigger(row)"
              trigger="hover"
              width="200px"
            >
              <template #reference>
                <ElButton type="primary" link text>
                  {{ $t('pages.common.execute') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </span>
          <span v-access:code="['schedule:job:update']">
            <ElButton type="primary" @click="handleEdit(row)" link text>
              {{ $t('pages.common.edit') }}
            </ElButton>
          </span>
          <span v-access:code="['schedule:log:list']">
            <ElButton type="primary" @click="handleEdit(row)" link text>
              {{ $t('schedule.job.viewLog') }}
            </ElButton>
          </span>
          <span v-access:code="['schedule:job:delete']">
            <ElPopconfirm
              :title="$t('ui.actionMessage.deleteConfirm', [row.jobName])"
              icon-color="red"
              trigger="hover"
              @confirm="handleDelete(row)"
              width="200px"
            >
              <template #reference>
                <ElButton type="danger" link text>
                  {{ $t('pages.common.delete') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </span>
        </ElSpace>
      </template>
    </TableGrid>
    <EditorWindow @success="tableGridApi.query()" />
  </Page>
</template>
<style lang="scss" scoped></style>

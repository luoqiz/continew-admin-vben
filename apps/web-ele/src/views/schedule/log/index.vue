<script setup lang="ts">
import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type { JobLogResp } from '#/api/schedule';
import type { DictItemResp } from '#/api/system';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElButton, ElMessage, ElPopconfirm, ElSpace } from 'element-plus';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { listGroup, listJobLog, retryJob, stopJob } from '#/api/schedule';
import { DictTag } from '#/components/dict';
import { useDict } from '#/hooks';

import { useGridFieldColumns, useGridSearchFormSchema } from './dataScope';

const groupList = ref<{ label: string; value: string }[]>([]);

const { job_execute_reason_enum, job_execute_status_enum } = useDict(
  'job_execute_reason_enum',
  'job_execute_status_enum',
);

// 查询任务组列表
const getGroupList = async () => {
  const data = await listGroup();
  groupList.value = data?.map((item: string) => ({
    label: item,
    value: item,
  }));
};

const [TableGrid, tableGridApi] = useVbenVxeGrid({
  formOptions: {
    schema: useGridSearchFormSchema(groupList, job_execute_status_enum),
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
      response: {
        list: 'list',
      },
      ajax: {
        query: async ({ page }, formValues) => {
          const res = await listJobLog({
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
  } as VxeTableGridOptions<JobLogResp>,
});

// 停止
const onStop = (record: JobLogResp) => {
  stopJob(record.id).then(() => {
    ElMessage.success('停止成功');
  });
};

// 重试
const onRetry = (record: JobLogResp) => {
  retryJob(record.id).then(() => {
    ElMessage.success('重试成功');
  });
};

const route = useRoute();
onMounted(async () => {
  await getGroupList();
  if (route.query) {
    tableGridApi.formApi.form.setValues({
      jobId: route.query.jobId
        ? Number.parseInt(route.query.jobId as string, 10)
        : undefined,
      groupName: route.query.groupName ?? undefined,
      jobName: route.query.jobName ?? undefined,
    });
    tableGridApi.query();
  }
});
</script>

<template>
  <Page auto-content-height>
    <TableGrid>
      <template #taskBatchStatus="{ row }">
        <DictTag
          :value="row.taskBatchStatus"
          :dict-list="
            (job_execute_status_enum as unknown as DictItemResp[]) ?? []
          "
        />
      </template>
      <template #operationReason="{ row }">
        <DictTag
          :value="row.operationReason"
          :dict-list="
            (job_execute_reason_enum as unknown as DictItemResp[]) ?? []
          "
        />
      </template>

      <template #action="{ row }">
        <ElSpace>
          <span
            v-access:code="['schedule:log:stop']"
            v-if="row.taskBatchStatus === 2"
          >
            <ElPopconfirm
              :title="$t('ui.actionMessage.confirmStop', [row.jobName])"
              icon-color="red"
              @confirm="onStop(row)"
              trigger="hover"
              width="200px"
            >
              <template #reference>
                <ElButton type="danger" link text>
                  {{ $t('common.stop') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </span>

          <span
            v-access:code="['schedule:log:retry']"
            v-if="
              row.taskBatchStatus === 4 ||
              row.taskBatchStatus === 5 ||
              row.taskBatchStatus === 6
            "
          >
            <ElPopconfirm
              :title="$t('ui.actionMessage.confirmRetry', [row.jobName])"
              icon-color="red"
              @confirm="onRetry(row)"
              trigger="hover"
              width="200px"
            >
              <template #reference>
                <ElButton type="danger" link text>
                  {{ $t('common.retry') }}
                </ElButton>
              </template>
            </ElPopconfirm>
          </span>
        </ElSpace>
      </template>
    </TableGrid>
  </Page>
</template>
<style lang="scss" scoped></style>

<script setup lang="ts">
import type { LabelValueState } from '#/types/global';

import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Page,
} from '@vben/common-ui';
import { useTabs } from '@vben/hooks';
import { MsArrowBackIos } from '@vben/icons';
import { $t } from '@vben/locales';

import { ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { addNotice, getNotice, updateNotice } from '#/api/system/notice';
import { listUserDict } from '#/api/system/user';
import { useDict } from '#/hooks';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { useNoticeEditFormSchema } from '../NoticeData';

defineOptions({ name: 'SystemNoticeAdd' });
const emits = defineEmits(['success']);
const route = useRoute();
const dataId = ref();
const isUpdate = computed(() => !!dataId.value);
const disabledEdit = ref(false);
const { notice_type, notice_scope_enum, notice_method_enum } = useDict(
  'notice_type',
  'notice_scope_enum',
  'notice_method_enum',
);
const { closeCurrentTab } = useTabs();
const router = useRouter();
const userList = ref<LabelValueState[]>([]);

// 回退
const onBack = () => {
  closeCurrentTab();
  router.push('/system/notice');
};

const [EditorForm, editorFormApi] = useVbenForm({
  commonConfig: {
    componentProps: {
      class: 'w-full',
    },
    disabled: false,
  },
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: useNoticeEditFormSchema(
    notice_type,
    notice_scope_enum,
    notice_method_enum,
    userList,
  ),
  submitButtonOptions: {
    show: false,
  },
  wrapperClass:
    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 w-full',
});

const { markInitialized, resetInitialized } = useBeforeCloseDiff({
  initializedGetter: defaultFormValueGetter(editorFormApi),
  currentGetter: defaultFormValueGetter(editorFormApi),
});

async function reset() {
  await editorFormApi.resetForm();
  resetInitialized();
}

const commit = async (status: number) => {
  const { valid } = await editorFormApi.validate();
  if (!valid) return false;
  const noticeUsers =
    editorFormApi.form.values.noticeScope === 1
      ? null
      : editorFormApi.form.values.noticeUsers;
  if (isUpdate.value) {
    await updateNotice(
      {
        ...editorFormApi.form.values,
        noticeUsers,
        status,
      },
      dataId.value,
    );
    ElMessage.success($t('pages.common.modifySuccess'));
  } else {
    await addNotice({
      ...editorFormApi.form.values,
      noticeUsers,
      status,
    });
    ElMessage.success($t('pages.common.addSuccess'));
  }
  resetInitialized();
  emits('success');
  return true;
};

onMounted(async () => {
  try {
    dataId.value = route.query?.id;
    if (dataId.value && dataId.value) {
      const res = await getNotice(dataId.value);
      editorFormApi.form.setValues(res);
      if (res.status === 3) {
        disabledEdit.value = true;
      }
    }
    // 获取所有用户
    const data = await listUserDict();
    userList.value = data.map((item) => ({ ...item, value: `${item.value}` }));
  } finally {
    await markInitialized();
  }
});
</script>
<template>
  <Page auto-content-height>
    <Card class="flex h-full flex-col">
      <CardHeader>
        <CardTitle class="flex flex-row items-center justify-between">
          <div class="flex flex-row items-center">
            <span @click="onBack" style="cursor: pointer">
              <MsArrowBackIos class="size-6" />
            </span>
            <span>
              {{ $t('system.notice.listTitle') }} |
              {{ isUpdate ? $t('common.edit') : $t('common.create') }}
            </span>
          </div>
          <div v-if="!disabledEdit">
            <ElButton @click="commit(1)" type="primary"> 保存为草稿 </ElButton>
            <ElButton @click="commit(3)" type="primary"> 发布 </ElButton>
            <ElButton @click="reset" type="warning"> 重置 </ElButton>
            <ElButton @click="onBack" type="danger"> 取消 </ElButton>
          </div>
          <div v-else>
            <ElButton disabled type="warnning"> 已发布不可编辑 </ElButton>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent class="h-full flex-1">
        <EditorForm>
          <!-- <template #content>
            <div style="height: 500px">
              <RichText v-model="editorFormApi.form.values.content" />
            </div>
          </template> -->
        </EditorForm>
      </CardContent>
    </Card>
  </Page>
</template>
<style lang="scss" scoped></style>

<script setup lang="ts">
import type { UserResp } from '#/api';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { ElCheckbox, ElCheckboxGroup, ElMessage } from 'element-plus';

import { updateUserRole } from '#/api/system/user';
import { useRole } from '#/hooks/app/useRole';

const emits = defineEmits(['success']);
const detailInfo = ref<UserResp>();
const { roleList, getRoleList } = useRole();

const roleIdsRef = ref<Array<number | string>>([]);
async function handleClosed() {}

const [EditWindow, editWindowApi] = useVbenModal({
  onClosed: handleClosed,
  async onConfirm() {
    editWindowApi.lock();
    try {
      await updateUserRole({ roleIds: roleIdsRef.value }, detailInfo.value!.id);
      ElMessage.success($t('pages.common.modifySuccess'));

      emits('success');
      editWindowApi.close();
      return true;
    } catch (error) {
      console.error(error);
    } finally {
      editWindowApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      try {
        editWindowApi.lock(true);
        await getRoleList();
        // 租户表id
        const data = editWindowApi.getData<UserResp>();
        if (data && data.id) {
          detailInfo.value = data;
          roleIdsRef.value = data.roleIds;
        }
      } finally {
        editWindowApi.unlock();
      }
    }
  },
});

const getWindowTitle = computed(() => {
  return `${$t('pages.common.reset')} ${detailInfo.value?.nickname} ${$t('system.user.roleIds')}`;
});
</script>

<template>
  <EditWindow :title="getWindowTitle" class="w-[50%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <ElCheckboxGroup v-model="roleIdsRef">
        <ElCheckbox
          v-for="role in roleList"
          :key="role.value"
          :value="role.value"
        >
          {{ role.label }}--{{ role.value }}
        </ElCheckbox>
      </ElCheckboxGroup>
    </div>
  </EditWindow>
</template>
<style lang="scss" scoped></style>

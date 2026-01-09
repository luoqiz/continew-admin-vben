<script setup lang="ts">
import type { StorageResp } from '#/api'

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

import { useVbenForm } from '#/adapter/form'
import { useVbenDrawer } from '@vben/common-ui'
import { addStorage, getStorage, updateStorage } from '#/api'
import { useStorageEditFormSchema } from './StorageData'
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup'

const emits = defineEmits(['success'])
const dataId = ref('')
const isUpdate = computed(() => !!dataId.value)

const [StorageForm, storageFormApi] = useVbenForm({ schema: useStorageEditFormSchema(), submitButtonOptions: { show: false } })

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff({
  initializedGetter: defaultFormValueGetter(storageFormApi),
  currentGetter: defaultFormValueGetter(storageFormApi),
})

async function handleClosed() {
  await storageFormApi.resetForm()
  resetInitialized()
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await storageFormApi.validate()
    if (!valid) return false
    drawerApi.lock()
    try {
      if (isUpdate.value) {
        await updateStorage(storageFormApi.form.values, dataId.value)
        ElMessage.success('修改成功')
      } else {
        await addStorage(storageFormApi.form.values)
        ElMessage.success('新增成功')
      }
      resetInitialized()
      emits('success')
      drawerApi.close()
      return true
    } catch (error) {
      console.error(error)
    } finally {
      drawerApi.unlock()
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      try {
        drawerApi.lock(true)
        const data = drawerApi.getData<StorageResp>()
        dataId.value = data?.id
        if (data && data.id) {
          const res = await getStorage(data.id)
          storageFormApi.form.setValues(res)
        }
      } finally {
        await markInitialized()
        drawerApi.unlock()
      }
    }
  },
})

const getDrawerTitle = computed(() => (isUpdate.value ? '修改存储配置' : '新增存储配置'))
</script>

<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <StorageForm />
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>

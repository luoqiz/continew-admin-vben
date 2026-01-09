<script setup lang="ts">
import type { ClientResp } from '#/api'

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

import { useVbenForm } from '#/adapter/form'
import { useVbenDrawer } from '@vben/common-ui'
import { addClient, getClient, updateClient } from '#/api'
import { useClientEditFormSchema } from './ClientData'
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup'

const emits = defineEmits(['success'])
const dataId = ref('')
const isUpdate = computed(() => !!dataId.value)

const [ClientForm, clientFormApi] = useVbenForm({ schema: useClientEditFormSchema(), submitButtonOptions: { show: false } })

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff({
  initializedGetter: defaultFormValueGetter(clientFormApi),
  currentGetter: defaultFormValueGetter(clientFormApi),
})

async function handleClosed() {
  await clientFormApi.resetForm()
  resetInitialized()
}

const [Drawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  async onConfirm() {
    const { valid } = await clientFormApi.validate()
    if (!valid) return false
    drawerApi.lock()
    try {
      if (isUpdate.value) {
        await updateClient(clientFormApi.form.values, dataId.value)
        ElMessage.success('修改成功')
      } else {
        await addClient(clientFormApi.form.values)
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
        const data = drawerApi.getData<ClientResp>()
        dataId.value = data?.id
        if (data && data.id) {
          const res = await getClient(data.id)
          clientFormApi.form.setValues(res)
        }
      } finally {
        await markInitialized()
        drawerApi.unlock()
      }
    }
  },
})

const getDrawerTitle = computed(() => (isUpdate.value ? '修改客户端' : '新增客户端'))
</script>

<template>
  <Drawer :title="getDrawerTitle" class="w-[40%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <ClientForm />
    </div>
  </Drawer>
</template>

<style scoped lang="scss"></style>

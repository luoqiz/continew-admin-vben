      <script setup lang="ts">
      import type { VxeTableGridOptions } from '#/adapter/vxe-table'
      import type { SmsConfigResp, SmsConfigQuery } from '#/api'

      import { Page, useVbenDrawer } from '@vben/common-ui'
      import { $t } from '@vben/locales'
      import { ElButton, ElSpace, ElTag } from 'element-plus'

      import { useVbenVxeGrid } from '#/adapter/vxe-table'
      import { listSmsConfig, deleteSmsConfig, setDefaultSmsConfig } from '#/api'
      import { useDownload } from '#/hooks/app/useDownload'

      import { useSmsGridFieldColumns, useSmsGridSearchFormSchema } from './SmsData'
      import SmsEditDrawer from './AddModal.vue'

      const [TableGrid, tableGridApi] = useVbenVxeGrid({
        formOptions: {
          schema: useSmsGridSearchFormSchema(),
          submitOnChange: true,
          showCollapseButton: false,
        },
        gridOptions: {
          columns: useSmsGridFieldColumns() as VxeTableGridOptions['columns'],
          border: true,
          height: 'auto',
          proxyConfig: {
            response: { list: 'list' },
            ajax: {
              query: async ({ page }, formValues) => {
                const res = await listSmsConfig({ page: page.currentPage, size: page.pageSize, ...formValues } as SmsConfigQuery)
                return res
              },
            },
          },
          toolbarConfig: {
            custom: true,
            export: false,
            refresh: true,
            search: true,
          },
        } as VxeTableGridOptions<SmsConfigResp>,
      })

      const [EditorDrawer, drawerApi] = useVbenDrawer({
        connectedComponent: SmsEditDrawer,
        destroyOnClose: true,
      })

      const handleEdit = (record: SmsConfigResp) => {
        drawerApi.setData({ id: record.id })
        drawerApi.open()
      }

      const handleAdd = () => {
        drawerApi.setData({})
        drawerApi.open()
      }

      const handleDelete = async (row: SmsConfigResp) => {
        await deleteSmsConfig(row.id)
        tableGridApi.query()
      }

      const handleSetDefault = async (row: SmsConfigResp) => {
        await setDefaultSmsConfig(row.id)
        tableGridApi.query()
      }
</script>

      <template>
        <Page auto-content-height>
          <TableGrid :table-title="$t('system.sms.listTitle') || '短信配置'">
            <template #toolbar-tools>
              <ElSpace>
                <ElButton type="primary" @click="handleAdd">{{ $t('pages.common.add') }}</ElButton>
              </ElSpace>
            </template>

            <template #isDefault="{ row }">
              <ElTag v-if="row.isDefault" type="success">{{ $t('common.yes') }}</ElTag>
              <ElTag v-else>{{ $t('common.no') }}</ElTag>
            </template>

            <template #status="{ row }">
              <ElTag v-if="row.status === 1" type="success">{{ $t('common.enabled') }}</ElTag>
              <ElTag v-else type="danger">{{ $t('common.disabled') }}</ElTag>
            </template>

            <template #action="{ row }">
              <ElSpace>
                <ElButton type="text"
                  @click="() => $router.push({ name: 'SystemSmsLog', query: { configId: row.id } })">{{
                    $t('system.sms.sendLog') }}</ElButton>
                <ElButton type="text" @click="() => handleEdit(row)">{{ $t('pages.common.edit') }}</ElButton>
                <ElButton type="text" @click="() => handleSetDefault(row)">{{ $t('system.sms.setDefault') }}</ElButton>
                <ElButton type="text" @click="() => handleDelete(row)">{{ $t('pages.common.delete') }}</ElButton>
              </ElSpace>
            </template>
          </TableGrid>

          <EditorDrawer @success="tableGridApi.query()" />
        </Page>
      </template>

<style lang="scss" scoped></style>

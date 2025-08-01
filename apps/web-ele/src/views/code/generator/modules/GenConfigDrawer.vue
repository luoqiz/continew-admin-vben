<script lang="ts" setup>
import type { CascaderNode, TreeNodeData } from 'element-plus';

import type { VxeTableGridOptions } from '#/adapter/vxe-table';
import type {
  FieldConfigResp,
  GenConfigResp,
  GeneratorConfigResp,
} from '#/api';
import type { LabelValueState } from '#/types/global';

import { computed, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { getPopupContainer } from '@vben/utils';

import {
  ElCheckbox,
  ElInput,
  ElOption,
  ElSelect,
  ElMessage as message,
  ElStep as Step,
  ElSteps as Steps,
} from 'element-plus';

import { useVbenForm } from '#/adapter/form';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import {
  getGenConfig,
  listDictMenu,
  listFieldConfig,
  listFieldConfigDict,
  saveGenConfig,
} from '#/api';
import { useDict } from '#/hooks/app';
import { $t } from '#/locales';

import { useFiledColumns } from '../data';

const emits = defineEmits(['success']);

const { form_type_enum, query_type_enum } = useDict(
  'form_type_enum',
  'query_type_enum',
);

// 步骤
const currentTab = ref(0);

// 获取存在的字典，方便筛选
const dictList = ref<LabelValueState[]>([]);

// 生成配置表单
function onFirstSubmit(values: Record<string, any>) {
  if (values) {
    currentTab.value = 1;
  }
}

// 字段列表
const fields = ref<{ label: string; value: string }[]>([]);

// 创建from
const [FirstForm, firstFormApi] = useVbenForm({
  commonConfig: {
    // componentProps: {
    //   class: 'w-full',
    // },
    colon: true,
    formItemClass: 'col-span-2 md:col-span-1',
  },
  handleSubmit: onFirstSubmit,
  layout: 'horizontal',
  resetButtonOptions: {
    show: false,
  },
  schema: [
    {
      component: 'ApiTreeSelect',
      // 对应组件的参数
      componentProps: {
        // 菜单接口
        api: listDictMenu,
        childrenField: 'children',
        // 菜单接口转options格式
        props: {
          label: 'title',
          value: 'key',
        },
        // 是否在点击节点的时候展开或者收缩节点， 默认值为 true，如果为 false，则只有点箭头图标的时候才会展开或者收缩节点。
        expandOnClickNode: false,
        // 是否默认展开所有节点
        defaultExpandAll: true,
        // 是否在点击节点的时候选中节点，默认值为 false，即只有在点击复选框时才会选中节点。
        checkOnClickNode: true,
        // checkOnClickLeaf: false,
        getPopupContainer,
        // 设置弹窗滚动高度 默认256
        listHeight: 300,
        nodeKey: 'key',
        onNodeClick: (
          data: TreeNodeData,
          node: CascaderNode,
          // treeNode: TreeNode,
        ) => {
          // treeNode.expanded = false;
          node.checked = !node.checked;
          firstFormApi.form.setFieldValue('parentMenuId', data.key);
        },
      },
      // 字段名
      fieldName: 'parentMenuId',
      // 界面显示的label
      label: '上级菜单',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'author',
      label: '作者名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'entityName',
      label: '实体类名称',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        placeholder: '请输入',
        isButton: true,
        options: [
          { value: 1, label: '表格列表' },
          { value: 2, label: '树状列表' },
        ],
      },
      defaultValue: 1,
      fieldName: 'listType',
      label: '列表类型',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '树编码字段',
        maxLength: 60,
        showWordLimit: true,
        // props: {
        //   label: 'comment',
        //   value: 'columnName',
        // },
        options: fields,
      },
      dependencies: {
        if: (values) => values.listType === 2,
        triggerFields: ['listType'],
      },
      fieldName: 'treeId',
      label: '树编码字段',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '',
        maxLength: 60,
        showWordLimit: true,
        options: fields,
      },
      dependencies: {
        if: (values) => values.listType === 2,
        triggerFields: ['listType'],
      },
      fieldName: 'treePid',
      label: '树父编码字段',
      rules: 'required',
    },
    {
      component: 'Select',
      componentProps: {
        placeholder: '',
        maxLength: 60,
        showWordLimit: true,
        options: fields,
      },
      dependencies: {
        if: (values) => values.listType === 2,
        triggerFields: ['listType'],
      },
      fieldName: 'treeLabel',
      label: '树名称字段',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '项目模块名称，例如：continew-system',
        maxLength: 60,
        showWordLimit: true,
      },
      fieldName: 'moduleName',
      label: '所属模块',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '自定义业务名称，例如：用户',
        maxLength: 50,
      },
      fieldName: 'businessName',
      label: '业务名称',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '项目模块包名，例如：top.continew.admin.system',
        maxLength: 60,
      },
      fieldName: 'packageName',
      label: '模块包名',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '数据库表前缀，例如：sys_',
        maxLength: 20,
      },
      fieldName: 'tablePrefix',
      label: '去表前缀',
      rules: 'required',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入',
      },
      fieldName: 'frontPath',
      label: '前端项目路径',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        placeholder: '请输入',
        options: [
          { value: 1, label: 'modal弹窗' },
          { value: 2, label: 'drawer抽屉' },
        ],
      },
      defaultValue: 1,
      fieldName: 'dialogType',
      label: '弹窗组件类型',
      rules: 'required',
    },
    {
      component: 'RadioGroup',
      componentProps: {
        buttonStyle: 'solid',
        options: [
          { label: $t('common.yes'), value: true },
          { label: $t('common.no'), value: false },
        ],
        optionType: 'button',
      },
      defaultValue: true,
      fieldName: 'isOverride',
      label: '是否覆盖',
    },
  ],
  submitButtonOptions: {
    content: '下一步',
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-1 lg:grid-cols-1',
});

const genTable = ref<GenConfigResp>();

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: useFiledColumns(),
    border: true,
    height: 'auto',
    keepSource: true,
    columnConfig: {
      resizable: true,
    },
    pagerConfig: {
      enabled: false,
    },
    proxyConfig: {
      response: {
        list: 'list',
      },
      autoLoad: true,
      ajax: {
        query: async () => {
          const res = await listFieldConfig(genTable.value?.tableName!, false);
          fields.value = res.map((item) => ({
            label: `${item.fieldName}  ${item.comment ? `---  ${item.comment}` : ''}`,
            value: item.fieldName,
          }));
          return { list: res, total: res.length };
        },
      },
    },
    rowConfig: {
      keyField: 'columnName',
      isHover: true,
    },
    checkboxConfig: {
      highlight: true,
    },
    toolbarConfig: {
      custom: true,
      export: false,
      refresh: { code: 'query' },
      search: true,
      zoom: true,
    },
  } as VxeTableGridOptions<FieldConfigResp>,
});

const [Drawer, drawerApi] = useVbenDrawer({
  async onConfirm() {
    const { valid } = await firstFormApi.validate();
    if (!valid) return false;
    drawerApi.lock();
    try {
      await saveGenConfig(genTable.value!.tableName, {
        genConfig: firstFormApi.form.values,
        fieldConfigs: gridApi.grid.getFullData(),
      } as GeneratorConfigResp);
      message.success('保存成功');
      emits('success');
      drawerApi.close();
      return true;
    } finally {
      drawerApi.unlock();
    }
  },
  async onOpenChange(isOpen) {
    if (isOpen) {
      const data = drawerApi.getData<GenConfigResp>();
      if (data) {
        genTable.value = data;
        // 查询生成配置
        const genData = await getGenConfig(genTable.value!.tableName);
        firstFormApi.form.setValues(genData);
      }
      // 获取字典列表
      dictList.value = await listFieldConfigDict();
    }
  },
});

const getDrawerTitle = computed(() => {
  let comment = '';
  if (genTable.value?.comment) {
    comment = `(${genTable.value?.comment})`;
  }
  return `${genTable.value?.tableName}${comment}${$t('common.config')} `;
});
</script>
<template>
  <Drawer :title="getDrawerTitle" class="w-[80%]">
    <div class="mx-auto flex h-full w-full flex-col">
      <Steps :current="currentTab" class="px-16">
        <Step title="生成配置" />
        <Step title="字段配置" />
      </Steps>
      <div class="w-full flex-1 p-6">
        <FirstForm v-show="currentTab === 0" />
        <Grid v-show="currentTab === 1">
          <template #toolbar-left>
            <!-- <a-popconfirm
              content="是否确定同步最新数据表结构？同步后只要不点击确定保存，则不影响原有配置数据。"
              type="warning"
              @ok="handleRefresh(form.tableName)"
            >
              <a-tooltip content="同步最新数据表结构">
                <a-button
                  type="primary"
                  status="success"
                  size="small"
                  title="同步"
                  :disabled="
                    dataList.length > 0 && dataList[0].createTime == null
                  "
                >
                  <template #icon><icon-sync /></template>同步
</a-button>
</a-tooltip>
</a-popconfirm> -->
          </template>
          <template #fieldName="{ row }">
            <ElInput v-model="row.fieldName" />
          </template>
          <template #fieldType="{ row }">
            <ElSelect
              v-model="row.fieldType"
              placeholder="请选择字段类型"
              allow-search
              allow-create
              :error="!row.fieldType"
            >
              <ElOption value="String">String</ElOption>
              <ElOption value="Integer">Integer</ElOption>
              <ElOption value="Long">Long</ElOption>
              <ElOption value="Float">Float</ElOption>
              <ElOption value="Double">Double</ElOption>
              <ElOption value="Boolean">Boolean</ElOption>
              <ElOption value="BigDecimal">BigDecimal</ElOption>
              <ElOption value="LocalDate">LocalDate</ElOption>
              <ElOption value="LocalTime">LocalTime</ElOption>
              <ElOption value="LocalDateTime">LocalDateTime</ElOption>
            </ElSelect>
          </template>
          <template #comment="{ row }">
            <ElInput v-model="row.comment" />
          </template>
          <template #showInList="{ row }">
            <ElCheckbox v-model="row.showInList" value="true" />
          </template>
          <template #showInForm="{ row }">
            <ElCheckbox v-model="row.showInForm" value="true" />
          </template>
          <template #isRequired="{ row }">
            <ElCheckbox
              v-if="row.showInForm"
              v-model="row.isRequired"
              value="true"
            />
            <ElCheckbox v-else disabled />
          </template>
          <template #showInQuery="{ row }">
            <ElCheckbox v-model="row.showInQuery" value="true" />
          </template>
          <template #formType="{ row }">
            <ElSelect
              v-if="row.showInForm || row.showInQuery"
              v-model="row.formType"
              :options="form_type_enum"
              :default-value="1"
              placeholder="请选择表单类型"
            >
              <ElOption
                v-for="item in form_type_enum"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <span v-else>无需设置</span>
          </template>
          <template #queryType="{ row }">
            <ElSelect
              v-if="row.showInQuery"
              v-model="row.queryType"
              :default-value="1"
              placeholder="请选择查询方式"
            >
              <ElOption
                v-for="item in query_type_enum"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
            <span v-else>无需设置</span>
          </template>
          <template #dictCode="{ row }">
            <ElSelect
              v-model="row.dictCode"
              placeholder="请选择字典类型"
              allow-search
              allow-clear
            >
              <ElOption
                v-for="item in dictList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </template>
        </Grid>
      </div>
    </div>
    {{ fieldOptions }}
  </Drawer>
</template>
<style lang="css" scoped></style>

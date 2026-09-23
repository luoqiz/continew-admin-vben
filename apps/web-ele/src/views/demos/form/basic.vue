<script lang="ts" setup>
import { h } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { ElButton, ElCard, ElCheckbox, ElMessage } from 'element-plus';

import { useVbenForm } from '#/adapter/form';

/** 演示用的静态菜单数据：原演示调用的 /menu/all 接口后端已下线。 */
const demoMenuApi = async () => [
  {
    children: [
      { name: '用户管理', path: '/system/user', children: [] },
      { name: '角色管理', path: '/system/role', children: [] },
    ],
    name: '系统管理',
    path: '/system',
  },
  {
    children: [{ name: '在线用户', path: '/monitor/online', children: [] }],
    name: '系统监控',
    path: '/monitor',
  },
];

const [Form, formApi] = useVbenForm({
  commonConfig: {
    // 所有表单项
    componentProps: {
      class: 'w-full',
    },
  },
  layout: 'horizontal',
  // 大屏一行显示3个，中屏一行显示2个，小屏一行显示1个
  // wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleSubmit: (values) => {
    ElMessage.success(`表单数据：${JSON.stringify(values)}`);
  },
  schema: [
    {
      component: 'IconPicker',
      fieldName: 'icon',
      label: 'IconPicker',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'ApiSelect',
      // 对应组件的参数
      componentProps: {
        // 菜单数据转options格式
        afterFetch: (data: { name: string; path: string }[]) => {
          return data.map((item: any) => ({
            label: item.name,
            value: item.path,
          }));
        },
        // 菜单数据
        api: demoMenuApi,
      },
      // 字段名
      fieldName: 'api',
      // 界面显示的label
      label: 'ApiSelect',
    },
    {
      component: 'ApiTreeSelect',
      // 对应组件的参数
      componentProps: {
        // 菜单数据
        api: demoMenuApi,
        childrenField: 'children',
        // 菜单接口转options格式
        labelField: 'name',
        valueField: 'path',
      },
      // 字段名
      fieldName: 'apiTree',
      // 界面显示的label
      label: 'ApiTreeSelect',
    },
    {
      component: 'Input',
      fieldName: 'string',
      label: 'String',
    },
    {
      component: 'InputNumber',
      fieldName: 'number',
      label: 'Number',
    },
    {
      component: 'RadioGroup',
      fieldName: 'radio',
      label: 'Radio',
      componentProps: {
        options: [
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
          { value: 'C', label: 'C' },
          { value: 'D', label: 'D' },
          { value: 'E', label: 'E' },
        ],
      },
    },
    {
      component: 'RadioGroup',
      fieldName: 'radioButton',
      label: 'RadioButton',
      componentProps: {
        isButton: true,
        options: ['A', 'B', 'C', 'D', 'E', 'F'].map((v) => ({
          value: v,
          label: `选项${v}`,
        })),
      },
    },
    {
      component: 'CheckboxGroup',
      fieldName: 'checkbox',
      label: 'Checkbox',
      componentProps: {
        options: ['A', 'B', 'C'].map((v) => ({ value: v, label: `选项${v}` })),
      },
    },
    {
      component: 'CheckboxGroup',
      fieldName: 'checkbox1',
      label: 'Checkbox1',
      renderComponentContent: () => {
        return {
          default: () => {
            return ['A', 'B', 'C', 'D'].map((v) =>
              h(ElCheckbox, { label: v, value: v }),
            );
          },
        };
      },
    },
    {
      component: 'CheckboxGroup',
      fieldName: 'checkbotton',
      label: 'CheckBotton',
      componentProps: {
        isButton: true,
        options: [
          { value: 'A', label: '选项A' },
          { value: 'B', label: '选项B' },
          { value: 'C', label: '选项C' },
        ],
      },
    },
    {
      component: 'DatePicker',
      fieldName: 'date',
      label: 'Date',
    },
    {
      component: 'Select',
      fieldName: 'select',
      label: 'Select',
      componentProps: {
        filterable: true,
        options: [
          { value: 'A', label: '选项A' },
          { value: 'B', label: '选项B' },
          { value: 'C', label: '选项C' },
        ],
      },
    },
  ],
});

const [Drawer, drawerApi] = useVbenDrawer();
function setFormValues() {
  formApi.setValues({
    string: 'string',
    number: 123,
    radio: 'B',
    radioButton: 'C',
    checkbox: ['A', 'C'],
    checkbotton: ['B', 'C'],
    checkbox1: ['A', 'B'],
    date: new Date(),
    select: 'B',
  });
}
</script>
<template>
  <Page
    description="我们重新包装了CheckboxGroup、RadioGroup、Select，可以通过options属性传入选项属性数组以自动生成选项"
    title="表单演示"
  >
    <Drawer class="w-150" title="基础表单示例">
      <Form />
    </Drawer>
    <ElCard>
      <template #header>
        <div class="flex items-center">
          <span class="flex-auto">基础表单演示</span>
          <ElButton type="primary" @click="setFormValues">设置表单值</ElButton>
        </div>
      </template>
      <ElButton type="primary" @click="drawerApi.open"> 打开抽屉 </ElButton>
    </ElCard>
  </Page>
</template>

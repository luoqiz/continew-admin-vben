import type { TreeNodeData } from 'element-plus';

import { ref } from 'vue';

import { listDeptDictTree } from '#/api';

/** 部门模块 */
export function useDept(options?: { onSuccess?: () => void }) {
  const loading = ref(false);
  const deptList = ref<TreeNodeData[]>([]);

  const getDeptList = async (name?: string) => {
    try {
      loading.value = true;
      const res = await listDeptDictTree({ description: name });
      deptList.value = res;
      options?.onSuccess && options.onSuccess();
    } finally {
      loading.value = false;
    }
  };
  return { deptList, getDeptList, loading };
}

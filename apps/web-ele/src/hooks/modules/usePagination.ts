import { reactive, toRefs, watch } from 'vue';

import { useBreakpoint } from './useBreakpoint';

type Callback = () => void;

export interface Options {
  defaultPageSize: number;
  defaultSizeOptions: number[];
}

const DEFAULT_PAGE_OPTIONS = {
  defaultPageSize: 10,
  defaultSizeOptions: [10, 20, 30, 40, 50],
};

export function usePagination(callback: Callback, options?: Options) {
  const pageOptions = { ...DEFAULT_PAGE_OPTIONS, ...options };
  const { breakpoint } = useBreakpoint();
  const pagination = reactive({
    showPageSize: true,
    showTotal: true,
    current: 1,
    pageSize: pageOptions.defaultPageSize,
    pageSizeOptions: pageOptions.defaultSizeOptions,
    total: 0,
    simple: false,
    onChange: (size: number) => {
      pagination.current = size;
      callback && callback();
    },
    onPageSizeChange: (size: number) => {
      pagination.current = 1;
      pagination.pageSize = size;
      callback && callback();
    },
  });

  watch(
    () => breakpoint.value,
    () => {
      pagination.simple = ['xs'].includes(breakpoint.value ?? 'xs');
      pagination.showTotal = !['xs'].includes(breakpoint.value ?? 'xs');
    },
    { immediate: true },
  );

  const changeCurrent = pagination.onChange;
  const changePageSize = pagination.onPageSizeChange;
  function setTotal(value: number) {
    pagination.total = value;
  }

  const { current, pageSize, total } = toRefs(pagination);

  return {
    current,
    pageSize,
    total,
    pagination,
    changeCurrent,
    changePageSize,
    setTotal,
  };
}

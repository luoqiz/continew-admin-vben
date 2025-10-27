import type { ColProps } from 'element-plus';

import type { ComputedRef } from 'vue';

import { computed } from 'vue';

import { useBreakpoints } from '@vueuse/core';

type ColBreakpoint = Pick<ColProps, 'lg' | 'md' | 'sm' | 'xl' | 'xs'>;
type Breakpoint = keyof ColBreakpoint;

export function useBreakpoint() {
  const breakpoints = useBreakpoints({
    xs: 576, // <576
    sm: 576, // >= 576
    md: 768, // >=768
    lg: 992, // >=992
    xl: 1200, // >=1200
    // xxl: 1600, // >=1600
  });

  const arr = breakpoints.current() as ComputedRef<Breakpoint[]>;
  const breakpoint = computed(() => {
    return arr.value.length > 0 ? arr.value[arr.value.length - 1] : 'xs';
  });

  return { breakpoint };
}

import type { TreeNodeData } from 'element-plus';

import { mitt } from '@vben/utils';

type Events = {
  nodeClick: TreeNodeData;
};

export const emitter = mitt<Events>();

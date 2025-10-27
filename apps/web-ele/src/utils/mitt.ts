import { mitt } from '@vben/utils';

interface Events {
  // 自定义事件名称
  event: string | symbol;
  // 任意传递的参数
  [parmas: string | symbol]: any;
}

const mittBus = mitt<Events>();
export default mittBus;

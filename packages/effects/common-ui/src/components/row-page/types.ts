import type { PageProps } from '../page/types';

export interface RowPageProps extends PageProps {
  /**
   * 顶部宽度
   * @default 30
   */
  topWidth?: number;
  topMinWidth?: number;
  topMaxWidth?: number;
  topCollapsedWidth?: number;
  topCollapsible?: boolean;
  /**
   * 底部宽度
   * @default 70
   */
  bottomWidth?: number;
  bottomMinWidth?: number;
  bottomCollapsedWidth?: number;
  bottomMaxWidth?: number;
  bottomCollapsible?: boolean;

  resizable?: boolean;
  splitLine?: boolean;
  splitHandle?: boolean;
}

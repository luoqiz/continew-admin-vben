declare namespace App {
  interface AppSettings {
    theme: 'dark' | 'light';
    themeColor: string;
    tab: boolean;
    tabMode: 'card' | 'card-gutter' | 'rounded';
    animate: boolean;
    animateMode:
      | 'fade'
      | 'fade-bottom'
      | 'fade-scale'
      | 'fade-slide'
      | 'slide-dynamic-origin'
      | 'zoom-fade';
    menuCollapse: boolean;
    menuAccordion: boolean;
    menuDark: boolean;
    copyrightDisplay: boolean;
    layout: 'left' | 'mix';
    isOpenWatermark?: boolean;
    watermark?: string;
    enableColorWeaknessMode?: boolean;
    enableMourningMode?: boolean;
  }

  /** 导航页签的样式类型 */
  type TabType = 'card' | 'card-gutter' | 'rounded';
  interface TabItem {
    label: string;
    value: TabType;
  }
  /** 页面切换动画类型 */
  type AnimateType =
    | 'fade'
    | 'fade-bottom'
    | 'fade-scale'
    | 'fade-slide'
    | 'slide-dynamic-origin'
    | 'zoom-fade';
  interface AnimateItem {
    label: string;
    value: AnimateType;
  }

  /** 字典项 */
  interface DictItem {
    disabled?: boolean;
    extra?: string;
    label: string;
    value: string;
  }
}

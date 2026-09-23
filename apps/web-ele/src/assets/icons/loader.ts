import type { IconifyIconStructure } from '@vben/icons';

import { addIcon } from '@vben/icons';

/**
 * 本地 svg 图标注册。
 *
 * 本目录下的 svg 下载自 iconify 的 lucide 图标集（https://icon-sets.iconify.design/lucide/），
 * 通过 addIcon 注册为 `svg:<文件名>`，即可用 <VbenIcon icon="svg:xxx" /> 离线渲染，
 * 不依赖 iconify 在线接口。
 *
 * 新增图标：下载 svg 放入本目录后即可使用，无需改动本文件。
 */
const svgModules = import.meta.glob('./*.svg', {
  eager: true,
  import: 'default',
  query: '?raw',
});

function parseSvg(svgData: string): IconifyIconStructure {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgData, 'image/svg+xml');
  const svgElement = xmlDoc.documentElement;

  // 提取 SVG 根元素的关键样式属性
  const getAttrs = (el: Element, attrs: string[]) =>
    attrs
      .map((attr) =>
        el.hasAttribute(attr) ? `${attr}="${el.getAttribute(attr)}"` : '',
      )
      .filter(Boolean)
      .join(' ');

  const rootAttrs = getAttrs(svgElement, [
    'fill',
    'stroke',
    'fill-rule',
    'stroke-width',
  ]);

  const svgContent = [...svgElement.childNodes]
    .filter((node) => node.nodeType === Node.ELEMENT_NODE)
    .map((node) => new XMLSerializer().serializeToString(node))
    .join('');
  // 若根有属性，用一个 g 标签包裹内容并继承属性
  const body = rootAttrs ? `<g ${rootAttrs}>${svgContent}</g>` : svgContent;

  const viewBoxValue = svgElement.getAttribute('viewBox') || '';
  const [left, top, width, height] = viewBoxValue.split(' ').map((val) => {
    const num = Number(val);
    return Number.isNaN(num) ? undefined : num;
  });

  return {
    body,
    height,
    left,
    top,
    width,
  };
}

for (const [path, content] of Object.entries(svgModules)) {
  const start = path.lastIndexOf('/') + 1;
  const end = path.lastIndexOf('.');
  const iconName = path.slice(start, end);
  addIcon(`svg:${iconName}`, parseSvg(content as string));
}

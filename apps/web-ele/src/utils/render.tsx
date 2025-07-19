import type { Component as ComponentType } from 'vue';

import type { DictItemResp } from '#/api';

import { h } from 'vue';

import { IconifyIcon } from '@vben/icons';

import { ElTag } from 'element-plus';

import { DictTag } from '#/components/dict';

/**
 * 渲染标签
 * @param text 文字
 * @param color 颜色
 * @returns render
 */
function renderTag(text: string, color?: string) {
  return <ElTag color={color}>{text}</ElTag>;
}

/**
 *
 * @param tags 标签list
 * @param wrap 是否换行显示
 * @param [gap] 间隔
 * @returns render
 */
export function renderTags(tags: string[], wrap = false, gap = 1) {
  return (
    <div
      class={['flex', wrap ? 'flex-col' : 'flex-row']}
      style={{ gap: `${gap}px` }}
    >
      {tags.map((tag, index) => {
        return <div key={index}>{renderTag(tag)}</div>;
      })}
    </div>
  );
}

/**
 * iconify图标
 * @param icon icon名称
 * @returns render
 */
export function renderIcon(icon: string) {
  return <IconifyIcon icon={icon}></IconifyIcon>;
}

/**
 * httpMethod标签
 * @param type method类型
 * @returns render
 */
export function renderHttpMethodTag(type: string) {
  const method = type.toUpperCase();
  const colors: { [key: string]: string } = {
    DELETE: 'red',
    GET: 'green',
    POST: 'blue',
    PUT: 'orange',
  };

  const color = colors[method] ?? 'default';
  const title = `${method}请求`;

  return <ElTag color={color}>{title}</ElTag>;
}

export function renderDictTag(value: number | string, dicts: DictItemResp[]) {
  return <DictTag dicts={dicts} value={value}></DictTag>;
}

/**
 * render多个dictTag
 * @param value key数组 string[]类型
 * @param dicts 字典数组
 * @param wrap 是否需要换行显示
 * @param [gap] 间隔
 * @returns render
 */
export function renderDictTags(
  value: string[],
  dicts: DictItemResp[],
  wrap = true,
  gap = 1,
) {
  if (!Array.isArray(value)) {
    return <div>{value}</div>;
  }
  return (
    <div
      class={['flex', wrap ? 'flex-col' : 'flex-row']}
      style={{ gap: `${gap}px` }}
    >
      {value.map((item, index) => {
        return <div key={index}>{renderDictTag(item, dicts)}</div>;
      })}
    </div>
  );
}

/**
 * 显示字典标签 一般是table使用
 * @param value 值
 * @param dictName dictName
 * @returns tag
 */
// export function renderDict(value: number | string, dictName: string) {
//   const dictInfo = getDictOptions(dictName);
//   return renderDictTag(value, dictInfo);
// }
export function renderIconSpan(
  icon: ComponentType,
  value: string,
  center = false,
  marginLeft = '2px',
) {
  const justifyCenter = center ? 'justify-center' : '';

  return (
    <span class={['flex', 'items-center', justifyCenter]}>
      {h(icon)}
      <span style={{ marginLeft }}>{value}</span>
    </span>
  );
}

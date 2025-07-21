import { useDictStore } from '#/store';

/**
 * 一般是Select, Radio, Checkbox等组件使用
 * todo! 此处需要缓存字典，暂因没有根据code获取字典的接口搁置
 * @warning 注意内部为异步实现 所以不要写这种`getDictOptions()[0]`的代码 会获取不到
 * @warning 需要保持`formatNumber`统一 在所有调用地方需要一致 不能出现A处为string B处为number
 *
 * @param dictName 字典名称
 * @param formatNumber 是否格式化字典value为number类型
 * @returns Options数组
 */
export function getDictOptions(dictName: string, formatNumber = false) {
  const { getDict } = useDictStore();
  const dataList = getDict(dictName);

  // 检查请求状态缓存
  if (dataList !== null && dataList.length === 0 && formatNumber) {
    return dataList;
  }
  return dataList;
}

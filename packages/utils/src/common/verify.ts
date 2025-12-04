export function resetSize(vm: any) {
  const parentWidth = vm.$el.parentNode.offsetWidth || window.innerWidth;
  const parentHeight = vm.$el.parentNode.offsetHeight || window.innerHeight;
  const img_width = vm.imgSize.width.includes('%')
    ? `${(Number.parseInt(vm.imgSize.width, 10) / 100) * parentWidth}px`
    : vm.imgSize.width;

  const img_height = vm.imgSize.height.includes('%')
    ? `${(Number.parseInt(vm.imgSize.height, 10) / 100) * parentHeight}px`
    : vm.imgSize.height;

  const bar_width = vm.barSize.width.includes('%')
    ? `${(Number.parseInt(vm.barSize.width, 10) / 100) * parentWidth}px`
    : vm.barSize.width;
  // 图片的宽度、高度，移动条的宽度、高度
  const bar_height = vm.barSize.height.includes('%')
    ? `${(Number.parseInt(vm.barSize.height, 10) / 100) * parentHeight}px`
    : vm.barSize.height;

  return {
    imgWidth: img_width,
    imgHeight: img_height,
    barWidth: bar_width,
    barHeight: bar_height,
  };
}

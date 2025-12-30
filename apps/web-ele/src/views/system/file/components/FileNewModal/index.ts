import { ElMessageBox } from 'element-plus';

export function openNewDirModal(okCallback?: (newDirName: string) => void) {
  return ElMessageBox.prompt('请输入文件夹名', '新建文件夹', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /^(?!\s*$).+/,
    inputErrorMessage: '文件名不能为空',
  })
    .then(async ({ value }) => {
      // 新建文件夹弹窗窗口确认事件
      if (okCallback) {
        okCallback(value);
      }
      return true;
    })
    .catch(() => {
      // 取消操作
    });
}

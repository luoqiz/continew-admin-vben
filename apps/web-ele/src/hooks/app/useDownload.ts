import { $t } from '@vben/locales';

import { ElMessage, ElNotification } from 'element-plus';

/**
 * @description 接收数据流生成 blob，创建链接，下载文件
 * @param {Function} api 导出表格的api方法 (必传)
 * @param {string} tempName 导出的文件名 (必传)
 * @param {object} params 导出的参数 (默认{})
 * @param {boolean} isNotify 是否有导出消息提示 (默认为 true)
 * @param {string} fileType 导出的文件格式 (默认为.xlsx)
 */
interface NavigatorWithMsSaveOrOpenBlob extends Navigator {
  msSaveOrOpenBlob: (blob: Blob, fileName: string) => void;
}
export const useDownload = async (
  api: () => Promise<any>,
  isNotify = false,
  tempName = '',
  fileType = '.xlsx',
) => {
  try {
    const res = await api();
    tempName = res.headers['content-disposition']
      ? decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1],
        )
      : tempName || Date.now() + fileType;
    if (isNotify && !res?.code) {
      ElNotification({
        title: $t('pages.common.notificationWarning'),
        message: $t('pages.common.downloadDataTooBig'),
        type: 'warning',
      });
    }
    if (
      res.status !== 200 ||
      res.data === null ||
      !(res.data instanceof Blob)
    ) {
      ElMessage.error($t('pages.common.exportError'));
      return;
    }
    const blob = new Blob([res.data]);
    // 兼容 edge 不支持 createObjectURL 方法
    if (
      'msSaveOrOpenBlob' in
      (navigator as unknown as NavigatorWithMsSaveOrOpenBlob)
    ) {
      (
        window.navigator as unknown as NavigatorWithMsSaveOrOpenBlob
      ).msSaveOrOpenBlob(blob, tempName + fileType);
    }
    const blobUrl = window.URL.createObjectURL(blob);
    const exportFile = document.createElement('a');
    exportFile.style.display = 'none';
    exportFile.download = tempName;
    exportFile.href = blobUrl;
    document.body.append(exportFile);
    exportFile.click();
    // 去除下载对 url 的影响
    exportFile.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch {
    // console.log(error)
  }
};

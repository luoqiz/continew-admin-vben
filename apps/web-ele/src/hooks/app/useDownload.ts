import { $t } from '@vben/locales';

import { ElMessage, ElNotification } from 'element-plus';

/**
 * @description 接收数据流生成 blob，创建链接，下载文件
 * @param {Function} api 导出表格的api方法 (必传)
 * @param {string} fileName 导出的文件名 (可选，例如：导出数据.xlsx，默认从响应头或时间戳生成)
 * @param {string} fileType 导出的文件格式 (默认为.xlsx)
 * @param {boolean} isNotify 是否显示导出提示消息 (默认为 false)
 * @returns {Promise<void>} 无返回值
 */
interface NavigatorWithMsSaveOrOpenBlob extends Navigator {
  msSaveOrOpenBlob: (blob: Blob, fileName: string) => void;
}
export const useDownload = async (
  api: () => Promise<any>,
  fileName = '',
  fileType = '.xlsx',
  isNotify = false,
) => {
  try {
    const res = await api();
    if (!fileName) {
      // eslint-disable-next-line unicorn/prefer-ternary
      if (res.headers['content-disposition']) {
        // 从响应头提取文件名+
        fileName = decodeURI(
          res.headers['content-disposition'].split(';')[1].split('=')[1],
        );
      } else {
        // 时间戳生成
        fileName = Date.now() + fileType;
      }
    }

    if (isNotify && !res?.code) {
      ElNotification({
        title: $t('pages.common.notificationWarning'),
        message: $t('pages.common.downloadDataTooBig'),
        type: 'warning',
      });
    }
    // 验证响应数据
    if (res.status !== 200 || !res.data || !(res.data instanceof Blob)) {
      ElMessage.error($t('pages.common.exportError'));
      return;
    }
    const blob = new Blob([res.data]);
    // 兼容 IE/Edge 浏览器
    if ('msSaveOrOpenBlob' in navigator) {
      return (
        navigator as unknown as NavigatorWithMsSaveOrOpenBlob
      ).msSaveOrOpenBlob(blob, fileName);
    }
    // 创建下载链接并触发下载
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.download = fileName;
    link.href = blobUrl;
    document.body.append(link);
    link.click();
    // 清理资源
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : '未知错误';
    ElMessage.error(`下载失败: ${errorMsg}`);
  }
};

/** @desc 格式化文件大小 */
export const formatFileSize = (fileSize: number) => {
  if (fileSize === null || fileSize === 0) {
    return '0 Bytes';
  }
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let index = 0;
  const srcSize = Number.parseFloat(fileSize.toString());
  index = Math.floor(Math.log(srcSize) / Math.log(1024));
  const size = srcSize / 1024 ** index;
  return `${size.toFixed(2)} ${unitArr[index]}`;
};

export interface FileTypeListItem {
  /** 类型名称的 i18n 键 */
  nameKey: string;
  value: number;
  icon: string;
}

/** 文件分类 */
export const FileTypeList: FileTypeListItem[] = [
  { nameKey: 'system.file.type.all', value: 0, icon: 'menu-file' },
  { nameKey: 'system.file.type.image', value: 2, icon: 'file-image-color' },
  { nameKey: 'system.file.type.doc', value: 3, icon: 'file-txt' },
  { nameKey: 'system.file.type.video', value: 4, icon: 'file-video-color' },
  { nameKey: 'system.file.type.audio', value: 5, icon: 'file-music' },
  { nameKey: 'system.file.type.other', value: 1, icon: 'file-other' },
];

export interface FileExtendNameIconMap {
  [key: string]: string;
}

/** 文件类型图标 Map 映射 */
export const FileIcon: FileExtendNameIconMap = {
  mp3: 'file-music',
  mp4: 'file-video',
  dir: 'file-dir',
  ppt: 'file-ppt',
  doc: 'file-wps',
  docx: 'file-wps',
  xls: 'file-excel',
  xlsx: 'file-excel',
  txt: 'file-txt',
  rar: 'file-rar',
  zip: 'file-zip',
  html: 'file-html',
  css: 'file-css',
  js: 'file-js',
  other: 'file-other', // 未知文件
};

/** 图片类型 */
export const ImageTypes = ['jpg', 'png', 'gif', 'jpeg'];

/** WPS、Office文件类型 */
export const OfficeTypes = ['ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'pdf'];

export const WordTypes = ['doc', 'docx'];

export const ExcelTypes = ['xls', 'xlsx'];

export const DirTypes = ['dir'];

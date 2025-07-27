/** 工具代码生成类型 */
export interface GenConfigResp {
  tableName: string;
  comment: string;
  moduleName: string;
  packageName: string;
  businessName: string;
  author: string;
  tablePrefix: string;
  isOverride: boolean;
  createTime?: string;
  updateTime?: string;
  classNamePrefix?: string;
  listType: number;
  entityName: string;
  dialogType: number;
  treeId: string;
  treePid: string;
  treeLabel: string;
  frontPath: string;
}
export interface GenConfigQuery {
  tableName?: string;
}
export interface GenConfigPageQuery extends GenConfigQuery, PageQuery {}

export interface FieldConfigResp {
  tableName: string;
  columnName: string;
  columnType: string;
  fieldName: string;
  fieldType: string;
  fieldSort: number;
  comment: string;
  isRequired: boolean;
  showInList: boolean;
  showInForm: boolean;
  showInQuery: boolean;
  formType: string;
  queryType: string;
  dictCode: string;
  createTime?: string;
}
export interface GeneratorConfigResp {
  genConfig: GenConfigResp;
  fieldConfigs: FieldConfigResp[];
}
export interface GeneratePreviewResp {
  path: string;
  fileName: string;
  content: string;
}

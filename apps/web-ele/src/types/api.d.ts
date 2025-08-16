export type ID = number | string;
export type IDS = (number | string)[];

export interface BaseEntity {
  /** 创建人 */
  createUser?: string;
  /** 创建时间 */
  createTime?: string;
  /** 更新人 */
  updateUser?: string;
  /** 更新时间 */
  updateTime?: string;
  /** 创建人 */
  createUserString?: string;
  /** 更新人名称 */
  updateUserString?: string;
  /** 此记录禁止更新 */
  disabled: boolean;
  /** 租户ID */
  tenantId: string;
}

/** 接口返回数据格式 */
interface ApiRes<T> {
  code: number;
  data: T;
  msg: string;
  success: boolean;
  timestamp: string;
}

/** 分页响应数据格式 */
interface PageRes<T> {
  list: T;
  total: number;
}

/** 分页请求数据格式 */
interface PageQuery {
  page: number;
  size: number;
}

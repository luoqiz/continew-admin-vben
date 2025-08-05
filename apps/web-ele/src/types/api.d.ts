export type ID = number | string;
export type IDS = (number | string)[];

export interface BaseEntity {
  createUser?: string;
  createTime?: string;
  updateUser?: string;
  updateTime?: string;
  createUserString?: string;
  updateUserString?: string;
  disabled: boolean;
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

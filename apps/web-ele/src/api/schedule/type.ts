import type { PageQuery } from '#/types/api';

/** 任务类型 */
export interface JobResp {
  /**
   * ID
   */
  id: number | string;

  /**
   * 任务组
   */
  groupName: string;
  /**
   * 任务名称
   */
  jobName: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 触发类型
   */
  triggerType: number;
  /**
   * 间隔时长
   */
  triggerInterval: string;
  /**
   * 执行器类型
   */
  executorType: number;
  /**
   * 任务类型
   */
  taskType: number;
  /**
   * 执行器名称
   */
  executorInfo: string;
  /**
   * 任务参数
   */
  argsStr?: string;

  /**
   * 参数类型
   */
  argsType?: string;
  /**
   * 路由策略
   */
  routeKey: number;
  /**
   * 阻塞策略
   */
  blockStrategy: number;
  /**
   * 超时时间（单位：秒）
   */
  executorTimeout: number;
  /**
   * 最大重试次数
   */
  maxRetryTimes: number;
  /**
   * 重试间隔（单位：秒）
   */
  retryInterval: number;
  /**
   * 并行数
   */
  parallelNum: number;
  /**
   * 任务状态
   */
  jobStatus: number;
  /**
   * 下次触发时间
   */
  nextTriggerAt?: Date;
  /**
   * 创建时间
   */
  createDt?: Date;
  /**
   * 修改时间
   */
  updateDt?: Date;
}
export interface JobQuery {
  /**
   * 任务组
   */
  groupName: string;
  /**
   * 任务名称
   */
  jobName?: string;
  /**
   * 任务状态
   */
  jobStatus?: number;
}
export interface JobPageQuery extends JobQuery, PageQuery {}

/** 任务日志类型 */
export interface JobLogResp {
  /**
   * ID
   */
  id: number;
  /**
   * 任务组
   */
  groupName: string;
  /**
   * 任务名称
   */
  jobName: string;
  /**
   * 任务 ID
   */
  jobId: number;
  /**
   * 任务状态 1待处理 2运行中  3成功 4已失败 5已停止 6已取消
   */
  taskBatchStatus: number;
  /**
   * 操作原因
   */
  operationReason: number;
  /**
   * 执行器类型
   */
  executorType: number;
  /**
   * 执行器名称
   */
  executorInfo: string;
  /**
   * 执行时间
   */
  executionAt: string;
  /**
   * 创建时间
   */
  createDt: string;
}
export interface JobLogQuery {
  /**
   * 任务 ID
   */
  jobId?: number;
  /**
   * 任务组
   */
  groupName?: string;
  /**
   * 任务名称
   */
  jobName?: string;
  /**
   * 任务批次状态
   */
  taskBatchStatus?: number;
  /**
   * 创建时间
   */
  datetimeRange?: Array<string>;
}
export interface JobLogPageQuery extends JobLogQuery, PageQuery {}

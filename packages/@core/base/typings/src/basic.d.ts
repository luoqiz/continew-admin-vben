interface BasicOption {
  label: string;
  value: string;
}

type SelectOption = BasicOption;

type TabOption = BasicOption;

interface BasicUserInfo {
  /**
   * 头像
   */
  avatar: string;
  // 部门名称
  deptName: string;
  // 邮箱
  email: string;
  // 性别 0 未知 1 男 2 女
  gender: 0 | 1 | 2;
  // 用户id
  id: string;
  // 用户昵称
  nickname: string;
  // 权限
  permissions: string[];
  // 手机号
  phone: string;
  // 密码过期时间
  pwdExpired: boolean;
  // 重置密码时间
  pwdResetTime: string;
  /**
   * 用户昵称
   */
  realName: string;
  // 注册日期
  registrationDate: string;
  /**
   * 用户角色
   */
  roles?: string[];
  /**
   * 用户id
   */
  userId: string;
  /**
   * 用户名
   */
  username: string;
}

type ClassType = Array<object | string> | object | string;

export type { BasicOption, BasicUserInfo, ClassType, SelectOption, TabOption };

/** @desc 正则-手机号码 */
export const Phone = /^1[3-9]\d{9}$/;

/** @desc 正则-邮箱 */
export const Email = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

/** @desc 正则-密码(密码为8-18位数字/字符/符号的组合) */
// export const Password =
//   /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/

/** @desc 正则-密码(密码为6位数字) */
export const Password = /^\d{6}$/;

/** @desc 正则-6位数字验证码正则 */
export const Code_6 = /^\d{6}$/;

/** @desc 正则-4位数字验证码正则 */
export const Code_4 = /^\d{4}$/;

/** @desc 正则-url链接（安全无ReDoS风险） */
export const Url =
  /^(https?:\/\/)?([\w-]+@)?([A-Za-z0-9.-]+)(:\d{1,5})?(\/[\w~!#$&'()*+,./:;=?@_-]*)*$/i;

/** @desc 正则-16进颜色值 #333 #8c8c8c */
export const ColorRegex = /^#?([a-f0-9]{6}|[a-f0-9]{3})$/i;

/** @desc 正则-只能是中文 */
export const OnlyCh = /^[\u4E00-\u9FA5]+$/g;

/** @desc 正则-只能是英文 */
export const OnlyEn = /^[a-z]*$/i;

/**
 * 手机号验证函数 - 发送验证码前校验
 * @param {string} phone 输入的手机号
 * @returns {object} { valid: 是否通过, msg: 提示信息 }
 */
export function validatePhoneNumber(phone: string): {
  msg: string;
  valid: boolean;
} {
  // 1. 去除首尾空格
  phone = phone.trim();

  // 2. 判断是否为空
  if (!phone) {
    return {
      valid: false,
      msg: '请输入手机号',
    };
  }

  // 3. 判断是否为11位数字
  if (!/^\d{11}$/.test(phone)) {
    return {
      valid: false,
      msg: '手机号必须是11位数字',
    };
  }

  // 4. 校验国内手机号合法号段（最严谨的正则）
  // const phoneReg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;

  if (!Phone.test(phone)) {
    return {
      valid: false,
      msg: '请输入正确的中国大陆手机号',
    };
  }

  // 所有校验通过
  return {
    valid: true,
    msg: '验证通过，可以发送验证码',
  };
}

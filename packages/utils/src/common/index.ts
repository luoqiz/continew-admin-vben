import CronParser from 'cron-parser';

export * from './encrypt';
export * from './verify';

export const YMD_HMS = 'yyyy-MM-dd HH:mm:ss';

/**
 * 格式化时间
 */
export function dateFormat(date = new Date(), pattern = YMD_HMS) {
  if (!date) {
    return '';
  }

  const o: Record<string, any> = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S+': date.getMilliseconds(),
  };

  let formattedDate = pattern; // Start with the pattern

  // Year Handling
  const yearMatch = formattedDate.match(/(y+)/);
  if (yearMatch) {
    formattedDate = formattedDate.replace(
      yearMatch[0],
      `${date.getFullYear()}`.slice(Math.max(0, 4 - yearMatch[0].length)),
    );
  }

  // Other Formatters
  for (const k in o) {
    const reg = new RegExp(`(${k})`);
    const match = formattedDate.match(reg);
    if (match) {
      formattedDate = formattedDate.replace(
        match[0],
        match[0].length === 1 ? o[k] : `00${o[k]}`.slice(`${o[k]}`.length),
      );
    }
  }

  return formattedDate;
}

/**
 * 不含年的 cron 表达式
 * @param cron
 */
const expressionNoYear = (cron: string) => {
  const vs = cron.split(' ');
  // 长度=== 7 包含年表达式 不解析
  if (vs.length === 7) {
    return vs.slice(0, -1).join(' ');
  }
  return cron;
};

/**
 * 解析cron表达式预计未来运行时间
 * @param cron cron表达式
 */
export function parseCron(cron: string) {
  try {
    const parse = expressionNoYear(cron);
    const iter = CronParser.parse(parse, {
      currentDate: dateFormat(new Date()),
    });
    const result: string[] = [];
    for (let i = 1; i <= 5; i++) {
      const nextDate = iter.next();
      if (nextDate) {
        result.push(dateFormat(new Date(nextDate as any)));
      }
    }

    return result.length > 0 ? result.join('\n') : '无执行时间';
  } catch {
    return '表达式错误';
  }
}

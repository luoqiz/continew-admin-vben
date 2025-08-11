export const dateRangeShortcuts = [
  {
    text: 'Last week',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    },
  },
  {
    text: 'Last month',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    },
  },
  {
    text: 'Last 3 months',
    value: () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    },
  },
];

export const datetimeFutrueShortcuts = [
  {
    text: 'Today',
    value: new Date(),
  },
  {
    text: '明天',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date;
    },
  },
  {
    text: '一星期后',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    },
  },
  {
    text: '两星期后',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 14);
      return date;
    },
  },
  {
    text: '30天后',
    value: () => {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      return date;
    },
  },
];

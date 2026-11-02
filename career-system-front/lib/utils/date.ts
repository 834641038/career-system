import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.locale('zh-cn');
dayjs.extend(isoWeek);

// 获取周ID
export const getWeekId = (date?: Date | string): string => {
  const d = dayjs(date);
  const year = d.year();
  const week = d.isoWeek();
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

// 获取周的起止日期
export const getWeekRange = (date?: Date | string) => {
  const d = dayjs(date);
  return {
    startDate: d.startOf('week').format('YYYY-MM-DD'),
    endDate: d.endOf('week').format('YYYY-MM-DD')
  };
};

// 格式化日期显示
export const formatDateDisplay = (date: string): string => {
  const today = dayjs().format('YYYY-MM-DD');
  const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
  const dayAfterTomorrow = dayjs().add(2, 'day').format('YYYY-MM-DD');
  
  if (date === today) return '今天';
  if (date === tomorrow) return '明天';
  if (date === dayAfterTomorrow) return '后天';
  
  return dayjs(date).format('MM月DD日 ddd');
};

// 格式化时间显示
export const formatTimeDisplay = (time?: string, date?: string): string => {
  if (!time) return '全天';
  
  const today = dayjs().format('YYYY-MM-DD');
  const targetDate = date || today;
  
  if (targetDate === today) {
    return `今天 ${time}`;
  }
  
  if (dayjs(targetDate).diff(today, 'day') === 1) {
    return `明天 ${time}`;
  }
  
  if (dayjs(targetDate).diff(today, 'day') === 2) {
    return `后天 ${time}`;
  }
  
  return `${formatDateDisplay(targetDate)} ${time}`;
};
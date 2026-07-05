/**
 * 格式化工具
 */

/** 格式化秒数为 mm:ss */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/** 格式化日期 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 获取等级对应的颜色 */
export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    L1: '#FF6B6B', // 红色 - 启蒙
    L2: '#FFD93D', // 黄色 - 初级
    L3: '#6BCB77', // 绿色 - 中级
    L4: '#4D96FF', // 蓝色 - 高级
  };
  return colors[level] || '#999';
}

/** 获取掌握状态对应的颜色 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    weak: '#FF6B6B',
    need_improve: '#FFD93D',
    mastered: '#6BCB77',
  };
  return colors[status] || '#999';
}

/** 获取掌握状态对应的文字 */
export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    weak: '薄弱',
    need_improve: '需加强',
    mastered: '已掌握',
  };
  return texts[status] || status;
}

import React from 'react';

interface ProgressBarProps {
  current: number;
  total: number;
  phase: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, phase }) => {
  const percentage = Math.round((current / total) * 100);
  const phaseLabel = phase === 'baseline' ? '摸底环节' : '自适应环节';

  return (
    <div style={{ marginBottom: 'var(--space-md)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-xs)',
      }}>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--color-text-light)' }}>
          {phaseLabel} · 第 {current}/{total} 题
        </span>
        <span style={{ fontSize: 'var(--font-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
          {percentage}%
        </span>
      </div>
      <div style={{
        width: '100%',
        height: 8,
        background: 'var(--color-border)',
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${percentage}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--color-primary-light), var(--color-primary))',
          borderRadius: 'var(--radius-full)',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  );
};

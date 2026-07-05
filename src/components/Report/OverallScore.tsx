import React from 'react';
import { getLevelColor } from '../../utils/format';
import type { OverallAssessment } from '../../types/assessment';

interface OverallScoreProps {
  overall: OverallAssessment;
}

export const OverallScore: React.FC<OverallScoreProps> = ({ overall }) => {
  const levelColor = getLevelColor(overall.level);

  return (
    <div style={{
      textAlign: 'center',
      padding: 'var(--space-xl) var(--space-md)',
      background: `linear-gradient(135deg, ${levelColor}15, ${levelColor}05)`,
      borderRadius: 'var(--radius-lg)',
      marginBottom: 'var(--space-lg)',
    }}>
      {/* 等级大圆 */}
      <div style={{
        width: 120,
        height: 120,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${levelColor}, ${levelColor}cc)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto var(--space-md)',
        color: '#fff',
        boxShadow: `0 8px 24px ${levelColor}40`,
      }}>
        <span style={{ fontSize: '2rem', fontWeight: 800 }}>{overall.level}</span>
        <span style={{ fontSize: 'var(--font-xs)' }}>{overall.levelName}</span>
      </div>

      {/* 得分 */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <span style={{
          fontSize: 'var(--font-3xl)',
          fontWeight: 800,
          color: levelColor,
        }}>
          {overall.score}
        </span>
        <span style={{
          fontSize: 'var(--font-md)',
          color: 'var(--color-text-muted)',
        }}>
          /100 分
        </span>
      </div>

      {/* 置信区间 */}
      <div style={{
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)',
        marginBottom: 'var(--space-md)',
      }}>
        置信区间：{overall.confidenceInterval[0]} - {overall.confidenceInterval[1]}
      </div>

      {/* 等级对照 */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: 'var(--space-lg)',
        fontSize: 'var(--font-sm)',
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm) var(--space-md)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>英皇乐理</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{overall.abrsmEquivalent}</div>
        </div>
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm) var(--space-md)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-xs)' }}>央音音基</div>
          <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{overall.ccomEquivalent}</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { getStatusColor, getStatusText } from '../../utils/format';
import type { DimensionDetail } from '../../types/assessment';

interface DimensionDetailProps {
  dimension: DimensionDetail;
}

export const DimensionDetailCard: React.FC<DimensionDetailProps> = ({ dimension }) => {
  const statusColor = getStatusColor(dimension.status);

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-md)',
      boxShadow: 'var(--shadow-sm)',
      border: `1px solid var(--color-border)`,
    }}>
      {/* 标题行 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-sm)',
      }}>
        <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
          {dimension.name}
        </span>
        <span style={{
          padding: '2px 10px',
          borderRadius: 'var(--radius-full)',
          background: `${statusColor}20`,
          color: statusColor,
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
        }}>
          {getStatusText(dimension.status)}
        </span>
      </div>

      {/* 得分条 */}
      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 'var(--font-xs)',
          color: 'var(--color-text-muted)',
          marginBottom: 4,
        }}>
          <span>得分</span>
          <span>{dimension.score}% ({dimension.correctCount}/{dimension.totalCount})</span>
        </div>
        <div style={{
          width: '100%',
          height: 6,
          background: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${dimension.score}%`,
            height: '100%',
            background: statusColor,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* 稳定等级 */}
      <div style={{
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)',
        marginBottom: dimension.weakSubTopics.length > 0 ? 'var(--space-sm)' : 0,
      }}>
        稳定等级：L{dimension.stableLevel}
      </div>

      {/* 薄弱子知识点 */}
      {dimension.weakSubTopics.length > 0 && (
        <div style={{
          borderTop: '1px solid var(--color-border)',
          paddingTop: 'var(--space-sm)',
        }}>
          {dimension.weakSubTopics.map(wst => (
            <div key={wst.id} style={{
              marginBottom: 'var(--space-xs)',
              fontSize: 'var(--font-xs)',
            }}>
              <span style={{
                display: 'inline-block',
                padding: '2px 6px',
                borderRadius: 4,
                background: 'rgba(255, 107, 107, 0.1)',
                color: 'var(--color-danger)',
                marginRight: 'var(--space-xs)',
              }}>
                {wst.name}（{wst.accuracy}%）
              </span>
              <span style={{ color: 'var(--color-text-muted)' }}>
                → {wst.suggestion}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

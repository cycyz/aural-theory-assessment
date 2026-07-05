import React from 'react';
import type { AbilityProfile } from '../../types/assessment';

interface ProfileCardProps {
  profile: AbilityProfile;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile }) => {
  return (
    <div style={{
      background: 'var(--color-bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-lg)',
      boxShadow: 'var(--shadow-md)',
      marginBottom: 'var(--space-lg)',
    }}>
      <h4 style={{
        fontSize: 'var(--font-md)',
        fontWeight: 600,
        color: 'var(--color-text)',
        marginBottom: 'var(--space-md)',
      }}>
        🎯 能力画像
      </h4>

      {/* 优势 */}
      {profile.strengths.length > 0 && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <h5 style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--color-success)',
            marginBottom: 'var(--space-xs)',
          }}>
            ✨ 优势项
          </h5>
          <ul style={{
            listStyle: 'none',
            padding: 0,
          }}>
            {profile.strengths.map((s, i) => (
              <li key={i} style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text)',
                padding: 'var(--space-xs) 0',
                paddingLeft: 'var(--space-md)',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--color-success)',
                }}>•</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 薄弱 */}
      {profile.weaknesses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <h5 style={{
            fontSize: 'var(--font-sm)',
            color: 'var(--color-danger)',
            marginBottom: 'var(--space-xs)',
          }}>
            ⚠️ 需要加强
          </h5>
          <ul style={{
            listStyle: 'none',
            padding: 0,
          }}>
            {profile.weaknesses.map((w, i) => (
              <li key={i} style={{
                fontSize: 'var(--font-sm)',
                color: 'var(--color-text)',
                padding: 'var(--space-xs) 0',
                paddingLeft: 'var(--space-md)',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--color-danger)',
                }}>•</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 建议 */}
      <div>
        <h5 style={{
          fontSize: 'var(--font-sm)',
          color: 'var(--color-primary)',
          marginBottom: 'var(--space-xs)',
        }}>
          💡 学习建议
        </h5>
        <ul style={{
          listStyle: 'none',
          padding: 0,
        }}>
          {profile.recommendations.map((r, i) => (
            <li key={i} style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text)',
              padding: 'var(--space-xs) 0',
              paddingLeft: 'var(--space-md)',
              position: 'relative',
              lineHeight: 1.5,
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                color: 'var(--color-primary)',
              }}>{i + 1}.</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

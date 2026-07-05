import React, { useState } from 'react';
import { Button } from '../common/Button';
import type { StudentInfo } from '../../types/assessment';

interface WelcomeProps {
  onStart: (info: StudentInfo) => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [instrument, setInstrument] = useState('');

  const handleStart = () => {
    if (!name.trim()) return;
    onStart({
      name: name.trim(),
      grade: grade || undefined,
      instrument: instrument || undefined,
    });
  };

  return (
    <div style={{
      maxWidth: 480,
      margin: '0 auto',
      padding: 'var(--space-xl) var(--space-md)',
      textAlign: 'center',
    }}>
      {/* Logo/标题区域 */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <div style={{
          fontSize: '4rem',
          marginBottom: 'var(--space-md)',
        }}>
          🎵
        </div>
        <h1 style={{
          fontSize: 'var(--font-2xl)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-sm)',
        }}>
          视唱练耳与乐理水平评估
        </h1>
        <p style={{
          color: 'var(--color-text-light)',
          fontSize: 'var(--font-sm)',
          lineHeight: 1.6,
        }}>
          24道趣味选择题 · 约15-20分钟<br />
          快速了解你的乐理水平，发现需要加强的地方 ✨
        </p>
      </div>

      {/* 信息填写卡片 */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'left',
      }}>
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-xs)',
          }}>
            你的名字/昵称 <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="请输入你的名字"
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border)',
              fontSize: 'var(--font-md)',
              fontFamily: 'inherit',
              outline: 'none',
              transition: 'border-color var(--transition-fast)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
          />
        </div>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-xs)',
          }}>
            年级（选填）
          </label>
          <select
            value={grade}
            onChange={e => setGrade(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border)',
              fontSize: 'var(--font-md)',
              fontFamily: 'inherit',
              outline: 'none',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="">请选择年级</option>
            <option value="1年级">一年级</option>
            <option value="2年级">二年级</option>
            <option value="3年级">三年级</option>
            <option value="4年级">四年级</option>
            <option value="5年级">五年级</option>
            <option value="6年级">六年级</option>
          </select>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--font-sm)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 'var(--space-xs)',
          }}>
            学习的乐器（选填）
          </label>
          <select
            value={instrument}
            onChange={e => setInstrument(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border)',
              fontSize: 'var(--font-md)',
              fontFamily: 'inherit',
              outline: 'none',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            <option value="">请选择乐器</option>
            <option value="钢琴">钢琴</option>
            <option value="小提琴">小提琴</option>
            <option value="大提琴">大提琴</option>
            <option value="吉他">吉他</option>
            <option value="长笛">长笛</option>
            <option value="单簧管">单簧管</option>
            <option value="声乐">声乐</option>
            <option value="其他">其他乐器</option>
            <option value="无">没有学乐器</option>
          </select>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleStart}
          disabled={!name.trim()}
        >
          开始评估 🚀
        </Button>
      </div>

      {/* 底部说明 */}
      <div style={{
        marginTop: 'var(--space-lg)',
        padding: 'var(--space-md)',
        background: 'rgba(77, 150, 255, 0.06)',
        borderRadius: 'var(--radius-md)',
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-light)',
        lineHeight: 1.6,
      }}>
        <p style={{ fontWeight: 600, marginBottom: 'var(--space-xs)' }}>📋 评估说明</p>
        <p>• 共24道题，分为六个方面：音高、节奏、音程、和弦、术语、视谱</p>
        <p>• 系统会根据你的答题情况自动调整难度</p>
        <p>• 完成后会生成详细的评估报告，告诉你对应什么等级、哪里需要加强</p>
        <p>• 参考标准：英皇乐理（ABRSM）和中央音乐学院音基考级大纲</p>
      </div>
    </div>
  );
};

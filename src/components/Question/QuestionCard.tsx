import React, { useState, useEffect } from 'react';
import type { Question as QuestionData } from '../../types/question';
import { DIMENSION_NAMES, DIFFICULTY_NAMES, AssessmentPhase } from '../../types/enums';
import { useAudio } from '../../hooks/useAudio';
import { ProgressBar } from './ProgressBar';
import { AudioPlayButton } from './AudioPlayButton';
import { NotationDisplay } from './NotationDisplay';
import { OptionButton } from './OptionButton';
import { Button } from '../common/Button';

interface QuestionCardProps {
  question: QuestionData;
  questionIndex: number;
  totalQuestions: number;
  phase: AssessmentPhase;
  onSubmit: (selectedOptionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  totalQuestions,
  phase,
  onSubmit,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { play, stop, reset, isPlaying, remainingPlays, canPlay } = useAudio(3);

  // 新题目时重置状态
  useEffect(() => {
    setSelectedId(null);
    setShowResult(false);
    reset();
    // 自动播放音频
    if (question.stem.audio) {
      play(question.stem.audio);
    }
  }, [question.id]);

  const handleOptionClick = (id: string) => {
    if (showResult) return;
    setSelectedId(id);
  };

  const handleConfirm = () => {
    if (!selectedId) return;
    setShowResult(true);
    stop();
  };

  const handleNext = () => {
    if (!selectedId) return;
    onSubmit(selectedId);
  };

  const isCorrect = selectedId === question.correctOptionId;
  const phaseLabel = phase === AssessmentPhase.BASELINE ? '摸底' : '自适应';

  return (
    <div style={{
      maxWidth: 560,
      margin: '0 auto',
      padding: 'var(--space-md)',
    }}>
      <ProgressBar
        current={questionIndex}
        total={totalQuestions}
        phase={phase === AssessmentPhase.BASELINE ? 'baseline' : 'adaptive'}
      />

      {/* 维度标签 */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-md)',
      }}>
        <span style={{
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(77, 150, 255, 0.1)',
          color: 'var(--color-primary)',
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
        }}>
          {DIMENSION_NAMES[question.dimension]}
        </span>
        <span style={{
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 107, 107, 0.1)',
          color: 'var(--color-danger)',
          fontSize: 'var(--font-xs)',
          fontWeight: 600,
        }}>
          {DIFFICULTY_NAMES[question.difficulty]}
        </span>
      </div>

      {/* 题目卡片 */}
      <div style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        boxShadow: 'var(--shadow-md)',
      }}>
        {/* 题干 */}
        <h3 style={{
          fontSize: 'var(--font-lg)',
          color: 'var(--color-text)',
          marginBottom: 'var(--space-md)',
          lineHeight: 1.6,
        }}>
          {question.stem.text}
        </h3>

        {/* 乐谱展示 */}
        {question.stem.notation && (
          <NotationDisplay notationId={question.stem.notation} />
        )}

        {/* 音频播放 */}
        {question.stem.audio && (
          <AudioPlayButton
            onPlay={() => play(question.stem.audio!)}
            canPlay={canPlay}
            isPlaying={isPlaying}
            remainingPlays={remainingPlays}
            label="播放音频"
          />
        )}

        {/* 选项 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {question.options.map(option => (
            <OptionButton
              key={option.id}
              id={option.id}
              text={option.text}
              notation={option.notation}
              isSelected={selectedId === option.id}
              showResult={showResult}
              isCorrect={option.id === question.correctOptionId}
              isAnswer={option.id === question.correctOptionId}
              onClick={handleOptionClick}
            />
          ))}
        </div>

        {/* 解析 */}
        {showResult && (
          <div style={{
            marginTop: 'var(--space-md)',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            background: isCorrect
              ? 'rgba(107, 203, 119, 0.1)'
              : 'rgba(255, 107, 107, 0.1)',
            border: `1px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}`,
          }}>
            <p style={{
              fontWeight: 600,
              color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)',
              marginBottom: 'var(--space-xs)',
            }}>
              {isCorrect ? '✅ 回答正确！' : '❌ 回答错误'}
            </p>
            <p style={{
              fontSize: 'var(--font-sm)',
              color: 'var(--color-text-light)',
              lineHeight: 1.5,
            }}>
              {question.explanation}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div style={{
          marginTop: 'var(--space-lg)',
          display: 'flex',
          justifyContent: 'center',
        }}>
          {!showResult ? (
            <Button
              variant="primary"
              size="lg"
              onClick={handleConfirm}
              disabled={!selectedId}
            >
              确认答案 ✓
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleNext}
            >
              {questionIndex < totalQuestions ? '下一题 →' : '查看报告 📊'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { renderNotation, hasNotationDef } from '../../utils/notation';

interface OptionButtonProps {
  id: string;
  text?: string;
  notation?: string;
  isSelected?: boolean;
  isCorrect?: boolean | null;
  showResult?: boolean;
  isAnswer?: boolean;
  onClick: (id: string) => void;
}

export const OptionButton: React.FC<OptionButtonProps> = ({
  id,
  text,
  notation,
  isSelected = false,
  isCorrect = null,
  showResult = false,
  isAnswer = false,
  onClick,
}) => {
  const [notationSvg, setNotationSvg] = useState<string>('');

  useEffect(() => {
    if (notation && hasNotationDef(notation)) {
      try {
        const svg = renderNotation(notation);
        setNotationSvg(svg);
      } catch {
        setNotationSvg('');
      }
    } else {
      setNotationSvg('');
    }
  }, [notation]);

  let borderColor = 'var(--color-border)';
  let bgColor = '#fff';
  let textColor = 'var(--color-text)';

  if (showResult) {
    if (isAnswer) {
      borderColor = 'var(--color-success)';
      bgColor = 'rgba(107, 203, 119, 0.1)';
      textColor = 'var(--color-success)';
    } else if (isSelected && !isCorrect) {
      borderColor = 'var(--color-danger)';
      bgColor = 'rgba(255, 107, 107, 0.1)';
      textColor = 'var(--color-danger)';
    }
  } else if (isSelected) {
    borderColor = 'var(--color-primary)';
    bgColor = 'rgba(77, 150, 255, 0.08)';
  }

  return (
    <button
      onClick={() => onClick(id)}
      disabled={showResult}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        padding: '14px 16px',
        borderRadius: 'var(--radius-md)',
        border: `2px solid ${borderColor}`,
        background: bgColor,
        color: textColor,
        fontSize: 'var(--font-md)',
        fontWeight: isSelected ? 600 : 400,
        cursor: showResult ? 'default' : 'pointer',
        transition: 'all var(--transition-fast)',
        textAlign: 'left',
      }}
    >
      <span style={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: isSelected ? borderColor : 'var(--color-bg)',
        color: isSelected ? '#fff' : 'var(--color-text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 'var(--font-sm)',
        fontWeight: 600,
        flexShrink: 0,
      }}>
        {id}
      </span>
      <span>
        {text}
        {notation && notationSvg && (
          <span style={{
            display: 'block',
            marginTop: 'var(--space-xs)',
          }}
            dangerouslySetInnerHTML={{ __html: notationSvg }}
          />
        )}
        {notation && !notationSvg && (
          <span style={{
            display: 'block',
            fontSize: 'var(--font-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-xs)',
          }}>
            🎼 {notation}
          </span>
        )}
      </span>
      {showResult && isAnswer && (
        <span style={{ marginLeft: 'auto', fontSize: 'var(--font-lg)' }}>✅</span>
      )}
      {showResult && isSelected && !isCorrect && (
        <span style={{ marginLeft: 'auto', fontSize: 'var(--font-lg)' }}>❌</span>
      )}
    </button>
  );
};

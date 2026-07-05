import React from 'react';

interface AudioPlayButtonProps {
  onPlay: () => void;
  canPlay: boolean;
  isPlaying: boolean;
  remainingPlays: number;
  label?: string;
}

export const AudioPlayButton: React.FC<AudioPlayButtonProps> = ({
  onPlay,
  canPlay,
  isPlaying,
  remainingPlays,
  label = '播放音频',
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-sm)',
      marginBottom: 'var(--space-md)',
    }}>
      <button
        onClick={onPlay}
        disabled={!canPlay}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 24px',
          borderRadius: 'var(--radius-full)',
          border: '2px solid var(--color-primary)',
          background: isPlaying ? 'var(--color-primary)' : '#fff',
          color: isPlaying ? '#fff' : 'var(--color-primary)',
          fontSize: 'var(--font-md)',
          fontWeight: 600,
          cursor: canPlay ? 'pointer' : 'not-allowed',
          opacity: canPlay ? 1 : 0.5,
          transition: 'all var(--transition-fast)',
        }}
      >
        {isPlaying ? '🔊' : '🔈'} {label}
      </button>
      <span style={{
        fontSize: 'var(--font-xs)',
        color: 'var(--color-text-muted)',
      }}>
        {isPlaying ? '正在播放...' : `还可播放 ${remainingPlays} 次`}
      </span>
    </div>
  );
};

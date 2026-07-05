import React, { useRef, useEffect, useState } from 'react';
import { renderNotation, hasNotationDef } from '../../utils/notation';

interface NotationDisplayProps {
  notationId?: string;
  /** 额外样式 */
  style?: React.CSSProperties;
}

/**
 * 乐谱展示组件
 *
 * 使用 VexFlow 将 notation ID 渲染为真实五线谱 SVG。
 * 通过 useRef + useEffect 在挂载后渲染，避免 VexFlow 需要真实 DOM 的问题。
 */
export const NotationDisplay: React.FC<NotationDisplayProps> = ({
  notationId,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    if (!notationId || !hasNotationDef(notationId)) {
      setSvgContent('');
      return;
    }

    // 延迟渲染，确保 DOM 已挂载
    const timer = setTimeout(() => {
      try {
        const svg = renderNotation(notationId);
        setSvgContent(svg);
      } catch (e) {
        console.error('NotationDisplay render error:', e);
        setSvgContent('');
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [notationId]);

  if (!notationId || !svgContent) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        background: '#fafaf8',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        display: 'flex',
        justifyContent: 'center',
        overflow: 'hidden',
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
};

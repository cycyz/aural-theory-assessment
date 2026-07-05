/**
 * 乐谱渲染工具
 *
 * 使用 VexFlow 5.x EasyScore API 将乐谱定义渲染为 SVG。
 */

import { Factory } from 'vexflow';
import { NOTATION_DEFS, hasNotationDef } from './notationDefinitions';
import type { NotationDef } from './notationDefinitions';

/**
 * 将乐谱定义渲染为 SVG 字符串
 */
export function renderNotation(id: string): string {
  const def = NOTATION_DEFS[id];
  if (!def) {
    return `<div style="padding:20px;text-align:center;color:#999;">🎼 ${id}</div>`;
  }

  try {
    if (def.grandStaff) {
      return renderGrandStaff(def);
    }
    return renderSingleStave(def);
  } catch (e) {
    console.error(`VexFlow render error for "${id}":`, e);
    return `<div style="padding:20px;text-align:center;color:#c33;">⚠️ 乐谱渲染失败: ${id}</div>`;
  }
}

/**
 * 构建 EasyScore 音符字符串（含调号和拍号）
 */
function buildEasyScore(def: NotationDef): string {
  let score = '';

  // 调号：如 'key(G)'
  if (def.key && def.key !== 'C') {
    score += `key(${def.key}) `;
  }

  // 拍号：如 'time=4/4'
  if (def.timeSignature) {
    score += `time=${def.timeSignature} `;
  }

  // 谱号 + 音符
  score += `clef=${def.clef} ${def.notes}`;

  return score.trim();
}

/**
 * 渲染单谱表乐谱
 */
function renderSingleStave(def: NotationDef): string {
  const containerId = 'vf-' + Math.random().toString(36).slice(2, 8);

  const container = document.createElement('div');
  container.id = containerId;
  container.style.width = def.width + 'px';
  container.style.height = def.height + 'px';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  try {
    const vf = new Factory({
      renderer: { elementId: containerId, width: def.width, height: def.height },
    });

    const score = vf.EasyScore();
    const system = vf.System({ width: def.width - 20 });

    const scoreStr = buildEasyScore(def);

    system.addStave({
      voices: [score.voice(score.notes(scoreStr))],
    });

    vf.draw();

    const svgEl = container.querySelector('svg');
    const svg = svgEl ? svgEl.outerHTML : '';

    document.body.removeChild(container);
    return svg || `<div style="padding:20px;text-align:center;color:#c33;">⚠️ SVG 为空</div>`;
  } catch (e) {
    if (container.parentNode) document.body.removeChild(container);
    throw e;
  }
}

/**
 * 渲染大谱表（钢琴谱）
 */
function renderGrandStaff(def: NotationDef): string {
  const containerId = 'vf-gs-' + Math.random().toString(36).slice(2, 8);

  const container = document.createElement('div');
  container.id = containerId;
  container.style.width = def.width + 'px';
  container.style.height = (def.height + 20) + 'px';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  document.body.appendChild(container);

  try {
    const vf = new Factory({
      renderer: { elementId: containerId, width: def.width, height: def.height + 20 },
    });

    const score = vf.EasyScore();
    const system = vf.System({ width: def.width - 20 });

    // 高音谱号空谱
    system.addStave({
      voices: [score.voice(score.notes('clef=treble B4/w/r'))],
    });

    // 低音谱号 + 目标音符
    const bassScore = buildEasyScore(def).replace(`clef=${def.clef}`, 'clef=bass');
    system.addStave({
      voices: [score.voice(score.notes(bassScore))],
    });

    system.addConnector('brace');
    system.addConnector('single');

    vf.draw();

    const svgEl = container.querySelector('svg');
    const svg = svgEl ? svgEl.outerHTML : '';

    document.body.removeChild(container);
    return svg || '';
  } catch (e) {
    if (container.parentNode) document.body.removeChild(container);
    throw e;
  }
}

/**
 * 渲染多段乐谱对比
 */
export function renderMultiNotation(ids: string[]): string[] {
  return ids.map(id => renderNotation(id));
}

export { hasNotationDef, NOTATION_DEFS };

/**
 * 乐谱渲染定义文件
 *
 * 为题库中 36 个 notation ID 定义 VexFlow 渲染参数。
 * 使用 VexFlow 5.x EasyScore API 简化渲染。
 */

import type { RenderContext } from 'vexflow';

/** 谱号类型 */
type ClefType = 'treble' | 'bass';

/** 渲染定义 */
export interface NotationDef {
  /** 乐谱宽度 */
  width: number;
  /** 乐谱高度 */
  height: number;
  /** 谱号 */
  clef: ClefType;
  /** EasyScore 音符字符串，如 'C4/q, D4/q, E4/q, F4/q' */
  notes: string;
  /** 调号（如 'G' 表示 G大调 1升号, 'Bb' 表示 Bb大调 2降号, '' 表示 C大调） */
  key?: string;
  /** 拍号，如 '4/4' */
  timeSignature?: string;
  /** 是否为大谱表（双谱号钢琴谱） */
  grandStaff?: boolean;
}

/**
 * 所有 notation ID 的渲染定义映射
 */
export const NOTATION_DEFS: Record<string, NotationDef> = {

  // ═══════════════════════════════════════
  // D1 音高辨识 — 单音音符（9个）
  // ═══════════════════════════════════════

  /** 高音谱号 下加一线 = C4（中央C） */
  treble_c4: {
    width: 180, height: 120, clef: 'treble',
    notes: 'C4/w',
  },

  /** 高音谱号 第一线 = E4 */
  treble_e4: {
    width: 180, height: 120, clef: 'treble',
    notes: 'E4/w',
  },

  /** 高音谱号 上加二线 = C6 */
  treble_c6: {
    width: 180, height: 140, clef: 'treble',
    notes: 'C6/w',
  },

  /** 低音谱号 第四间 = G2 */
  bass_g2: {
    width: 180, height: 120, clef: 'bass',
    notes: 'G2/w',
  },

  /** 高音谱号 下加二线 = A3 */
  treble_a3: {
    width: 180, height: 130, clef: 'treble',
    notes: 'A3/w',
  },

  /** 高音谱号 上加三间 = E6 */
  treble_e6: {
    width: 180, height: 150, clef: 'treble',
    notes: 'E6/w',
  },

  /** 低音谱号 上加一线 = C4（中央C） */
  bass_c4: {
    width: 180, height: 130, clef: 'bass',
    notes: 'C4/w',
  },

  /** 大谱表中低音谱号上加三间 = E4 */
  grand_staff_bass: {
    width: 240, height: 200, clef: 'bass',
    notes: 'E4/w',
    grandStaff: true,
  },

  /** 高音谱号 上加四线 = E6 */
  treble_e6_ledger: {
    width: 180, height: 150, clef: 'treble',
    notes: 'E6/w',
  },

  // ═══════════════════════════════════════
  // D6 视谱能力 — 简单旋律（8个）
  // ═══════════════════════════════════════

  /** C大调 简单旋律 4小节 */
  c_major_simple_01: {
    width: 420, height: 130, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F4/q, G4/q, F4/q, E4/q, C4/h',
    key: 'C', timeSignature: '4/4',
  },

  /** C大调 五音旋律 C-D-E-F-G */
  c_major_pentatonic: {
    width: 360, height: 130, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F4/q, G4/h',
    key: 'C', timeSignature: '4/4',
  },

  /** C大调 上行旋律片段 */
  c_major_ascending: {
    width: 300, height: 130, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F4/q, G4/q, A4/q, B4/q, C5/h',
    key: 'C', timeSignature: '4/4',
  },

  /** G大调 旋律（1个升号 F#） */
  g_major_melody: {
    width: 380, height: 130, clef: 'treble',
    notes: 'G4/q, A4/q, B4/q, C5/q, D5/q, C5/q, B4/q, G4/h',
    key: 'G', timeSignature: '4/4',
  },

  /** G大调旋律第一个音 */
  g_major_first_note: {
    width: 200, height: 120, clef: 'treble',
    notes: 'G4/w',
    key: 'G',
  },

  /** Bb大调 旋律（2个降号 Bb Eb） */
  bb_major_melody: {
    width: 380, height: 130, clef: 'treble',
    notes: 'Bb4/q, C5/q, D5/q, Eb5/q, F5/q, Eb5/q, D5/q, Bb4/h',
    key: 'Bb', timeSignature: '4/4',
  },

  /** 含临时记号的旋律 */
  accidental_melody: {
    width: 380, height: 130, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F#4/q, G4/q, F4##/q, E4/q, C4/h',
    key: 'C', timeSignature: '4/4',
  },

  /** 含切分节奏和十六分音符的旋律 */
  complex_rhythm_sight: {
    width: 420, height: 130, clef: 'treble',
    notes: 'C4/q, D4/8, E4/8, F4/q, G4/8, A4/8, Bb4/q, C5/h',
    key: 'C', timeSignature: '4/4',
  },

  // ═══════════════════════════════════════
  // D6 视谱能力 — 模进选项组（12个）
  // ═══════════════════════════════════════

  /** 模进原题 前2小节 */
  sequence_01: {
    width: 200, height: 120, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F4/q',
    key: 'C', timeSignature: '4/4',
  },
  /** 模进选项A（正确：上移二度） */
  sequence_01_a: {
    width: 200, height: 120, clef: 'treble',
    notes: 'D4/q, E4/q, F4/q, G4/q',
    key: 'C', timeSignature: '4/4',
  },
  /** 模进选项B */
  sequence_01_b: {
    width: 200, height: 120, clef: 'treble',
    notes: 'C4/q, D4/q, F4/q, E4/q',
    key: 'C', timeSignature: '4/4',
  },
  /** 模进选项C */
  sequence_01_c: {
    width: 200, height: 120, clef: 'treble',
    notes: 'C4/q, C4/q, D4/q, E4/q',
    key: 'C', timeSignature: '4/4',
  },
  /** 模进选项D */
  sequence_01_d: {
    width: 200, height: 120, clef: 'treble',
    notes: 'E4/q, D4/q, C4/q, B3/q',
    key: 'C', timeSignature: '4/4',
  },

  /** 下移二度模进原题 */
  sequence_down_01: {
    width: 200, height: 120, clef: 'treble',
    notes: 'G4/q, A4/q, B4/q, C5/q',
    key: 'C', timeSignature: '4/4',
  },
  sequence_down_01_a: {
    width: 200, height: 120, clef: 'treble',
    notes: 'F4/q, G4/q, A4/q, Bb4/q',
    key: 'C', timeSignature: '4/4',
  },
  sequence_down_01_b: {
    width: 200, height: 120, clef: 'treble',
    notes: 'A4/q, B4/q, C5/q, D5/q',
    key: 'C', timeSignature: '4/4',
  },
  sequence_down_01_c: {
    width: 200, height: 120, clef: 'treble',
    notes: 'G4/q, A4/q, C5/q, B4/q',
    key: 'C', timeSignature: '4/4',
  },
  sequence_down_01_d: {
    width: 200, height: 120, clef: 'treble',
    notes: 'G4/q, G4/q, A4/q, B4/q',
    key: 'C', timeSignature: '4/4',
  },

  /** 模进分析题 */
  sequence_analyze_01: {
    width: 380, height: 130, clef: 'treble',
    notes: 'C4/q, E4/q, G4/q, C5/q, D4/q, F4/q, A4/q, D5/q',
    key: 'C', timeSignature: '4/4',
  },

  // ═══════════════════════════════════════
  // D6 视谱能力 — 移调+其他（7个）
  // ═══════════════════════════════════════

  /** 移调原题旋律 */
  transpose_octave: {
    width: 320, height: 130, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F4/q, G4/q, F4/q, E4/q, C4/h',
    key: 'C', timeSignature: '4/4',
  },
  transpose_octave_a: {
    width: 320, height: 130, clef: 'bass',
    notes: 'C3/q, D3/q, E3/q, F3/q, G3/q, F3/q, E3/q, C3/h',
    key: 'C', timeSignature: '4/4',
  },
  transpose_octave_b: {
    width: 320, height: 130, clef: 'bass',
    notes: 'C4/q, D4/q, E4/q, F4/q, G4/q, F4/q, E4/q, C4/h',
    key: 'C', timeSignature: '4/4',
  },
  transpose_octave_c: {
    width: 320, height: 130, clef: 'bass',
    notes: 'C2/q, D2/q, E2/q, F2/q, G2/q, F2/q, E2/q, C2/h',
    key: 'C', timeSignature: '4/4',
  },
  transpose_octave_d: {
    width: 320, height: 130, clef: 'bass',
    notes: 'C3/q, E3/q, G3/q, C4/q, G3/q, E3/q, C3/q, C3/h',
    key: 'C', timeSignature: '4/4',
  },

  /** 转调分析 临时记号 */
  modulation_temp: {
    width: 380, height: 130, clef: 'treble',
    notes: 'C4/q, D4/q, E4/q, F#4/q, G4/q, A4/q, B4/q, C5/h',
    key: 'C', timeSignature: '4/4',
  },

  /** Ab大调旋律结束音 */
  ab_major_ending: {
    width: 340, height: 130, clef: 'treble',
    notes: 'Ab4/q, Bb4/q, C5/q, Db5/q, Eb5/q, Db5/q, C5/q, Ab4/h',
    key: 'Ab', timeSignature: '4/4',
  },

  // ═══════════════════════════════════════
  // 节奏谱（1个）
  // ═══════════════════════════════════════

  /** 节奏读法谱 ta ta ti-ti ta */
  rhythm_reading_01: {
    width: 320, height: 120, clef: 'treble',
    notes: 'B4/q, B4/q, B4/8, B4/8, B4/q',
    key: 'C', timeSignature: '4/4',
  },
};

/**
 * 检查 notation ID 是否有定义
 */
export function hasNotationDef(id: string): boolean {
  return id in NOTATION_DEFS;
}

/**
 * 获取所有已定义的 notation ID
 */
export function getNotationIds(): string[] {
  return Object.keys(NOTATION_DEFS);
}

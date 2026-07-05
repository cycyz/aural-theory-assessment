import { AudioEngine, getAudioEngine, PlaybackState } from './AudioEngine';
import { NoteSynthesizer, getSynthesizer } from './NoteSynthesizer';

/**
 * 题目音频播放器
 *
 * 播放策略：
 * 1. 优先检查是否为内置合成指令（零依赖，实时合成）
 * 2. 否则尝试加载预生成音频文件（兜底方案）
 */

/** 音频素材路径常量 */
export const AUDIO_PATHS = {
  notes: (pitch: string) => `/audio/notes/${pitch}.ogg`,
  melodicInterval: (note1: string, note2: string) =>
    `/audio/intervals/melodic_${note1}_${note2}.ogg`,
  harmonicInterval: (note1: string, note2: string) =>
    `/audio/intervals/harmonic_${note1}_${note2}.ogg`,
  chord: (notes: string[]) => `/audio/chords/${notes.join('_')}.ogg`,
  rhythm: (id: string) => `/audio/rhythms/${id}.ogg`,
  melody: (id: string) => `/audio/melodies/${id}.ogg`,
};

/** 音高到频率映射 */
export const NOTE_FREQUENCIES: Record<string, number> = {
  'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56,
  'E3': 164.81, 'F3': 174.61, 'F#3': 185.00, 'G3': 196.00,
  'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
  'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
  'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
  'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
  'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
  'G#5': 830.61, 'A5': 880.00,
};

/**
 * 题库音频路径 → 合成指令映射表
 *
 * 将题库中引用的虚拟音频路径映射到 Web Audio API 实时合成指令。
 * 新增听力题时只需在此表中添加映射即可，无需制作音频文件。
 */
const SYNTHESIS_MAP: Record<string, (synth: NoteSynthesizer) => void> = {
  // ========== D1 音高辨识 ==========
  '/audio/notes/pitch_up.ogg': (s) => {
    // 播放两个音：C4 然后 E4（上行，第二个更高）
    s.playNote('C4', 0, 0.6, 0.7);
    s.playNote('E4', 0.8, 0.6, 0.7);
  },

  // ========== D2 节奏感知 ==========
  '/audio/rhythms/rhythm_simple_01.ogg': (s) => {
    // 四分音符均匀节奏：♩ ♩ ♩ ♩
    s.playRhythm([1, 0.5, 0.5, 0.5], 120, 0.8);
  },

  // ========== D3 音程听辨 ==========
  '/audio/intervals/melodic_C4_C4.ogg': (s) => {
    // 同度：两个相同的 C4
    s.playMelodicInterval('C4', 'C4', 0.6, 0.4);
  },
  '/audio/intervals/melodic_C4_C5.ogg': (s) => {
    // 八度：C4 → C5
    s.playMelodicInterval('C4', 'C5', 0.6, 0.4);
  },
  '/audio/intervals/melodic_C4_D4.ogg': (s) => {
    // 二度：C4 → D4（邻居音）
    s.playMelodicInterval('C4', 'D4', 0.6, 0.3);
  },
  '/audio/intervals/melodic_C4_E4.ogg': (s) => {
    // 三度：C4 → E4
    s.playMelodicInterval('C4', 'E4', 0.6, 0.3);
  },
  '/audio/intervals/melodic_C4_G4.ogg': (s) => {
    // 五度：C4 → G4
    s.playMelodicInterval('C4', 'G4', 0.6, 0.3);
  },
  '/audio/intervals/harmonic_C4_G4.ogg': (s) => {
    // 纯五度和声音程：C4 和 G4 同时奏出
    s.playChord(['C4', 'G4'], 0, 1.2, 0.6);
  },
  '/audio/melodies/interval_test_01.ogg': (s) => {
    // 纯四度旋律：C4 → F4 → F4（模拟《婚礼进行曲》开头）
    s.playNote('C4', 0, 0.5);
    s.playNote('F4', 0.6, 0.8);
    s.playNote('F4', 1.5, 0.6);
  },

  // ========== D4 和弦与调式 ==========
  '/audio/melodies/major_happy.ogg': (s) => {
    // C大调上行旋律（明亮快乐）：C4-E4-G4-C5
    s.playMelody(['C4', 'E4', 'G4', 'C5'], 0.35, 0.1);
  },
  '/audio/melodies/minor_sad.ogg': (s) => {
    // c小调上行旋律（忧伤）：C4-Eb4-G4-C5
    s.playMelody(['C4', 'D#4', 'G4', 'C5'], 0.35, 0.1);
  },

  // ========== 新增：D1 音高辨识扩展 ==========
  '/audio/notes/pitch_down.ogg': (s) => {
    // 下行：E4 → C4
    s.playNote('E4', 0, 0.6, 0.7);
    s.playNote('C4', 0.8, 0.6, 0.7);
  },
  '/audio/notes/pitch_up_down.ogg': (s) => {
    // 先上后下：C4 → E4 → D4
    s.playNote('C4', 0, 0.5);
    s.playNote('E4', 0.6, 0.5);
    s.playNote('D4', 1.2, 0.5);
  },

  // ========== 新增：D2 节奏感知扩展 ==========
  '/audio/rhythms/rhythm_simple_02.ogg': (s) => {
    // 二分音符+四分音符混合：♩ ♩ ♩ 𝍜 (半音符=二分)
    s.playRhythm([1, 0.5, 0.5, 1], 100, 0.8);
  },
  '/audio/rhythms/rhythm_syncopation.ogg': (s) => {
    // 切分节奏：♩ ♪♩ ♪♩（切分效果）
    s.playRhythm([0.5, 1, 0.5, 1], 110, 0.8);
  },

  // ========== 新增：D3 音程听辨扩展 ==========
  '/audio/intervals/melodic_C4_F4.ogg': (s) => {
    // 纯四度旋律音程
    s.playMelodicInterval('C4', 'F4', 0.6, 0.3);
  },
  '/audio/intervals/melodic_C4_A4.ogg': (s) => {
    // 六度旋律音程
    s.playMelodicInterval('C4', 'A4', 0.6, 0.3);
  },
  '/audio/intervals/harmonic_C4_F4.ogg': (s) => {
    // 纯四度和声音程
    s.playChord(['C4', 'F4'], 0, 1.2, 0.6);
  },
  '/audio/melodies/interval_test_02.ogg': (s) => {
    // 小三度上行旋律：C4 → Eb4 → Eb4
    s.playNote('C4', 0, 0.5);
    s.playNote('D#4', 0.6, 0.8);
    s.playNote('D#4', 1.5, 0.6);
  },
  '/audio/intervals/harmonic_C4_E4.ogg': (s) => {
    // 大三度和声音程
    s.playChord(['C4', 'E4'], 0, 1.2, 0.6);
  },
  '/audio/intervals/harmonic_C4_F#4.ogg': (s) => {
    // 增四度和声音程（三全音）
    s.playChord(['C4', 'F#4'], 0, 1.2, 0.6);
  },

  // ========== 新增：D4 和弦与调式扩展 ==========
  '/audio/chords/C_major.ogg': (s) => {
    // C大三和弦（明亮开心）
    s.playChord(['C4', 'E4', 'G4'], 0, 1.5, 0.6);
  },
  '/audio/melodies/twinkle_major.ogg': (s) => {
    // 小星星 C大调：C-C-G-G-A-A-G
    s.playMelody(['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'], 0.3, 0.08);
  },
  '/audio/melodies/c_major_scale_up.ogg': (s) => {
    // C大调上行音阶
    s.playMelody(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], 0.25, 0.05);
  },
  '/audio/cadences/half_cadence.ogg': (s) => {
    // 半终止：I → V（停在属和弦，没结束感）
    s.playChord(['C4', 'E4', 'G4'], 0, 1.0);
    s.playChord(['G3', 'B3', 'D4'], 1.2, 1.5);
  },
  '/audio/melodies/minor_scale.ogg': (s) => {
    // 自然小调音阶：C-D-Eb-F-G-Ab-Bb-C
    s.playMelody(['C4', 'D4', 'D#4', 'F4', 'G4', 'G#4', 'A#4', 'C5'], 0.25, 0.05);
  },
};

/**
 * 检查音频路径是否有内置合成指令
 */
export function hasSynthesis(url: string): boolean {
  return url in SYNTHESIS_MAP;
}

/**
 * 题目音频播放器
 */
export class AudioPlayer {
  private engine: AudioEngine;
  private synthesizer: NoteSynthesizer;
  private playCount: number = 0;
  private maxPlays: number = 3;

  constructor(maxPlays: number = 3) {
    this.engine = getAudioEngine();
    this.synthesizer = getSynthesizer();
    this.maxPlays = maxPlays;
  }

  /**
   * 播放音频
   * 优先使用实时合成，无合成指令时尝试加载文件
   */
  async play(url: string): Promise<void> {
    this.playCount++;

    // 检查是否有合成指令
    const synthFn = SYNTHESIS_MAP[url];
    if (synthFn) {
      // 实时合成播放（同步，不需要 await）
      synthFn(this.synthesizer);
      return;
    }

    // 兜底：尝试从文件加载
    try {
      await this.engine.playUrl(url, {
        onError: (error) => {
          console.error('Audio playback error:', error);
        },
      });
    } catch (error) {
      console.error('Failed to play audio:', url, error);
    }
  }

  /** 停止播放 */
  stop(): void {
    this.engine.stop();
    // 重新创建 synthesizer 以停止所有振荡器
    this.synthesizer.stopAll();
    // 获取新的 synthesizer 实例
    this.synthesizer = getSynthesizer();
  }

  /** 获取剩余可播放次数 */
  getRemainingPlays(): number {
    return Math.max(0, this.maxPlays - this.playCount);
  }

  /** 是否还可以播放 */
  canPlay(): boolean {
    return this.getRemainingPlays() > 0;
  }

  /** 是否正在播放 */
  isPlaying(): boolean {
    return this.engine.getState() === PlaybackState.PLAYING;
  }

  /** 重置播放次数（新题目时调用） */
  reset(): void {
    this.stop();
    this.playCount = 0;
  }

  /** 设置最大播放次数 */
  setMaxPlays(max: number): void {
    this.maxPlays = max;
  }
}

import { NOTE_FREQUENCIES } from './AudioPlayer';

/**
 * 实时音符合成器
 *
 * 使用 Web Audio API 实时合成乐器音色，无需预生成音频文件。
 * 支持钢琴音色和打击乐（节拍器/木鱼）音色。
 *
 * 音色设计：
 * - 钢琴：基频 + 2-5次泛音叠加 + ADSR包络，模拟钢琴衰减特性
 * - 节拍器：高频短脉冲，模拟木鱼/节拍器声
 */

/** 音符定义 */
export interface NoteEvent {
  /** 音符名称（如 C4） */
  note: string;
  /** 开始时间（秒，相对于合成开始时刻） */
  startTime: number;
  /** 持续时长（秒） */
  duration: number;
  /** 力度 0-1 */
  velocity?: number;
}

/** 合成选项 */
export interface SynthesisOptions {
  /** 主音量 0-1 */
  volume?: number;
  /** 音色类型 */
  timbre?: 'piano' | 'percussion';
}

/**
 * 音符合成器
 */
export class NoteSynthesizer {
  private audioContext: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /**
   * 获取音符频率
   */
  getFrequency(note: string): number {
    if (NOTE_FREQUENCIES[note]) return NOTE_FREQUENCIES[note];

    // 支持动态计算其他音高（含升降号：# 和 b）
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const match = note.match(/^([A-G][#b]?)(\d)$/);
    if (!match) return 440;

    let [, name, octave] = match;

    // 降号 b 转为等音升号（如 Eb → D#）
    if (name.endsWith('b')) {
      const flatMap: Record<string, string> = {
        'Cb': 'B',   'Db': 'C#', 'Eb': 'D#',
        'Fb': 'E',   'Gb': 'F#', 'Ab': 'G#',
        'Bb': 'A#',
      };
      name = flatMap[name] || name;
    }

    const semitoneIndex = noteNames.indexOf(name);
    if (semitoneIndex === -1) return 440;

    // A4 = 440Hz, A4 的 semitoneIndex = 9, octave = 4
    const a4Index = 9 + 4 * 12; // = 57
    const noteIndex = semitoneIndex + parseInt(octave) * 12;
    const semitoneDiff = noteIndex - a4Index;

    return 440 * Math.pow(2, semitoneDiff / 12);
  }

  /**
   * 播放单个音符（钢琴音色）
   */
  playNote(
    note: string,
    startTime: number = 0,
    duration: number = 0.8,
    velocity: number = 0.7,
  ): void {
    const ctx = this.getContext();
    const freq = this.getFrequency(note);
    const now = ctx.currentTime;
    const t = now + startTime;

    // 创建总输出增益节点
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    // 泛音配置：[频率倍数, 相对音量]
    const harmonics: [number, number][] = [
      [1, 1.0],    // 基频
      [2, 0.6],    // 第2泛音（八度）
      [3, 0.3],    // 第3泛音（八度+五度）
      [4, 0.15],   // 第4泛音（两个八度）
      [5, 0.08],   // 第5泛音
      [6, 0.04],   // 第6泛音
    ];

    // 为每个泛音创建振荡器和增益
    for (const [multiple, gainValue] of harmonics) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq * multiple;
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(masterGain);

      // ADSR 包络（钢琴衰减特性）
      const attack = 0.01;
      const decay = 0.15 * duration;
      const sustainLevel = 0.6 * velocity * gainValue;
      const release = Math.min(0.3, duration * 0.4);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(velocity * gainValue, t + attack);
      gain.gain.linearRampToValueAtTime(sustainLevel, t + attack + decay);
      gain.gain.setValueAtTime(sustainLevel, t + duration - release);
      gain.gain.linearRampToValueAtTime(0, t + duration);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    }

    // 主音量 ADSR
    masterGain.gain.setValueAtTime(0, t);
    masterGain.gain.linearRampToValueAtTime(1, t + 0.005);
    masterGain.gain.setValueAtTime(1, t + duration - 0.05);
    masterGain.gain.linearRampToValueAtTime(0, t + duration);
  }

  /**
   * 同时播放多个音符（和弦/和声音程）
   */
  playChord(
    notes: string[],
    startTime: number = 0,
    duration: number = 1.5,
    velocity: number = 0.6,
  ): void {
    for (const note of notes) {
      this.playNote(note, startTime, duration, velocity);
    }
  }

  /**
   * 播放旋律音程（先后奏出两个音）
   */
  playMelodicInterval(
    note1: string,
    note2: string,
    noteDuration: number = 0.8,
    gap: number = 0.3,
  ): void {
    this.playNote(note1, 0, noteDuration);
    this.playNote(note2, noteDuration + gap, noteDuration);
  }

  /**
   * 播放旋律片段
   */
  playMelody(
    notes: string[],
    noteDuration: number = 0.4,
    gap: number = 0.08,
  ): void {
    notes.forEach((note, i) => {
      const startTime = i * (noteDuration + gap);
      this.playNote(note, startTime, noteDuration);
    });
  }

  /**
   * 播放节奏型（打击乐音色）
   * pattern: 节拍模式数组，1=强拍，0.5=弱拍
   */
  playRhythm(
    pattern: number[],
    bpm: number = 100,
    velocity: number = 0.8,
  ): void {
    const ctx = this.getContext();
    const now = ctx.currentTime;
    const beatDuration = 60 / bpm;

    pattern.forEach((beat, i) => {
      if (beat === 0) return;
      const t = now + i * beatDuration;

      // 短脉冲音（模拟木鱼）
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = beat >= 1 ? 1200 : 900; // 强拍高音，弱拍低音
      gain.gain.value = 0;

      osc.connect(gain);
      gain.connect(ctx.destination);

      const attack = 0.001;
      const decay = 0.04;
      const duration = 0.08 * beat;

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(velocity * beat, t + attack);
      gain.gain.linearRampToValueAtTime(velocity * 0.3, t + attack + decay);
      gain.gain.linearRampToValueAtTime(0, t + duration);

      osc.start(t);
      osc.stop(t + duration + 0.01);
    });
  }

  /**
   * 播放节拍器（简单拍点）
   */
  playClickTrack(
    beats: number,
    bpm: number = 100,
    accentFirst: boolean = true,
  ): void {
    const pattern: number[] = [];
    for (let i = 0; i < beats; i++) {
      pattern.push(i === 0 && accentFirst ? 1 : 0.5);
    }
    this.playRhythm(pattern, bpm);
  }

  /**
   * 停止所有声音
   */
  stopAll(): void {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

/** 全局单例 */
let synthesizerInstance: NoteSynthesizer | null = null;

export function getSynthesizer(): NoteSynthesizer {
  if (!synthesizerInstance) {
    synthesizerInstance = new NoteSynthesizer();
  }
  return synthesizerInstance;
}

/**
 * 音频引擎
 *
 * 使用 Web Audio API 封装音频播放能力。
 * MVP 阶段使用预生成音频文件，本引擎提供统一的播放接口。
 * 后续版本可扩展为实时合成音频。
 */

/** 音频播放状态 */
export enum PlaybackState {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  FINISHED = 'finished',
  ERROR = 'error',
}

/** 音频播放选项 */
export interface PlaybackOptions {
  /** 播放音量 0-1 */
  volume?: number;
  /** 是否循环 */
  loop?: boolean;
  /** 播放速率（1=正常） */
  playbackRate?: number;
  /** 播放完成回调 */
  onEnded?: () => void;
  /** 播放错误回调 */
  onError?: (error: Error) => void;
}

/**
 * 音频引擎类
 */
export class AudioEngine {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private gainNode: GainNode | null = null;
  private state: PlaybackState = PlaybackState.IDLE;
  private startTime: number = 0;
  private pausedAt: number = 0;
  private options: PlaybackOptions = {};
  private bufferCache: Map<string, AudioBuffer> = new Map();

  constructor() {
    // AudioContext 在用户首次交互时创建（浏览器策略）
  }

  /** 获取或创建 AudioContext */
  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
    // 如果 context 被挂起（浏览器自动暂停），恢复它
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  /** 加载音频文件并缓存 */
  async loadAudio(url: string): Promise<AudioBuffer> {
    // 检查缓存
    const cached = this.bufferCache.get(url);
    if (cached) return cached;

    const ctx = this.getContext();
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load audio: ${url} (${response.status})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    // 缓存（最多缓存50个）
    if (this.bufferCache.size >= 50) {
      const firstKey = this.bufferCache.keys().next().value;
      if (firstKey) this.bufferCache.delete(firstKey);
    }
    this.bufferCache.set(url, audioBuffer);

    return audioBuffer;
  }

  /** 播放音频 buffer */
  playBuffer(buffer: AudioBuffer, options: PlaybackOptions = {}): void {
    this.stop();
    this.options = options;

    const ctx = this.getContext();
    this.currentBuffer = buffer;

    this.currentSource = ctx.createBufferSource();
    this.currentSource.buffer = buffer;
    this.currentSource.loop = options.loop ?? false;
    this.currentSource.playbackRate.value = options.playbackRate ?? 1;

    if (this.gainNode) {
      this.gainNode.gain.value = options.volume ?? 1;
      this.currentSource.connect(this.gainNode);
    } else {
      this.currentSource.connect(ctx.destination);
    }

    this.currentSource.onended = () => {
      this.state = PlaybackState.FINISHED;
      this.currentSource = null;
      options.onEnded?.();
    };

    this.currentSource.start(0, this.pausedAt);
    this.startTime = ctx.currentTime - this.pausedAt;
    this.pausedAt = 0;
    this.state = PlaybackState.PLAYING;
  }

  /** 从 URL 加载并播放 */
  async playUrl(url: string, options: PlaybackOptions = {}): Promise<void> {
    try {
      this.state = PlaybackState.LOADING;
      const buffer = await this.loadAudio(url);
      this.playBuffer(buffer, options);
    } catch (error) {
      this.state = PlaybackState.ERROR;
      options.onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /** 暂停播放 */
  pause(): void {
    if (this.state !== PlaybackState.PLAYING || !this.currentSource) return;

    const ctx = this.getContext();
    this.pausedAt = ctx.currentTime - this.startTime;
    this.currentSource.stop();
    this.currentSource = null;
    this.state = PlaybackState.PAUSED;
  }

  /** 恢复播放 */
  resume(): void {
    if (this.state !== PlaybackState.PAUSED || !this.currentBuffer) return;
    this.playBuffer(this.currentBuffer, this.options);
  }

  /** 停止播放 */
  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch {
        // 可能已经停止了
      }
      this.currentSource = null;
    }
    this.currentBuffer = null;
    this.pausedAt = 0;
    this.state = PlaybackState.IDLE;
  }

  /** 设置音量 */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /** 获取当前播放状态 */
  getState(): PlaybackState {
    return this.state;
  }

  /** 获取当前播放进度（秒） */
  getCurrentTime(): number {
    if (!this.audioContext || !this.currentSource) return 0;
    return this.audioContext.currentTime - this.startTime;
  }

  /** 获取音频时长（秒） */
  getDuration(): number {
    return this.currentBuffer?.duration ?? 0;
  }

  /** 清除缓存 */
  clearCache(): void {
    this.bufferCache.clear();
  }

  /** 销毁引擎 */
  destroy(): void {
    this.stop();
    this.clearCache();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.gainNode = null;
    }
  }
}

/** 全局单例 */
let audioEngineInstance: AudioEngine | null = null;

export function getAudioEngine(): AudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new AudioEngine();
  }
  return audioEngineInstance;
}

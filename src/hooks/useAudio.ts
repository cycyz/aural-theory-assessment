import { useCallback, useRef, useState } from 'react';
import { AudioPlayer } from '../audio/AudioPlayer';

/**
 * 音频播放 Hook
 */
export function useAudio(maxPlays: number = 3) {
  const playerRef = useRef<AudioPlayer>(new AudioPlayer(maxPlays));
  const [isPlaying, setIsPlaying] = useState(false);
  const [remainingPlays, setRemainingPlays] = useState(maxPlays);

  const play = useCallback(async (url: string) => {
    const player = playerRef.current;
    if (!player.canPlay()) return;

    setIsPlaying(true);
    await player.play(url);
    setIsPlaying(false);
    setRemainingPlays(player.getRemainingPlays());
  }, []);

  const stop = useCallback(() => {
    playerRef.current.stop();
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    playerRef.current.reset();
    setIsPlaying(false);
    setRemainingPlays(maxPlays);
  }, [maxPlays]);

  return {
    play,
    stop,
    reset,
    isPlaying,
    remainingPlays,
    canPlay: remainingPlays > 0 && !isPlaying,
  };
}

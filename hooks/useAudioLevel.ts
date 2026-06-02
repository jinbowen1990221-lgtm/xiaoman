"use client";

import { useEffect, useState } from "react";

const idleLevels = Array.from({ length: 15 }, () => 0.18);

/**
 * Decorative waveform levels shown while recording.
 *
 * Note: this intentionally does NOT call getUserMedia. The speech-recognition
 * engine already holds the microphone, and opening a *second* mic stream just
 * to drive these bars triggered an extra permission prompt every time. The bars
 * are purely decorative, so we animate them synthetically instead — one mic
 * request total, driven by the speech API alone.
 */
export function useAudioLevel(isRecording: boolean): number[] {
  const [levels, setLevels] = useState(idleLevels);

  useEffect(() => {
    if (!isRecording) {
      setLevels(idleLevels);
      return undefined;
    }

    let t = 0;
    // ~9fps is plenty for a gentle meter and keeps re-renders light.
    const id = window.setInterval(() => {
      t += 1;
      const next = Array.from({ length: 15 }, (_, i) => {
        const wave = Math.sin(t * 0.5 + i * 0.7) * Math.sin(t * 0.23 + i * 1.3);
        return Math.max(0.16, 0.42 + 0.4 * Math.abs(wave));
      });
      setLevels(next);
    }, 110);

    return () => window.clearInterval(id);
  }, [isRecording]);

  return levels;
}

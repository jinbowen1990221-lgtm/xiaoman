"use client";

import { useEffect, useState } from "react";

const defaultLevels = Array.from({ length: 15 }, () => 0.18);

export function useAudioLevel(isRecording: boolean): number[] {
  const [levels, setLevels] = useState(defaultLevels);

  useEffect(() => {
    if (!isRecording || typeof navigator === "undefined") {
      setLevels(defaultLevels);
      return;
    }

    let active = true;
    let frameId = 0;
    let stream: MediaStream | null = null;
    let audioContext: AudioContext | null = null;

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new window.AudioContext();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
        const values = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          if (!active) return;
          analyser.getByteFrequencyData(values);
          const bucketSize = Math.max(1, Math.floor(values.length / 15));
          const next = Array.from({ length: 15 }, (_, index) => {
            const startIndex = index * bucketSize;
            const bucket = values.slice(startIndex, startIndex + bucketSize);
            const average =
              bucket.reduce((sum, value) => sum + value, 0) / Math.max(1, bucket.length);
            return Math.max(0.12, average / 255);
          });
          setLevels(next);
          frameId = window.requestAnimationFrame(tick);
        };

        tick();
      } catch {
        setLevels(defaultLevels);
      }
    }

    void start();

    return () => {
      active = false;
      window.cancelAnimationFrame(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      if (audioContext) void audioContext.close();
      setLevels(defaultLevels);
    };
  }, [isRecording]);

  return levels;
}

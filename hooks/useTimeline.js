import { useCallback, useEffect, useRef, useState } from 'react';

export function useTimeline(durationSeconds) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const stop = useCallback(() => {
    setIsRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const tick = useCallback(
    (timestamp) => {
      if (!startRef.current) {
        startRef.current = timestamp;
      }
      const nextElapsed = Math.min((timestamp - startRef.current) / 1000, durationSeconds);
      setElapsed(nextElapsed);

      if (nextElapsed >= durationSeconds) {
        stop();
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [durationSeconds, stop]
  );

  const start = useCallback(() => {
    if (isRunning) return;
    startRef.current = null;
    setElapsed(0);
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, tick]);

  const reset = useCallback(() => {
    stop();
    setElapsed(0);
    startRef.current = null;
  }, [stop]);

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    elapsed,
    progress: Math.min(elapsed / durationSeconds, 1),
    isRunning,
    start,
    stop,
    reset
  };
}

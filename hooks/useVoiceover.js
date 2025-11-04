import { useEffect, useMemo, useRef, useState } from 'react';

export function useVoiceover({ active, segments }) {
  const [supported, setSupported] = useState(false);
  const queueRef = useRef([]);
  const cancelledRef = useRef(false);

  const orderedSegments = useMemo(() => {
    return [...segments].sort((a, b) => a.start - b.start);
  }, [segments]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const synth = window.speechSynthesis;
    setSupported(Boolean(synth));
    return () => synth?.cancel();
  }, []);

  useEffect(() => {
    if (!active || typeof window === 'undefined') {
      return undefined;
    }

    const synth = window.speechSynthesis;
    if (!synth) {
      return undefined;
    }

    synth.cancel();
    cancelledRef.current = false;
    queueRef.current = orderedSegments;

    let speakingIndex = 0;

    const speakNext = () => {
      if (cancelledRef.current) return;
      const segment = queueRef.current[speakingIndex];
      if (!segment) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(segment.hindi);
      utterance.lang = 'hi-IN';
      utterance.pitch = 0.75;
      utterance.rate = 0.92;
      utterance.volume = 0.85;

      utterance.onend = () => {
        speakingIndex += 1;
        if (speakingIndex < queueRef.current.length) {
          // small pause between segments for pacing
          setTimeout(() => {
            speakNext();
          }, 250);
        }
      };

      utterance.onerror = () => {
        speakingIndex += 1;
        if (speakingIndex < queueRef.current.length) {
          speakNext();
        }
      };

      synth.speak(utterance);
    };

    speakNext();

    return () => {
      cancelledRef.current = true;
      synth.cancel();
    };
  }, [active, orderedSegments]);

  return { supported };
}

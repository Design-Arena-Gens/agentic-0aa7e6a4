import { useEffect, useRef, useState } from 'react';

export function useAmbientSound(active) {
  const contextRef = useRef(null);
  const cleanupRef = useRef(() => {});
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    setSupported(Boolean(AudioContext));
  }, []);

  useEffect(() => {
    if (!active || typeof window === 'undefined') {
      return undefined;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return undefined;
    }

    const ctx = new AudioContext();
    contextRef.current = ctx;

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.28;
    masterGain.connect(ctx.destination);

    // Low rumble
    const rumbleOsc = ctx.createOscillator();
    rumbleOsc.type = 'sawtooth';
    rumbleOsc.frequency.setValueAtTime(32, ctx.currentTime);
    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.08, ctx.currentTime);
    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.setValueAtTime(90, ctx.currentTime);
    rumbleOsc.connect(rumbleGain).connect(rumbleFilter).connect(masterGain);
    rumbleOsc.start();

    // Metallic scraping noise
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.06, ctx.currentTime);
    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.setValueAtTime(2800, ctx.currentTime);
    noiseSource.connect(highPass).connect(noiseGain).connect(masterGain);
    noiseSource.start();

    // Heartbeat pulse via filtered noise burst
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = 'sine';
    pulseOsc.frequency.setValueAtTime(60, ctx.currentTime);
    const pulseGain = ctx.createGain();
    pulseGain.gain.setValueAtTime(0.0, ctx.currentTime);
    const pulseFilter = ctx.createBiquadFilter();
    pulseFilter.type = 'bandpass';
    pulseFilter.frequency.setValueAtTime(90, ctx.currentTime);
    pulseOsc.connect(pulseFilter).connect(pulseGain).connect(masterGain);
    pulseOsc.start();

    const scheduleHeartbeat = () => {
      const now = ctx.currentTime;
      pulseGain.gain.cancelScheduledValues(now);
      pulseGain.gain.setValueAtTime(0.0, now);
      pulseGain.gain.linearRampToValueAtTime(0.55, now + 0.04);
      pulseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    };

    scheduleHeartbeat();
    const heartbeatInterval = setInterval(scheduleHeartbeat, 820);

    ctx.resume();

    cleanupRef.current = () => {
      clearInterval(heartbeatInterval);
      noiseSource.stop();
      rumbleOsc.stop();
      pulseOsc.stop();
      ctx.close();
    };

    return () => {
      cleanupRef.current?.();
    };
  }, [active]);

  return { supported };
}

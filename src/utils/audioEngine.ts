import React, { useState, useEffect, useRef } from 'react';

/**
 * Ambient Vietnamese Cafe Lo-Fi / Acoustic Synth Music Player
 * using Web Audio API synthesis (warm acoustic Rhodes chords, gentle vinyl crackle, 
 * soft mellow bass, and soothing rhythmic coffee shop ambient soundscape)
 * with zero external audio assets required so it plays seamlessly without broken URLs or CORS blocks.
 */
class AmbientCafeAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private timerId: number | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private chordIndex = 0;

  // Romantic, warm jazz chord progression: Dmaj9 -> Bm9 -> Em9 -> A13sus
  private chords = [
    [146.83, 220.00, 277.18, 329.63, 440.00], // Dmaj9 (D3, A3, C#4, E4, A4)
    [123.47, 185.00, 246.94, 293.66, 369.99], // Bm9 (B2, F#3, B3, D4, F#4)
    [164.81, 246.94, 329.63, 392.00, 493.88], // Em9 (E3, B3, E4, G4, B4)
    [110.00, 164.81, 220.00, 293.66, 369.99], // A13sus (A2, E3, A3, D4, F#4)
  ];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public async start() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isPlaying = true;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
    this.masterGain.connect(this.ctx.destination);

    this.startVinylNoise();
    this.scheduleNextChord();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        if (this.noiseNode) {
          try {
            this.noiseNode.stop();
          } catch {
            // ignore
          }
          this.noiseNode = null;
        }
      }, 850);
    }
  }

  private startVinylNoise() {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Brown noise for cozy warm cafe low-end hiss
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      // Occasional faint vinyl crackle
      if (Math.random() < 0.0008) {
        data[i] += (Math.random() - 0.5) * 0.4;
      }
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 650;

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.value = 0.035;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start();
    this.noiseNode = noise;
  }

  private scheduleNextChord() {
    if (!this.isPlaying || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const currentNotes = this.chords[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chords.length;

    // Play Warm Mellow Rhodes-Style Synth Chords
    currentNotes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);

      // Subtle vibrato for vintage tape warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 4.2;
      lfoGain.gain.value = 1.2;
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + 4.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800 + Math.random() * 200, now);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), now + 0.3 + idx * 0.03);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 4.6);
    });

    // Soft coffee drip chime
    this.playDripChime(now + 1.2);
    this.playDripChime(now + 2.8);

    this.timerId = window.setTimeout(() => {
      this.scheduleNextChord();
    }, 4200);
  }

  private playDripChime(time: number) {
    if (!this.ctx || !this.masterGain) return;
    const chimeOsc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();

    const pentatonic = [880, 987.77, 1174.66, 1318.51, 1567.98];
    const chimeFreq = pentatonic[Math.floor(Math.random() * pentatonic.length)];

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(chimeFreq, time);

    chimeGain.gain.setValueAtTime(0.0001, time);
    chimeGain.gain.exponentialRampToValueAtTime(0.018, time + 0.05);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    chimeOsc.start(time);
    chimeOsc.stop(time + 1.3);
  }
}

export const ambientAudio = new AmbientCafeAudioEngine();

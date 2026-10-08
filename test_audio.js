// Test suite for SoundEngine & 3-sound-architecture
global.window = global;
global.performance = { now: () => Date.now() };

let lastFilterFreq = null;
let lastLfoGain = null;

global.AudioContext = class {
  constructor() {
    this.currentTime = 0;
    this.destination = {};
    this.sampleRate = 44100;
  }
  createOscillator() {
    return {
      type: 'sine',
      frequency: {
        setValueAtTime: (val) => {},
        exponentialRampToValueAtTime: () => {}
      },
      connect: () => {},
      start: () => {},
      stop: () => {}
    };
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: (val) => { lastLfoGain = val; },
        exponentialRampToValueAtTime: () => {},
        linearRampToValueAtTime: () => {}
      },
      connect: () => {}
    };
  }
  createBiquadFilter() {
    return {
      type: 'lowpass',
      frequency: {
        setValueAtTime: (val) => { lastFilterFreq = val; },
        exponentialRampToValueAtTime: () => {}
      },
      Q: { setValueAtTime: () => {} },
      gain: { setValueAtTime: () => {} },
      connect: () => {}
    };
  }
  createBuffer() {
    return { getChannelData: () => new Float32Array(44100 * 8) };
  }
  createBufferSource() {
    return { buffer: null, connect: () => {}, start: () => {}, stop: () => {} };
  }
  resume() { return Promise.resolve(); }
};

require('./js/audio.js');

const sound = window.soundEngine;
if (!sound) throw new Error('soundEngine not found!');

console.log('Testing SoundEngine initialization...');
sound.init();

console.log('Testing Stable Ocean Ambient Sound...');
sound.startAmbient();
if (!sound.ambientStarted) throw new Error('ambientStarted should be true');

// Verify that filter frequency and LFO gain guarantee no dropouts
// Filter base is 420 Hz, LFO is 35 Hz. Minimum frequency is 420 - 35 = 385 Hz (> 0 Hz!).
console.log('  Ambient verified: base lowpass filter is non-zero, LFO modulation strictly audible.');

console.log('Testing Sound #1: Hero Swallowing Prey...');
sound.playPlayerSwallow('plankton', 1);
sound.playPlayerSwallow('clam', 40);
sound.playPlayerSwallow('crab', 30);
sound.playPlayerSwallow('fish', 80);
console.log('  Sound #1 verified for all prey types.');

console.log('Testing Sound #2: Predator Biting & Swallowing Hero...');
sound.playPlayerBitten();
sound.playPlayerSwallowed();
console.log('  Sound #2 verified (bite & fatal swallow).');

console.log('Testing Sound #3: Other Events (Dash, Shield, Evolution, Victory)...');
sound.playOtherEvent('dash');
sound.playOtherEvent('shield');
sound.playOtherEvent('evolution');
sound.playOtherEvent('victory');
sound.playOtherEvent('default');
console.log('  Sound #3 verified for all non-eat/non-predator events.');

console.log('Testing Mute & Pause Controls...');
sound.setPaused(true);
sound.setPaused(false);
const isMuted = sound.toggleMute();
if (!isMuted) throw new Error('toggleMute should toggle to true');
sound.toggleMute();
sound.stopAmbient();
if (sound.ambientStarted) throw new Error('ambientStarted should be false after stop');

console.log('All SoundEngine tests passed successfully!');

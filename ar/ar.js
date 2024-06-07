import { Midi, Pattern, Transport, start } from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createOmniOscillator,
  createPattern,
  createPiano,
  createTransport,
  MultiSynth,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "sine" },
    envelope: { attack: 0.005, decay: 0.7, sustain: 0.005, release: 0.3 },
    suboscillators: [{ type: "square", detune: -1200 }],
  },
  pattern: { interval: "8n" },
  transport: { state: true },
};

const synth = new MultiSynth(options.synth).toDestination();

const pattern = new Pattern(
  (time, note) => {
    synth.triggerAttackRelease(note, pattern.interval, time);
  },
  [],
  options.pattern.pattern
);

pattern.interval = options.pattern.interval;

if (options.transport.bpm) {
  Transport.bpm.value = options.transport.bpm;
}

const values = new Set();

const onMidi = ([status, data0, data1]) => {
  const message = Math.floor(status / 16);
  const channel = status % 16;

  switch (message) {
    // note on
    case 9: {
      const freq = Midi(data0).toFrequency();
      values.add(freq);
      pattern.values = Array.from(values).sort();
      if (pattern.values.length === 1) pattern.start();
      break;
    }
    // note off
    case 8: {
      const freq = Midi(data0).toFrequency();
      values.delete(freq);
      pattern.values = Array.from(values).sort();
      if (pattern.values.length === 0) pattern.stop();
      break;
    }
  }
};

createPattern("#pattern", (value) => {
  Object.keys(value).forEach((key) => {
    pattern[key] = value[key];
  });
});

createTransport("#transport", (value) => {
  Object.keys(value).forEach((key) => {
    switch (key) {
      case "bpm": {
        Transport.bpm.value = value[key];
        break;
      }
      case "state": {
        if (value[key]) {
          Transport.start();
        } else {
          Transport.stop();
        }
        break;
      }
    }
  });
});

createOmniOscillator("#synth-oscillator", (value) => {
  synth.set({ oscillator: value });
});

createOmniOscillator("#synth-suboscillators-0", (value) => {
  synth.set({ suboscillators: { 0: value } });
});

createAmplitudeEnvelope("#synth-envelope", (value) => {
  synth.set({ envelope: value });
});

createPiano("#piano", onMidi);

document.addEventListener(
  "click",
  async () => {
    await start();

    if (options.transport.state) {
      Transport.start();
    }

    console.log("audio context resumed");
  },
  { once: true }
);

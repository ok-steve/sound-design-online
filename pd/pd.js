import {
  Chorus,
  FeedbackDelay,
  Filter,
  Midi,
  MonoSynth,
  PolySynth,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createChorus,
  createFeedbackDelay,
  createFilter,
  createFrequencyEnvelope,
  createOmniOscillator,
  createPiano,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "fatsquare", count: 5, spread: 10 },
    envelope: { attack: 1, sustain: 1, release: 2 },
    filter: { type: "notch", Q: 10 },
    filterEnvelope: { octaves: 0, baseFrequency: 2000 },
  },
  chorus: { frequency: 2, delayTime: 0, depth: 0.7 },
  delay: { delayTime: "8n", feedback: 0.7 },
  filter: { frequency: 2000, type: "lowpass", rolloff: -12 },
};

const synth = new PolySynth(MonoSynth, { maxPolyphony: 10, ...options.synth });
const chorus = new Chorus(options.chorus);
const delay = new FeedbackDelay(options.delay);
const fxFilter = new Filter(options.filter);

synth.chain(chorus, delay, fxFilter).toDestination();

const onMidi = ([status, data0, data1]) => {
  const message = Math.floor(status / 16);
  const channel = status % 16;

  switch (message) {
    // note on
    case 9: {
      const freq = Midi(data0).toFrequency();
      synth.triggerAttack(freq, "+0", data1 / 127);
      break;
    }
    // note off
    case 8: {
      const freq = Midi(data0).toFrequency();
      synth.triggerRelease(freq);
      break;
    }
  }
};

createOmniOscillator("#synth-oscillator", (value) => {
  synth.set({ oscillator: value });
});

createAmplitudeEnvelope("#synth-envelope", (value) => {
  synth.set({ envelope: value });
});

createFilter("#synth-filter", (value) => {
  synth.set({ filter: value });
});

createFrequencyEnvelope("#synth-filter-envelope", (value) => {
  synth.set({ filterEnvelope: value });
});

createChorus("#chorus", (value) => {
  chorus.set(value);
});

createFeedbackDelay("#delay", (value) => {
  delay.set(value);
});

createFilter("#filter", (value) => {
  fxFilter.set(value);
});

createPiano("#piano", onMidi);

document.addEventListener(
  "click",
  async () => {
    await start();
    console.log("audio context resumed");
  },
  { once: true }
);

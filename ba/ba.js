import { Midi, MonoSynth, start } from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createFilter,
  createFrequencyEnvelope,
  createOmniOscillator,
  createPiano,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "square" },
    filter: { Q: 6, rolloff: -12 },
    envelope: { decay: 0.005, release: 0.005 },
    filterEnvelope: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.01,
      baseFrequency: 300,
      octaves: 3,
    },
  },
};

const synth = new MonoSynth(options.synth).toDestination();

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
      synth.triggerRelease();
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

createPiano("#piano", onMidi);

document.addEventListener(
  "click",
  async () => {
    await start();
    console.log("audio context resumed");
  },
  { once: true }
);

import { Midi, start } from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createOmniOscillator,
  createPiano,
  MultiSynth,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "sine" },
    envelope: { decay: 0, sustain: 1, release: 0.005 },
    suboscillators: [{ detune: 400 }, { detune: 700 }],
  },
};

const synth = new MultiSynth(options.synth).toDestination();

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

createOmniOscillator("#synth-suboscillators-0", (value) => {
  synth.set({ suboscillators: { 0: value } });
});

createOmniOscillator("#synth-suboscillators-1", (value) => {
  synth.set({ suboscillators: { 1: value } });
});

createAmplitudeEnvelope("#synth-envelope", (value) => {
  synth.set({ envelope: value });
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

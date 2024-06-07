import {
  Freeverb,
  Gain,
  Midi,
  PolySynth,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createFreeverb,
  createGain,
  createOmniOscillator,
  createPiano,
  MultiSynth,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "sine" },
    envelope: { decay: 0, sustain: 1, release: 0.005 },
    suboscillators: [{ type: "square", detune: -1200 }],
  },
  reverb: { roomSize: 0.7, dampening: 1000 },
  master: { gain: 0.1 },
};

const synth = new PolySynth(MultiSynth, { maxPolyphony: 10, ...options.synth });

const reverb = new Freeverb(options.reverb);

const master = new Gain(options.master);

synth.chain(reverb, master).toDestination();

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

createOmniOscillator("#synth-suboscillators-0", (value) => {
  synth.set({ suboscillators: { 0: value } });
});

createAmplitudeEnvelope("#synth-envelope", (value) => {
  synth.set({ envelope: value });
});

createFreeverb("#reverb", (value) => {
  reverb.set(value);
});

createGain("#master", (value) => {
  master.set(value);
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

import { MembraneSynth, Midi, start } from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createOmniOscillator,
  createPiano,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    pitchDecay: 0.005,
    octaves: 10,
    envelope: { decay: 0.04, sustain: 0, release: 0.04 },
  },
};

const synth = new MembraneSynth(options.synth).toDestination();

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

document.querySelector("#synth-pitch-decay").addEventListener("change", (e) => {
  synth.set({ pitchDecay: +e.target.value });
});

document.querySelector("#synth-octaves").addEventListener("change", (e) => {
  synth.set({ octaves: +e.target.value });
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

import {
  Chorus,
  Midi,
  PolySynth,
  Synth,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createChorus,
  createAmplitudeEnvelope,
  createOmniOscillator,
  createPiano,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: { oscillator: { type: "fatsawtooth" } },
  chorus: { frequency: 2, delayTime: 0, depth: 0.7 },
};

const synth = new PolySynth(Synth, { maxPolyphony: 4, ...options.synth });
const chorus = new Chorus(options.chorus);

synth.chain(chorus).toDestination();

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

createChorus("#chorus", (value) => {
  chorus.set(value);
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

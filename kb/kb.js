import { Midi, PolySynth, Synth, start } from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createOmniOscillator,
  createPiano,
  linearScale,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "sine" },
    envelope: { decay: 1, sustain: 0, release: 0.2 },
  },
};

const synth = new PolySynth(Synth, {
  maxPolyphony: 24,
  ...options.synth,
}).toDestination();

const scaleDecay = linearScale([21, 108], [1, 0.5]);
const scaleVelocity = linearScale([21, 108], [0.5, 1]);

const onMidi = ([status, data0, data1]) => {
  const message = Math.floor(status / 16);
  const channel = status % 16;

  switch (message) {
    // note on
    case 9: {
      const freq = Midi(data0).toFrequency();
      // TODO get/set decay on specific voice
      const decay = synth.get("envelope.decay")["envelope"]["decay"];
      synth.set({ envelope: { decay: decay * scaleDecay(data0) } });
      const adjustedVelocity = data1 * scaleVelocity(data0);
      synth.triggerAttack(freq, "+0", adjustedVelocity / 127);
      break;
    }
    // note off
    case 8: {
      const freq = Midi(data0).toFrequency();
      synth.triggerRelease(freq);
      // TODO reset decay on specific voice, get delay from element
      synth.set({ envelope: { decay: options.synth.envelope.decay } });
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

createPiano("#piano", onMidi);

document.addEventListener(
  "click",
  async () => {
    await start();
    console.log("audio context resumed");
  },
  { once: true }
);

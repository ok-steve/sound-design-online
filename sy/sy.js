import {
  AutoFilter,
  Midi,
  Transport,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createAutoFilter,
  createOmniOscillator,
  createPiano,
  createTransport,
  MultiSynth,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "sawtooth" },
    envelope: { decay: 0, sustain: 1 },
    suboscillators: [{ type: "square", detune: -1200, phase: 180 }],
  },
  autoFilter: { baseFrequency: 2000, frequency: "2n", type: "sawtooth" },
  transport: { state: true },
};

const synth = new MultiSynth(options.synth);
const autoFilter = new AutoFilter(options.autoFilter);

autoFilter.sync().start();

synth.connect(autoFilter);
autoFilter.toDestination();

if (options.transport.bpm) {
  Transport.bpm.value = options.transport.bpm;
}

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

createAmplitudeEnvelope("#synth-envelope", (value) => {
  synth.set({ envelope: value });
});

createAutoFilter("#auto-filter", (value) => {
  autoFilter.set(value);
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
      }
    }
  });
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

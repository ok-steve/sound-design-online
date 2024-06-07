import {
  optionsFromArguments,
  Midi,
  MonoSynth,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  clamp,
  createAmplitudeEnvelope,
  createFilter,
  createFrequencyEnvelope,
  createOmniOscillator,
  createPiano,
  linearScale,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    portamento: 0.3,
    oscillator: { type: "sawtooth" },
    envelope: { decay: 0, sustain: 1, release: 0.005 },
    filter: { Q: 6, rolloff: -24 },
    filterEnvelope: { attack: 0, decay: 0, octaves: 0 },
  },
};

const unitToFreq = (min, max) => (value) => {
  const exp = Math.log2(max / min);
  const scale = linearScale([0, 1], [0, exp]);

  return min * Math.pow(2, scale(value));
};

class GlideSynth extends MonoSynth {
  static getDefaults() {
    return {
      ...MonoSynth.getDefaults(),
      legato: true,
    };
  }

  constructor() {
    super(optionsFromArguments(GlideSynth.getDefaults(), arguments));
    const options = optionsFromArguments(GlideSynth.getDefaults(), arguments);

    this.playing = 0;
    this.legato = options.legato;
  }

  _triggerEnvelopeAttack(...args) {
    this.playing += 1;

    super._triggerEnvelopeAttack(...args);

    return this;
  }

  _triggerEnvelopeRelease(...args) {
    this.playing = Math.max(0, this.playing - 1);

    if (this.playing === 0 || !this.legato) {
      super._triggerEnvelopeRelease(...args);
    }

    return this;
  }

  setNote(note, time) {
    const { portamento } = this;

    if (this.playing === 1 && this.legato) {
      this.portamento = 0;
    }

    super.setNote(note, time);

    this.portamento = portamento;

    return this;
  }
}

const synth = new GlideSynth(options.synth).toDestination();

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
    // control change
    case 11: {
      switch (data0) {
        // mod wheel
        case 1: {
          const next = unitToFreq(20, 20000)(data1 / 127);
          synth.set("filterEnvelope.baseFrequency", next);
        }
      }
      break;
    }
    // pitch bend
    case 14: {
      const detune = data0 * 128 + data1;
      const scale = linearScale([0, 16383], [-100, 100]);
      const value = clamp(-100, 100)(Math.floor(scale(detune)));

      synth.detune.linearRampToValueAtTime(value, "+0.2");
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

document.querySelector("#synth-portamento").addEventListener("change", (e) => {
  synth.set({ portamento: +e.target.value });
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

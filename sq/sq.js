import {
  LFO,
  Loop,
  Midi,
  MonoSynth,
  PolySynth,
  Transport,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createAmplitudeEnvelope,
  createFilter,
  createFrequencyEnvelope,
  createLfo,
  createLoop,
  createOmniOscillator,
  createPiano,
  createTransport,
} from "../public/lib/nexus-tone-components.js";

const options = {
  synth: {
    oscillator: { type: "sawtooth" },
    envelope: { decay: 0.8, sustain: 0, release: 0.02 },
    filter: { rolloff: -12 },
    filterEnvelope: { octaves: 0, decay: 0.8, sustain: 0, release: 0.02 },
  },
  loop: { interval: "8n" },
  lfo: { frequency: "1n", min: 100, max: 2000, type: "sawtooth" },
  transport: { state: true },
};

const lfo = new LFO(options.lfo);

class SequencedPolySynth extends PolySynth {
  _getNextAvailableVoice() {
    // if there are available voices, return the first one
    if (this._availableVoices.length) {
      return this._availableVoices.shift();
    } else if (this._voices.length < this.maxPolyphony) {
      // otherwise if there is still more maxPolyphony, make a new voice
      const voice = new this.voice(
        Object.assign(this.options, {
          context: this.context,
          onsilence: this._makeVoiceAvailable.bind(this),
        })
      );
      voice.connect(this.output);
      this._voices.push(voice);
      lfo.connect(voice.filter.frequency);
      return voice;
    } else {
      warn("Max polyphony exceeded. Note dropped.");
    }
  }
}

const synth = new SequencedPolySynth(MonoSynth, {
  maxPolyphony: 4,
  ...options.synth,
});

synth.toDestination();

lfo.sync().start();

if (options.transport.bpm) {
  Transport.bpm.value = options.transport.bpm;
}

const voices = new Set();

const loop = new Loop((time) => {
  if (voices.size > 0) {
    const freqs = Array.from(voices).map((note) => Midi(note).toFrequency());
    synth.triggerAttackRelease(freqs, "1n", time);
  }
}, options.loop.interval).start();

const onMidi = ([status, data0, data1]) => {
  const message = Math.floor(status / 16);
  const channel = status % 16;

  switch (message) {
    // note on
    case 9: {
      voices.add(data0);
      break;
    }
    // note off
    case 8: {
      voices.delete(data0);
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

createLoop("#loop", (value) => {
  loop.set(value);
});

createLfo("#lfo", (value) => {
  lfo.set(value);
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

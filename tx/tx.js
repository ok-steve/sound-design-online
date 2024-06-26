import {
  Compressor,
  Delay,
  Filter,
  Freeverb,
  Gain,
  Loop,
  LFO,
  Master,
  Midi,
  OmniOscillator,
  Transport,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createCompressor,
  createDelay,
  createGain,
  createFilter,
  createFreeverb,
  createLfo,
  createLoop,
  createOmniOscillator,
  createTransport,
} from "../public/lib/nexus-tone-components.js";

const options = {
  oscillators: [
    { oscillator: { frequency: 130.81, type: "fatsine" }, gain: { gain: 1 } },
    {
      oscillator: { frequency: 130.81, type: "fattriangle", detune: -1200 },
      gain: { gain: 0.8 },
    },
    {
      oscillator: { frequency: 130.81, type: "fatsquare" },
      gain: { gain: 0.1 },
    },
  ],
  filter: { frequency: 1000, Q: 30 },
  lfo: { frequency: 0.25, min: 500, max: 2000 },
  delay: { delayTime: 0.1, maxDelay: 2 },
  reverb: { roomSize: 0.7, dampening: 1000 },
  compressor: { ratio: 12 },
  loop: { interval: "8n" },
  transport: { bpm: 96, state: false },
  master: { gain: 0.2 },
};

const oscillator1 = new OmniOscillator(options.oscillators[0].oscillator);
const gain1 = new Gain(options.oscillators[0].gain);
const oscillator2 = new OmniOscillator(options.oscillators[1].oscillator);
const gain2 = new Gain(options.oscillators[1].gain);
const oscillator3 = new OmniOscillator(options.oscillators[2].oscillator);
const gain3 = new Gain(options.oscillators[2].gain);
const filter = new Filter(options.filter);
const lfo = new LFO(options.lfo);
const delay = new Delay(options.delay);
const reverb = new Freeverb(options.reverb);
const compressor = new Compressor(options.compressor);
const master = new Gain(options.master);

filter.chain(delay, reverb, compressor, master, Master);
lfo.connect(filter.frequency);
oscillator1.chain(gain1, filter);
oscillator2.chain(gain2, filter);
oscillator3.chain(gain3, filter);

if (options.transport.bpm) {
  Transport.bpm.value = options.transport.bpm;
}

const loop = new Loop((time) => {
  const randomDetune = Math.random() * 400 - 200;
  filter.set("detune", randomDetune);
}, options.loop.interval);

createOmniOscillator("#oscillator-1", (value) => {
  oscillator1.set(value);
});

createGain("#gain-1", gain1.get(), (value) => {
  gain1.set(value);
});

createOmniOscillator("#oscillator-2", (value) => {
  oscillator2.set(value);
});

createGain("#gain-2", gain2.get(), (value) => {
  gain2.set(value);
});

createOmniOscillator("#oscillator-3", (value) => {
  oscillator3.set(value);
});

createGain("#gain-3", gain3.get(), (value) => {
  gain3.set(value);
});

createGain("#master", master.get(), (value) => {
  master.set(value);
});

createFilter("#filter", filter.get(), (value) => {
  filter.set(value);
});

createLfo("#lfo", lfo.get(), (value) => {
  lfo.set(value);
});

createDelay("#delay", delay.get(), (value) => {
  delay.set(value);
});

createFreeverb("#reverb", reverb.get(), (value) => {
  reverb.set(value);
});

createCompressor("#compressor", compressor.get(), (value) => {
  compressor.set(value);
});

createLoop("#loop", loop.get(), (value) => {
  loop.set(value);
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
          lfo.start();
          oscillator1.start();
          oscillator2.start();
          oscillator3.start();
          loop.start();
          Transport.start();
        } else {
          lfo.stop();
          oscillator1.stop();
          oscillator2.stop();
          oscillator3.stop();
          loop.stop();
          Transport.stop();
        }
      }
    }
  });
});

document.addEventListener(
  "click",
  async () => {
    await start();

    if (options.transport.state) {
      lfo.start();
      oscillator1.start();
      oscillator2.start();
      oscillator3.start();
      loop.start();
      Transport.start();
    }

    console.log("audio context resumed");
  },
  { once: true }
);

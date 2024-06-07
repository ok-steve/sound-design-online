import {
  AutoFilter,
  Freeverb,
  Noise,
  Time,
  Transport,
  start,
} from "https://cdn.skypack.dev/tone";
import {
  createAutoFilter,
  createFreeverb,
  createNoise,
  createPiano,
  createTransport,
} from "../public/lib/nexus-tone-components.js";

const options = {
  noise: { type: "white" },
  filter: {
    frequency: "4m",
    baseFrequency: 20,
    octaves: 6,
    type: "sawtooth",
    filter: { type: "bandpass", Q: 100 },
  },
  reverb: { roomSize: 0.2, dampening: 1000 },
  transport: { state: true },
};

const noise = new Noise(options.noise);
const filter = new AutoFilter(options.filter);
filter._lfo.set("phase", 180);
const reverb = new Freeverb(options.reverb);

noise.connect(filter);
filter.connect(reverb);
reverb.toDestination();

if (options.transport.bpm) {
  Transport.bpm.value = options.transport.bpm;
}

const onMidi = ([status, data0, data1]) => {
  const message = Math.floor(status / 16);
  const channel = status % 16;

  switch (message) {
    // note on
    case 9: {
      const len = Time(1 / filter.get("frequency").frequency).toSeconds();

      Transport.schedule((time) => {
        reverb.set("roomSize", options.reverb.roomSize);
        reverb.roomSize.linearRampTo(0.8, len, time);
        filter.filter.Q.set(options.filter.filter.Q);
        filter.filter.Q.linearRampTo(0.1, len, time);
        noise.start(time).stop(time + len);
        filter.start(time).stop(time + len);
      }, Transport.nextSubdivision(len));
      break;
    }
  }
};

createNoise("#noise", (value) => {
  noise.set(value);
});

createAutoFilter("#filter", (value) => {
  filter.set(value);
});

createFreeverb("#reverb", (value) => {
  reverb.set(value);
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

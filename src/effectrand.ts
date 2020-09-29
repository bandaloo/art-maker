import {
  edge,
  motionblur,
  hsv2rgb,
  rgb2hsv,
  time,
  changecomp,
  fcolor,
  a1,
  op,
  bloom,
  channel,
  pos,
  getcomp,
  vec2,
  len,
  rotate,
  translate,
  nmouse,
  Vec2,
} from "@bandaloo/merge-pass";
import {
  blurandtrace,
  celshade,
  foggyrays,
  kaleidoscope,
  noisedisplacement,
  vignette,
} from "postpre";
import { ChanceTable } from "./chancetable";
import { Effect, EffectFunc, randBetween, randInt } from "./utils";

function randPos() {
  const chanceTable = new ChanceTable<() => Vec2>();
  chanceTable.addAll([
    [() => nmouse(), 3],
    [() => vec2(0.5, 0.5), 1],
    [
      (() => {
        const freq1 = (1 + randInt(5)) / 3;
        const freq2 = (1 + randInt(5)) / 3;
        const s = op(a1("sin", op(time(), "*", freq1)), "*", 0.5);
        const c = op(a1("cos", op(time(), "*", freq2)), "*", 0.5);
        return () => vec2(op(s, "+", 0.5), op(c, "+", 0.5));
      })(),
      1,
    ],
  ]);

  return chanceTable.pick()();
}

const kaleidoscopeRand = () => {
  const chanceTable = new ChanceTable<number>();
  chanceTable.addAll([
    [4, 2],
    [8, 2],
    [12, 1],
    [16, 1],
    [32, 0.5],
  ]);
  return kaleidoscope(chanceTable.pick());
};

const edgeRand = () => {
  return edge((-1) ** Math.floor(1 + Math.random() * 2));
};

const noiseDisplacementRand = () => {
  const period = 0.01 + Math.random() ** 3;
  const intensity = period * (0.1 + 0.2 * Math.random() ** 3);
  const speed = randBetween(-1.5, 1.5);
  return noisedisplacement(period, speed, intensity);
};

const foggyRaysRand = () => {
  return foggyrays(100, 1, 0.3, 60, -1);
};

const motionBlurRand = () => {
  return motionblur(1, randBetween(0.1, 0.4));
};

const blurAndTraceRand = () => {
  return blurandtrace(randBetween(-1, 1));
};

const bloomRand = () => {
  const threshold = randBetween(0.3, 0.5);
  const boost = randBetween(1.2, 1.5);
  return bloom(threshold, 1, 1, boost, 0);
};

const hueRotateRand = () => {
  const speed = randBetween(0.01, 1) ** 2;
  const timeExpr = op(time(), "*", speed);
  return hsv2rgb(
    changecomp(
      rgb2hsv(fcolor()),
      Math.random() < 0
        ? op(timeExpr, "/", 2)
        : op(a1("sin", timeExpr), "*", randBetween(0.05, 0.2)),
      "r",
      "+"
    )
  );
};

const colorDisplacementRand = () => {
  const c = "rgb"[randInt(3)];
  const d = "xy"[randInt(2)];
  const o = Math.random() > 0.5 ? "+" : "-";
  const mult = randBetween(0.01, 1.5) / 10;
  return channel(
    -1,
    changecomp(pos(), op(getcomp(fcolor(), c), "*", mult), d, o)
  );
};

const swirlRand = () => {
  const size = randBetween(1, 120); // inversely proportional
  const intensity = randBetween(5, 50) * (Math.random() > 0.5 ? 1 : -1);
  //const vec = vec2(0.5, 0.5);
  const vec = randPos();
  const dist = op(len(op(pos(), "-", vec)), "*", size);
  const angle = op(op(1, "/", op(1, "+", dist)), "*", intensity);
  const centered = translate(pos(), op(vec, "*", -1));
  const rot = rotate(centered, angle);
  const reverted = translate(rot, vec);
  return channel(-1, reverted);
};

const celShadeRand = () => {
  return celshade(1, 0, 0.2, 0.03);
};

const chanceTable = new ChanceTable<EffectFunc>();

chanceTable.addAll([
  [kaleidoscopeRand, 2, -Infinity],
  [noiseDisplacementRand, 3, -1],
  [edgeRand, 1],
  [blurAndTraceRand, 0.5, -0.25],
  [vignette, 0.5],
  [hueRotateRand, 1, -Infinity],
  [foggyRaysRand, 3, -Infinity],
  [motionBlurRand, 1, -Infinity],
  [bloomRand, 0.25, -Infinity],
  [celShadeRand, 3, -Infinity],
  [colorDisplacementRand, 1],
  [swirlRand, 2, -Infinity],
]);

export function randomEffects(num: number): Effect[] {
  return chanceTable.pick(num).map((n) => n());
}

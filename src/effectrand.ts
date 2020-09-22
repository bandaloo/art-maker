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
} from "@bandaloo/merge-pass";
import {
  blurandtrace,
  foggyrays,
  kaleidoscope,
  noisedisplacement,
  oldfilm,
  vignette,
} from "postpre";
import { ChanceTable } from "./chancetable";
import { Effect, EffectFunc, randBetween, randInt } from "./utils";

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

const chanceTable = new ChanceTable<EffectFunc>();

// TODO bloom can share the blur and trace scratch buffer (0)

chanceTable.addAll([
  [kaleidoscopeRand, 2, -Infinity],
  [noiseDisplacementRand, 1],
  [edgeRand, 1],
  [blurAndTraceRand, 0.5, -0.25],
  [vignette, 0.5],
  [hueRotateRand, 1, -Infinity],
  //[oldfilm, 0.25, -Infinity],
  [foggyRaysRand, 3, -Infinity],
  [motionBlurRand, 0.5, -Infinity],
]);

export function randomEffects(num: number): Effect[] {
  return chanceTable.pick(num).map((n) => n());
}

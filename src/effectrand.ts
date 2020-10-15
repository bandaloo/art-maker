import {
  edge,
  motionblur,
  hsv2rgb,
  rgb2hsv,
  time,
  changecomp,
  fcolor,
  a1,
  a2,
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
  brightness,
  random,
  pixel,
  pfloat,
  Float,
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
import { Effect, EffectFunc, Rand } from "./utils";

function randPos(rand: Rand) {
  const chanceTable = new ChanceTable<() => Vec2>(rand);
  chanceTable.addAll([
    [() => nmouse(), 3],
    [() => vec2(0.5, 0.5), 1],
    [
      (() => {
        const freq1 = (1 + rand.int(5)) / 3;
        const freq2 = (1 + rand.int(5)) / 3;
        const s = op(a1("sin", op(time(), "*", freq1)), "*", 0.5);
        const c = op(a1("cos", op(time(), "*", freq2)), "*", 0.5);
        return () => vec2(op(s, "+", 0.5), op(c, "+", 0.5));
      })(),
      1,
    ],
  ]);

  return chanceTable.pick()();
}

const kaleidoscopeRand = (rand: Rand) => {
  const chanceTable = new ChanceTable<number>(rand);
  chanceTable.addAll([
    [4, 2],
    [8, 2],
    [12, 1],
    [16, 1],
    [32, 0.5],
  ]);
  return kaleidoscope(chanceTable.pick());
};

const edgeRand = (rand: Rand) => {
  return edge((-1) ** Math.floor(1 + rand.random() * 2));
};

const noiseDisplacementRand = (rand: Rand) => {
  const period = 0.01 + rand.random() ** 3;
  const periodExpr =
    rand.random() < 0.7
      ? pfloat(period)
      : op(op(op(getcomp(nmouse(), "x"), "*", 0.5), "+", 0.5), "*", period * 2);
  const intensity = period * (0.1 + 0.2 * rand.random() ** 3);
  const speed = rand.between(-1.5, 1.5);
  const speedExpr =
    rand.random() < 0.7
      ? pfloat(speed)
      : op(getcomp(nmouse(), "x"), "*", speed * 2);
  const intensityExpr =
    rand.random() < 0.7
      ? pfloat(intensity)
      : op(getcomp(nmouse(), "x"), "*", intensity * 2);
  return noisedisplacement(periodExpr, speedExpr, intensityExpr);
};

const foggyRaysRand = () => {
  return foggyrays(100, 1, 0.3, 60, -1);
};

const motionBlurRand = (rand: Rand) => {
  return motionblur(1, rand.between(0.1, 0.4));
};

const blurAndTraceRand = (rand: Rand) => {
  return blurandtrace(rand.between(-1, 1));
};

const bloomRand = (rand: Rand) => {
  const threshold = rand.between(0.3, 0.5);
  const boost = rand.between(1.2, 1.5);
  return bloom(threshold, 1, 1, boost, 0);
};

const hueRotateRand = (rand: Rand) => {
  const speed = rand.between(0.01, 1) ** 2;
  const timeExpr = op(time(), "*", speed);
  return hsv2rgb(
    changecomp(
      rgb2hsv(fcolor()),
      rand.random() < 0
        ? op(timeExpr, "/", 2)
        : op(a1("sin", timeExpr), "*", rand.between(0.05, 0.2)),
      "r",
      "+"
    )
  );
};

const colorDisplacementRand = (rand: Rand) => {
  const c = "rgb"[rand.int(3)];
  const d = "xy"[rand.int(2)];
  const o = rand.random() > 0.5 ? "+" : "-";
  const mult = pfloat(rand.between(0.01, 1.5) / 10);
  const chanceTable = new ChanceTable<Float>(rand);
  chanceTable.addAll([
    [mult, 1],
    [op(mult, "*", a1("sin", op(time(), "*", rand.between(0.2, 1.3)))), 1],
    [op(mult, "*", getcomp(nmouse(), rand.random() < 0.5 ? "x" : "y")), 1],
  ]);
  const inside = chanceTable.pick();
  return channel(
    -1,
    changecomp(pos(), op(getcomp(fcolor(), c), "*", inside), d, o)
  );
};

const swirlRand = (rand: Rand) => {
  const size = rand.between(1, 120); // inversely proportional
  const intensity = rand.between(5, 50) * (rand.random() > 0.5 ? 1 : -1);
  const vec = randPos(rand);
  const dist = op(len(op(pos(), "-", vec)), "*", size);
  const angle = op(op(1, "/", op(1, "+", dist)), "*", intensity);
  const centered = translate(pos(), op(vec, "*", -1));
  const rot = rotate(centered, angle);
  const reverted = translate(rot, vec);
  return channel(-1, reverted);
};

const repeatRand = (rand: Rand) => {
  const h = rand.int(6) + 3;
  const v = rand.int(6) + 3;
  const vec =
    rand.random() < 0.5
      ? vec2(h, v)
      : vec2(
          a1("floor", op(getcomp(nmouse(), "x"), "*", h * 2)),
          a1("floor", op(getcomp(nmouse(), "y"), "*", v * 2))
        );
  return channel(-1, a2("mod", op(pos(), "*", vec), vec2(1, 1)));
};

const celShadeRand = () => {
  return celshade(1, 0, 0.2, 0.03);
};

const grainRand = (rand: Rand) => {
  const intensity = rand.between(0.1, 0.3) * (rand.random() < 0.5 ? 1 : -1);
  const position = op(pixel(), "*", 0.3);
  const inside = rand.random() < 0.5 ? position : op(position, "+", time());
  return brightness(op(random(inside), "*", intensity));
};

const vignetteRand = (rand: Rand) => {
  return vignette();
};

export function randomEffects(num: number, rand: Rand): Effect[] {
  const chanceTable = new ChanceTable<EffectFunc>(rand);

  chanceTable.addAll([
    [kaleidoscopeRand, 2, -Infinity],
    [noiseDisplacementRand, 3, -1],
    [edgeRand, 1],
    [blurAndTraceRand, 0.5, -0.25],
    [vignetteRand, 0.5],
    [hueRotateRand, 1, -Infinity],
    [foggyRaysRand, 3, -Infinity],
    [motionBlurRand, 1, -Infinity],
    [bloomRand, 0.25, -Infinity],
    [celShadeRand, 3, -Infinity],
    [colorDisplacementRand, 3],
    [swirlRand, 1, -Infinity],
    [repeatRand, 2, -1],
    [grainRand, 1, -Infinity],
  ]);

  return chanceTable.pick(num).map((n) => n(rand));
}

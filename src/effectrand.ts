import { Vec4, EffectLoop, edge } from "@bandaloo/merge-pass";
import {
  blurandtrace,
  kaleidoscope,
  noisedisplacement,
  oldfilm,
  vignette,
} from "postpre";
import { ChanceTable } from "./chancetable";
import { EffectFunc } from "./utils";

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

// TODO pick multiple with removal
const chanceTable = new ChanceTable<EffectFunc>();

// TODO motion blur but separate it from the blur and trace buffer!

chanceTable.addAll([
  [kaleidoscopeRand, 1],
  [noisedisplacement, 1],
  [edgeRand, 1],
  [blurandtrace, 0.5],
  [vignette, 2],
]);

export function randomEffect() {
  return chanceTable.pick()();
}

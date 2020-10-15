import { ChanceTable } from "../chancetable";
import {
  H,
  V,
  R,
  DrawFunc,
  mix,
  TupleVec3,
  randBackgroundFunc,
} from "../utils";
import { Rand } from "../rand";

type ColorFunc = (i: number, j: number) => number;
type SizeFunc = (i: number, j: number, t: number) => number;

export function bitGrid(rand: Rand): DrawFunc {
  const r = () => rand.random() * 255;
  const color1: TupleVec3 = [r(), r(), r()];
  const color2: TupleVec3 = [r(), r(), r()];
  const hNum = Math.floor(rand.between(15, 40));
  const vNum = Math.floor(rand.between(15, 40));

  const clearBackground = randBackgroundFunc(rand);

  const smooth = rand.random() > 0.2;

  const xorFunc = (() => {
    const div = rand.between(10, 50);
    const m = rand.between(1, 2);
    return (i: number, j: number) => ((i ^ j) / div) % m;
  })();
  const andFunc = (() => {
    const div = rand.between(1, 4);
    return (i: number, j: number) => (i & j) / div;
  })();
  const plusMinusXorFunc = (() => {
    const div = rand.between(3, 12);
    const m = Math.floor(rand.between(1, 6));
    return (i: number, j: number) => (((i - j) ^ (j + i)) / div) % m;
  })();

  const colorFuncTable = new ChanceTable<ColorFunc>(rand);
  colorFuncTable.addAll([
    [xorFunc, 1],
    [andFunc, 2],
    [plusMinusXorFunc, 1],
  ]);
  const colorFunc = colorFuncTable.pick();

  const sinFunc = (() => {
    const xAmp = rand.between(0.3, 1.5);
    const yAmp = rand.between(0.3, 1.5);
    const xSpeed = rand.between(0.3, 2);
    const ySpeed = rand.between(0.3, 2);
    const xFreq = rand.between(1, 9);
    const yFreq = rand.between(1, 9);
    return (i: number, j: number, t: number) =>
      xAmp * Math.sin(xSpeed * t + xFreq * i) +
      yAmp * Math.cos(ySpeed + t + yFreq * j);
  })();
  const oneFunc = () => 1;

  const sizeFuncTable = new ChanceTable<SizeFunc>(rand);
  sizeFuncTable.addAll([
    [sinFunc, 1.5],
    [oneFunc, 1],
  ]);
  const sizeFunc = sizeFuncTable.pick();

  const hSize = H / hNum;
  const vSize = V / vNum;

  const speed = rand.random() < 0.05 ? 0 : 0.25 + rand.random() * 9;
  const up = rand.random() < 0.5;
  const iSpeed = !up ? speed : 0;
  const jSpeed = up ? speed : 0;

  const overscan = sizeFunc !== oneFunc ? 2 : 0;
  const overscanX = iSpeed !== 0 ? overscan : 0;
  const overscanY = jSpeed !== 0 ? overscan : 0;

  return (
    t: number,
    fr: number,
    x: CanvasRenderingContext2D,
    c: HTMLCanvasElement
  ) => {
    clearBackground(x);
    for (let i = 0 - overscanX; i < hNum + 1 + overscanX; i++) {
      const ri = Math.floor(i + t * iSpeed);
      const iOffset = smooth ? (t * iSpeed) % 1 : 0;
      for (let j = 0 - overscanY; j < vNum + 1 + overscanY; j++) {
        const rj = Math.floor(j + t * jSpeed);
        const jOffset = smooth ? (t * jSpeed) % 1 : 0;
        const size = sizeFunc(ri, rj, t);
        x.fillStyle = R(...mix(color1, color2, colorFunc(ri, rj)));
        x.fillRect(
          (i - iOffset) * hSize,
          (j - jOffset) * vSize,
          hSize * size,
          vSize * size
        );
      }
    }
  };
}

import { ChanceTable } from "../chancetable";
import {
  H,
  V,
  S,
  C,
  R,
  DrawFunc,
  mix,
  TupleVec3,
  randBetween,
  randBackgroundFunc,
} from "../utils";

type ColorFunc = (i: number, j: number) => number;
type SizeFunc = (i: number, j: number, t: number) => number;

export function bitGrid(): DrawFunc {
  const r = () => Math.random() * 255;
  const color1: TupleVec3 = [r(), r(), r()];
  const color2: TupleVec3 = [r(), r(), r()];
  const hNum = Math.floor(randBetween(15, 40));
  const vNum = Math.floor(randBetween(15, 40));

  const clearBackground = randBackgroundFunc();

  const smooth = Math.random() > 0.2;

  const xorFunc = (() => {
    const div = randBetween(10, 50);
    const m = randBetween(1, 2);
    return (i: number, j: number) => ((i ^ j) / div) % m;
  })();
  const andFunc = (() => {
    const div = randBetween(1, 4);
    return (i: number, j: number) => (i & j) / div;
  })();
  const plusMinusXorFunc = (() => {
    const div = randBetween(3, 12);
    const m = Math.floor(randBetween(1, 6));
    return (i: number, j: number) => (((i - j) ^ (j + i)) / div) % m;
  })();

  const colorFuncTable = new ChanceTable<ColorFunc>();
  colorFuncTable.addAll([
    [xorFunc, 1],
    [andFunc, 2],
    [plusMinusXorFunc, 1],
  ]);
  const colorFunc = colorFuncTable.pick();

  const sinFunc = (() => {
    const xAmp = randBetween(0.3, 1.5);
    const yAmp = randBetween(0.3, 1.5);
    const xSpeed = randBetween(0.3, 2);
    const ySpeed = randBetween(0.3, 2);
    const xFreq = randBetween(1, 9);
    const yFreq = randBetween(1, 9);
    return (i: number, j: number, t: number) =>
      xAmp * Math.sin(xSpeed * t + xFreq * i) +
      yAmp * Math.cos(ySpeed + t + yFreq * j);
  })();
  const oneFunc = () => 1;

  const sizeFuncTable = new ChanceTable<SizeFunc>();
  sizeFuncTable.addAll([
    [sinFunc, 1.5],
    [oneFunc, 1],
  ]);
  const sizeFunc = sizeFuncTable.pick();

  const hSize = H / hNum;
  const vSize = V / vNum;

  const speed = Math.random() < 0.05 ? 0 : 0.25 + Math.random() * 9;
  const up = Math.random() < 0.5;
  const iSpeed = !up ? speed : 0;
  const jSpeed = up ? speed : 0;

  return (
    t: number,
    fr: number,
    x: CanvasRenderingContext2D,
    c: HTMLCanvasElement
  ) => {
    clearBackground(x);
    for (let i = 0; i < hNum + 1; i++) {
      const ri = Math.floor(i + t * iSpeed);
      const iOffset = smooth ? (t * iSpeed) % 1 : 0;
      for (let j = 0; j < vNum + 1; j++) {
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

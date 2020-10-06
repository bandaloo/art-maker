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
  randInt,
  randBackgroundFunc,
} from "../utils";

export function roseDots(): DrawFunc {
  // common attributes
  const r = () => Math.random() * 255;
  const color1: TupleVec3 = [r(), r(), r()];
  const color2: TupleVec3 = [r(), r(), r()];
  const size = 0.5 + Math.random();
  const freq = 0.8 + Math.random();
  const speed = randBetween(0.25, 1.75);
  const num = Math.floor(randBetween(30, 70));
  const clearBackground = randBackgroundFunc();

  // specific to second drawing pattern
  const lineWidth = randBetween(3, 15);
  const segments = [15 + randInt(20), randInt(20), randInt(20)];
  const copies = randInt(15) + 2;
  const spacing = randBetween(100, 500);
  const chanceTable = new ChanceTable<(i: number, t: number) => number>();
  chanceTable.addAll([
    [(i: number, t: number) => Math.tan(freq2 * t + freq3 * i), 1],
    [(i: number, t: number) => Math.sin(freq2 * t + freq3 * i), 1],
    [(i: number, t: number) => Math.sin(freq2 * t + freq3 * i) ** 3, 1],
    [(i: number, t: number) => speed * i * t, 1],
  ]);
  const posFunc = chanceTable.pick();
  const freq2 = randBetween(0.2, 2);
  const freq3 = randBetween(0.2, 2);

  return Math.random() < 0.5
    ? (
        t: number,
        fr: number,
        x: CanvasRenderingContext2D,
        c: HTMLCanvasElement
      ) => {
        clearBackground(x);
        for (let i = 0; i < num; i += 0.5) {
          x.beginPath();
          let d = 2 * C((2 + S((speed * t) / 99)) * 2 * i);
          x.arc(
            H / 2 + d * 9 * C(i * freq) * i,
            V / 2 + d * 9 * S(i * freq) * i,
            i * size,
            0,
            Math.PI * 2
          );
          x.fillStyle = R(...mix(color1, color2, i / 50));
          x.fill();
        }
      }
    : (
        t: number,
        fr: number,
        x: CanvasRenderingContext2D,
        c: HTMLCanvasElement
      ) => {
        clearBackground(x);
        x.lineWidth = lineWidth;
        x.setLineDash(segments);
        for (let i = 0; i < copies; i++) {
          x.strokeStyle = R(...mix(color1, color2, i / (copies - 1)));
          x.beginPath();
          for (let j = 0; j < num; j++) {
            x.lineTo(
              (j / (num - 1)) * H,
              V / 2 +
                99 * size * Math.sin(j / freq + speed * posFunc(i, t)) +
                spacing * ((i - (copies - 1) / 2) / (copies - 1))
            );
          }
          x.stroke();
        }
      };
}

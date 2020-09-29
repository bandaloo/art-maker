import { H, V, S, C, R, DrawFunc, mix, TupleVec3, randBetween } from "../utils";

export function roseDots(): DrawFunc {
  const r = () => Math.random() * 255;
  const color1: TupleVec3 = [r(), r(), r()];
  const color2: TupleVec3 = [r(), r(), r()];
  const b = Math.floor(Math.random() * 2) * 255;
  const background = R(b, b, b);
  const size = 0.5 + Math.random();
  const freq = 0.8 + Math.random();
  const speed = randBetween(0.25, 1.75);
  const num = Math.floor(randBetween(30, 70));
  return (
    t: number,
    fr: number,
    x: CanvasRenderingContext2D,
    c: HTMLCanvasElement
  ) => {
    x.fillStyle = background;
    x.fillRect(0, 0, H, V);
    let d;
    for (let i = 0; i < num; i += 0.5) {
      x.beginPath();
      d = 2 * C((2 + S((speed * t) / 99)) * 2 * i);
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
  };
}

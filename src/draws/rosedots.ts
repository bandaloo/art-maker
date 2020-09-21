import { H, V, S, C, R, DrawFunc } from "../shorthands";

// TODO randomize
export function roseDots(): DrawFunc {
  return (
    t: number,
    fr: number,
    x: CanvasRenderingContext2D,
    c: HTMLCanvasElement
  ) => {
    x.fillStyle = "white";
    x.fillRect(0, 0, H, V);
    let d;
    for (let i = 50; (i -= 0.5); ) {
      x.beginPath();
      d = 2 * C((2 + S(t / 99)) * 2 * i);
      x.arc(H / 2 + d * 10 * C(i) * i, V / 2 + d * 9 * S(i) * i, i, 0, 44 / 7);
      x.fillStyle = R(i * 5);
      x.fill();
    }
  };
}

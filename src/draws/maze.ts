import { Colors } from "../artmaker";
import { Rand } from "../rand";
import { clamp, clearBackground, DrawFunc, H, mix, R, V } from "../utils";

export const drawChar = (
  context: CanvasRenderingContext2D,
  /** between -1 and 1 */
  side: number,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const centerX = width * x + width / 2;
  const y1 = height * y;
  const y2 = height * (y + 1);

  context.beginPath();
  context.moveTo(centerX - (side * width) / 2, y1);
  context.lineTo(centerX + (side * width) / 2, y2);
  context.stroke();
};

export function maze(rand: Rand, colors: Colors): DrawFunc {
  const hNum = Math.floor(rand.between(10, 60));
  const vNum = Math.floor(rand.between(10, 60));

  const hSize = H / hNum;
  const vSize = V / vNum;

  const lineWidth = rand.between(5, 20);

  const genFunc = (): ((i: number, j: number, t: number) => number) => {
    const s = [...new Array(6)].map(() =>
      Math.max(9 * rand.random() ** 4, 0.05)
    );
    const amp = rand.between(2, 15);
    return (i: number, j: number, t: number) =>
      Math.cos(s[0] * t + s[1] * i + s[2] * j) +
      Math.sin(s[3] * t + s[4] * i + s[5] * j) * amp;
  };

  const tiltFunc = genFunc();
  const colorFunc = genFunc();

  return (t: number, x: CanvasRenderingContext2D) => {
    x.lineWidth = lineWidth;
    clearBackground(x, colors.back);
    for (let i = 0; i < hNum; i++) {
      for (let j = 0; j < vNum; j++) {
        x.strokeStyle = R(
          ...mix(
            colors.fore1,
            colors.fore2,
            clamp(colorFunc(i, j, t / 3) / 9, 0, 1)
          )
        );
        drawChar(x, clamp(tiltFunc(i, j, t), -1, 1), i, j, hSize, vSize);
      }
    }
  };
}

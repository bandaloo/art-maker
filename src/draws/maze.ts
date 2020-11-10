import { Rand } from "../rand";
import { DrawFunc, H, randBackgroundFunc, TupleVec3, V } from "../utils";

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
  const y1 = width * x;
  const y2 = height * (y + 1);

  context.beginPath();
  context.moveTo(centerX - (side * width) / 2, y1);
  context.lineTo(centerX + (side * width) / 2, y2);
  context.stroke();
};

export function maze(rand: Rand): DrawFunc {
  const r = () => rand.random() * 255;
  const color1: TupleVec3 = [r(), r(), r()];
  const color2: TupleVec3 = [r(), r(), r()];

  const hNum = Math.floor(rand.between(30, 60));
  const vNum = Math.floor(rand.between(30, 60));

  const hSize = H / hNum;
  const vSize = V / vNum;

  const lineWidth = rand.between(5, 10);
  const clearBackground = randBackgroundFunc(rand);
  return (
    t: number,
    fr: number,
    x: CanvasRenderingContext2D,
    c: HTMLCanvasElement
  ) => {
    x.lineWidth = lineWidth;
    x.strokeStyle = "black";
    clearBackground(x);
    for (let i = 0; i < vNum; i++) {
      for (let j = 0; j < hNum; j++) {
        drawChar(x, Math.random() < 0.5 ? 1 : -1, i, j, hSize, vSize);
      }
    }
  };
}

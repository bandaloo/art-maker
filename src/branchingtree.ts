import { Colors } from "./artmaker";
import { Rand } from "./rand";
import { clearBackground, DrawFunc, H, mix, R, V } from "./utils";

export function branchingTree(rand: Rand, colors: Colors): DrawFunc {
  const lineWidth = 60 * rand.random() ** 3;
  const maxIter = 10;
  const size = rand.between(250, 400);
  const decr = rand.between(0.8, 0.9);
  const rate = rand.between(0.2, 2);
  const amp = rand.between(0.2, 1.2);

  const drawBranch = (
    x: number,
    y: number,
    length: number,
    angle: number,
    twist: number,
    iter: number,
    context: CanvasRenderingContext2D
  ) => {
    if (iter <= 0) return;
    context.strokeStyle = R(
      ...mix(colors.fore1, colors.fore2, (iter - 1) / (maxIter - 1))
    );
    const x2 = x + length * Math.cos(angle);
    const y2 = y + length * Math.sin(angle);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x2, y2);
    context.stroke();
    drawBranch(x2, y2, length * decr, angle - twist, twist, iter - 1, context);
    drawBranch(x2, y2, length * decr, angle + twist, twist, iter - 1, context);
  };

  return (t: number, x: CanvasRenderingContext2D) => {
    x.lineWidth = lineWidth;
    clearBackground(x, colors.back);
    drawBranch(
      H / 2,
      V,
      size,
      -Math.PI / 2,
      amp * Math.sin(rate * t),
      maxIter,
      x
    );
  };
}

// default resolution
export const H = 1920;
export const V = 1080;

// dwitter sim
export const C = Math.cos;
export const S = Math.sin;
export const T = Math.tan;

export const R = (r?: any, g?: any, b?: any, a: any = 1) =>
  `rgba(${r | 0},${g | 0},${b | 0},${a})`;

export type DrawFunc = (
  t: number,
  fr: number,
  x: CanvasRenderingContext2D,
  c: HTMLCanvasElement
) => void;

// default resolution
export const H = 1920;
export const V = 1080;

// dwitter sim
export const C = Math.cos;
export const S = Math.sin;
export const T = Math.tan;

export const R = (r?: any, g?: any, b?: any, a: any = 1) =>
  `rgba(${r | 0},${g | 0},${b | 0},${a})`;

// types
export type DrawFunc = (
  t: number,
  fr: number,
  x: CanvasRenderingContext2D,
  c: HTMLCanvasElement
) => void;

export type TupleVec2 = [number, number];
export type TupleVec3 = [number, number, number];
export type TupleVec4 = [number, number, number, number];
export type TupleVec = TupleVec2 | TupleVec3 | TupleVec4;

// utility functions
export function mix<T extends TupleVec2>(a: T, b: T, num: number): TupleVec2;
export function mix<T extends TupleVec3>(a: T, b: T, num: number): TupleVec3;
export function mix<T extends TupleVec4>(a: T, b: T, num: number): TupleVec4;
export function mix<T extends TupleVec>(a: T, b: T, num: number): T {
  return a.map((n, i) => n + (b[i] - n) * num) as T;
}

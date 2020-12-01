import { Vec4, EffectLoop } from "@bandaloo/merge-pass";
import { Rand } from "./rand";

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
export type DrawFunc = (t: number, x: CanvasRenderingContext2D) => void;

export type Effect = Vec4 | EffectLoop;
export type EffectFunc = (rand: Rand) => Effect | Effect[];

export type TupleVec2 = [number, number];
export type TupleVec3 = [number, number, number];
export type TupleVec4 = [number, number, number, number];
export type TupleVec = TupleVec2 | TupleVec3 | TupleVec4;

// vector functions
export function mix<T extends TupleVec2>(a: T, b: T, num: number): TupleVec2;
export function mix<T extends TupleVec3>(a: T, b: T, num: number): TupleVec3;
export function mix<T extends TupleVec4>(a: T, b: T, num: number): TupleVec4;
export function mix<T extends TupleVec>(a: T, b: T, num: number): T {
  return a.map((n, i) => n + (b[i] - n) * num) as T;
}

// drawing functions
export function clearBackground(x: CanvasRenderingContext2D, color: TupleVec3) {
  x.fillStyle = R(...color);
  x.fillRect(0, 0, H, V);
}

// math
export function clamp(n: number, lo: number, hi: number) {
  return Math.min(Math.max(n, lo), hi);
}

// color conversion
export function hexColorToVector(str: string) {
  str = str.slice(1); // get rid of first char
  const vals = str.match(/..?/g); // split into groups of two
  if (vals === null) throw new Error("no matches for color conversion");
  if (vals.length !== 3) throw new Error("wrong length for color");
  const vec = vals.map((n) => parseInt(n, 16));
  return vec as TupleVec3;
}

export function colorVectorToHex(color: TupleVec3) {
  return "#" + color.map((n) => n.toString(16).padStart(2, "0")).join("");
}

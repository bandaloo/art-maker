import { Vec4, EffectLoop } from "@bandaloo/merge-pass";
import seedrandom from "seedrandom";

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

export type Effect = Vec4 | EffectLoop;
export type EffectFunc = () => Effect;

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

// random functions
export function randBetween(lo: number, hi: number) {
  return lo + (hi - lo) * Math.random();
}

export function randInt(num: number) {
  return Math.floor(Math.random() * num);
}

export function randString(length: number) {
  return [...Array(length)]
    .map(() => "abcdefghijklmnopqrstuvwxyz"[Math.floor(26 * seedrandom()())])
    .join("");
}

// browser functions
export function getQuery(variable: string, query: string) {
  const vars = query.split("&");
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return undefined;
}

// drawing functions
export function randBackgroundFunc() {
  const b = Math.floor(Math.random() * 2) * 255;
  const background = R(b, b, b);
  return (x: CanvasRenderingContext2D) => {
    x.fillStyle = background;
    x.fillRect(0, 0, H, V);
  };
}

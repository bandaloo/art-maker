import * as MP from "@bandaloo/merge-pass";
import * as PP from "postpre";

const H = 1920;
const V = 1080;

const glCanvas = document.getElementById("gl") as HTMLCanvasElement;
const gl = glCanvas.getContext("webgl2");

const mousePos = { x: 0, y: 0 };

if (gl === null) {
  throw new Error("problem getting the gl context");
}

const sourceCanvas = document.getElementById("source") as HTMLCanvasElement;
const source = sourceCanvas.getContext("2d");

if (source === null) {
  throw new Error("problem getting the source context");
}

const merger = new MP.Merger(
  [PP.kaleidoscope(), PP.noisedisplacement()],
  sourceCanvas,
  gl
);

// dwitter sim
const C = Math.cos;
const S = Math.sin;
const T = Math.tan;

let x: CanvasRenderingContext2D;
let c: HTMLCanvasElement;
let R = (r?: any, g?: any, b?: any, a: any = 1) =>
  `rgba(${r | 0},${g | 0},${b | 0},${a})`;

x = source;
c = sourceCanvas;

const redSpiral = (t: number, frames: number) => {
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

let frames = 0;

const update = (time: number) => {
  redSpiral(time / 1000, frames++);
  merger.draw(time / 1000);
  requestAnimationFrame(update);
};

update(0);

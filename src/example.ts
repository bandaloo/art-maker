import * as MP from "@bandaloo/merge-pass";
import * as PP from "postpre";
import { roseDots } from "./draws/rosedots";
import { H, V } from "./shorthands";

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

// add mouse controls
glCanvas.addEventListener("click", () => glCanvas.requestFullscreen());
glCanvas.addEventListener("mousemove", (e) => {
  const rect = glCanvas.getBoundingClientRect();
  mousePos.x = (H * (e.clientX - rect.left)) / rect.width;
  mousePos.y = (V * (rect.height - (e.clientY - rect.top))) / rect.height;
});

// fullscreen listener
sourceCanvas.addEventListener("click", () => sourceCanvas.requestFullscreen());

let frames = 0;

// TODO randomize the draw funcs, splitting across extra buffers
const drawFunc = roseDots();

const update = (time: number) => {
  drawFunc(time / 1000, frames, source, sourceCanvas);
  merger.draw(time / 1000);
  requestAnimationFrame(update);
};

update(0);

import * as MP from "@bandaloo/merge-pass";
import { roseDots } from "./draws/rosedots";
import { randomEffects } from "./effectrand";
import { H, V } from "./utils";

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

const effects = [...randomEffects(3)];

const merger = new MP.Merger(effects, sourceCanvas, gl, {
  channels: [null, null],
});

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

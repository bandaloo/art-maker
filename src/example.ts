import * as MP from "@bandaloo/merge-pass";
import { ChanceTable } from "./chancetable";
import { bitGrid } from "./draws/bitgrid";
import { roseDots } from "./draws/rosedots";
import { randomEffects } from "./effectrand";
import { DrawFunc, getQuery, H, randString, V } from "./utils";
import seedrandom from "seedrandom";

let curAnimationFrame: number;
let reset = false;

const gotIt = document.getElementById("gotit");
if (gotIt === null) throw new Error("got it button was null");

const instructions = document.getElementById("instructions");
if (instructions === null) throw new Error("instructions div was null");

gotIt.addEventListener("click", () => {
  console.log("clicked");
  instructions?.remove();
});

const more = document.getElementById("more");
if (more === null) throw new Error("more button was null");

const info = document.getElementById("info");
if (info === null) throw new Error("info div was null");

more.addEventListener("click", () => {
  console.log("test");
  if (info.style.display === "none") {
    more.innerText = "Less";
    info.style.display = "block";
  } else {
    more.innerText = "More";
    info.style.display = "none";
    console.log(info.style.display);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    cancelAnimationFrame(curAnimationFrame);
    main();
  }
});

function updatePath(name: string) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("s", name);
  const query = window.location.pathname + "?" + searchParams.toString();
  history.pushState(null, "", query);
}

function main() {
  const preset = window.location.search.substring(1);
  const query = !reset ? getQuery("s", preset) : undefined;
  const seed = query ?? randString(8);
  console.log("seed", seed);
  if (seed === undefined) throw new Error("seed was somehow undefined");
  seedrandom(seed, { global: true });
  reset = true;
  updatePath(seed);

  const glCanvas = document.getElementById("gl") as HTMLCanvasElement;
  const gl = glCanvas.getContext("webgl2");

  const mousePos = { x: H / 2, y: V / 2 };

  if (gl === null) {
    throw new Error("problem getting the gl context");
  }

  const sourceCanvas = document.getElementById("source") as HTMLCanvasElement;
  const source = sourceCanvas.getContext("2d");

  if (source === null) {
    throw new Error("problem getting the source context");
  }

  // clear the canvas (we reuse this canvas on reset so it can be dirtied)
  source.fillStyle = "white";
  source.fillRect(0, 0, H, V);

  const effects = [...randomEffects(3)];

  const merger = new MP.Merger(effects, sourceCanvas, gl, {
    channels: [null, null],
    edgeMode: "wrap",
  });

  // add mouse controls
  glCanvas.addEventListener("click", () => glCanvas.requestFullscreen());
  glCanvas.addEventListener("mousemove", (e) => {
    const rect = glCanvas.getBoundingClientRect();
    mousePos.x = (H * (e.clientX - rect.left)) / rect.width;
    mousePos.y = (V * (rect.height - (e.clientY - rect.top))) / rect.height;
  });

  // fullscreen listener
  sourceCanvas.addEventListener("click", () =>
    sourceCanvas.requestFullscreen()
  );

  let frames = 0;

  // TODO randomize the draw funcs, splitting across extra buffers
  const chanceTable = new ChanceTable<() => DrawFunc>();
  chanceTable.addAll([
    [roseDots, 1],
    [bitGrid, 1],
  ]);
  const drawFunc = chanceTable.pick()();

  let originalTime: number | undefined;

  const update = (time: number) => {
    if (originalTime === undefined) originalTime = time;
    const t = (time - originalTime) / 1000;
    drawFunc(t, frames, source, sourceCanvas);
    merger.draw(t, mousePos.x, mousePos.y);
    curAnimationFrame = requestAnimationFrame(update);
  };

  curAnimationFrame = requestAnimationFrame(update);
}

main();

// TODO reset the context on a reset

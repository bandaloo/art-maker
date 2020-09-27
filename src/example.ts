import * as MP from "@bandaloo/merge-pass";
import { ChanceTable } from "./chancetable";
import { bitGrid } from "./draws/bitgrid";
import { roseDots } from "./draws/rosedots";
import { randomEffects } from "./effectrand";
import { DrawFunc, H, V } from "./utils";

let curAnimationFrame: number;

window.addEventListener("keydown", (e) => {
  if (e.key === "r") {
    cancelAnimationFrame(curAnimationFrame);
    main();
  }
});

function main() {
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

  // clear the canvas (we reuse this canvas on reset so it can be dirtied)
  //source.fillStyle = "white";
  //source.fillRect(0, 0, H, V);

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
    merger.draw(t);
    curAnimationFrame = requestAnimationFrame(update);
  };

  curAnimationFrame = requestAnimationFrame(update);
}

main();

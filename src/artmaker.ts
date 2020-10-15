import { Merger } from "@bandaloo/merge-pass";
import { ChanceTable } from "./chancetable";
import { bitGrid } from "./draws/bitgrid";
import { roseDots } from "./draws/rosedots";
import { randomEffects } from "./effectrand";
import { DrawFunc, H, V } from "./utils";
import { Rand } from "./rand";

type CanvasPair<T> = [HTMLCanvasElement, T];

function canvasAndContext(
  width: number,
  height: number,
  kind: "2d"
): CanvasPair<CanvasRenderingContext2D>;
function canvasAndContext(
  width: number,
  height: number,
  kind: "webgl2"
): CanvasPair<WebGL2RenderingContext>;
function canvasAndContext(
  width: number,
  height: number,
  kind: "2d" | "webgl2"
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext(kind);
  if (context === null) {
    throw new Error(`failed to get ${kind} context`);
  }
  return [canvas, context];
}

export class ArtMaker {
  static seedVersion = "0";
  private curAnimationFrame?: number;
  private originalTime?: number;
  private timeScale = 1;
  private rand?: Rand;
  private mousePos: { x: number; y: number };
  readonly glCanvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly sourceCanvas: HTMLCanvasElement;
  readonly source: CanvasRenderingContext2D;

  constructor(width = H, height = Math.floor((width * 9) / 16), id = "art") {
    this.mousePos = { x: width / 2, y: height / 2 };
    [this.glCanvas, this.gl] = canvasAndContext(width, height, "webgl2");
    [this.sourceCanvas, this.source] = canvasAndContext(width, height, "2d");

    this.glCanvas.addEventListener("click", () =>
      this.glCanvas.requestFullscreen()
    );
    this.glCanvas.addEventListener("mousemove", (e) => {
      const rect = this.glCanvas.getBoundingClientRect();
      this.mousePos.x = (width * (e.clientX - rect.left)) / rect.width;
      this.mousePos.y =
        (height * (rect.height - (e.clientY - rect.top))) / rect.height;
    });

    const elem = document.getElementById(id);
    if (elem === null) {
      throw new Error(`could not find element with id "${id}"`);
    }
    elem.appendChild(this.glCanvas);
  }

  art(seed?: string) {
    this.source.restore();
    this.source.save();

    this.source.scale(
      this.sourceCanvas.width / H,
      this.sourceCanvas.height / V
    );

    if (this.curAnimationFrame !== undefined) {
      cancelAnimationFrame(this.curAnimationFrame);
    }

    this.rand = new Rand(seed);
    this.timeScale = this.rand.between(0.4, 1.1);
    const effects = [...randomEffects(3, this.rand)];

    const merger = new Merger(effects, this.sourceCanvas, this.gl, {
      channels: [null, null],
      edgeMode: "wrap",
    });

    const chanceTable = new ChanceTable<(rand: Rand) => DrawFunc>(this.rand);
    chanceTable.addAll([
      [roseDots, 1],
      [bitGrid, 1],
    ]);
    const drawFunc = chanceTable.pick()(this.rand);

    const update = (time: number) => {
      if (this.originalTime === undefined) this.originalTime = time;
      const t = ((time - this.originalTime) / 1000) * this.timeScale;
      drawFunc(t, 0, this.source, this.sourceCanvas);
      merger.draw(t, this.mousePos.x, this.mousePos.y);
      this.curAnimationFrame = requestAnimationFrame(update);
    };

    this.curAnimationFrame = requestAnimationFrame(update);
  }
}

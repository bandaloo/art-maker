import { Merger } from "@bandaloo/merge-pass";
import { ChanceTable } from "./chancetable";
import { bitGrid } from "./draws/bitgrid";
import { roseDots } from "./draws/rosedots";
import { randomEffects } from "./effectrand";
import { DrawFunc, TupleVec3, H, V } from "./utils";
import { Rand } from "./rand";
import { maze } from "./draws/maze";

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

export interface Colors {
  fore1: TupleVec3;
  fore2: TupleVec3;
  back: TupleVec3;
}

export class ArtMaker {
  static seedVersion = "unstable";
  private curAnimationFrame?: number;
  private originalTime?: number;
  private timeScale = 1;
  private merger?: Merger;
  private drawFunc?: DrawFunc;
  private rand?: Rand;
  private mousePos: { x: number; y: number };
  readonly glCanvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly sourceCanvas: HTMLCanvasElement;
  readonly source: CanvasRenderingContext2D;
  private colors?: Colors;

  /**
   * constructs an ArtMaker
   * @param width width of the canvas (defaults to 1920)
   * @param height height of the canvas (defaults to number that preserves 16:9
   * aspect ratio based on width)
   * @param divId id of the div to add the canvas to (defaults to "art")
   * @param canvasId id of the canvas automatically added to the DOM (defaults
   * to "artcanvas")
   */
  constructor(
    width = H,
    height = Math.floor((width * 9) / 16),
    divId = "art",
    canvasId = "artcanvas"
  ) {
    this.mousePos = { x: width / 2, y: height / 2 };
    [this.glCanvas, this.gl] = canvasAndContext(width, height, "webgl2");
    [this.sourceCanvas, this.source] = canvasAndContext(width, height, "2d");
    this.glCanvas.id = canvasId;

    this.glCanvas.addEventListener("mousemove", (e) => {
      const rect = this.glCanvas.getBoundingClientRect();
      this.mousePos.x = (width * (e.clientX - rect.left)) / rect.width;
      this.mousePos.y =
        (height * (rect.height - (e.clientY - rect.top))) / rect.height;
    });

    const elem = document.getElementById(divId);
    if (elem === null) {
      throw new Error(`could not find element with id "${divId}"`);
    }
    elem.appendChild(this.glCanvas);

    this.source.scale(
      this.sourceCanvas.width / H,
      this.sourceCanvas.height / V
    );
  }

  /**
   * seeds the random generation
   * @param seed random seed
   */
  seed(seed?: string) {
    this.originalTime = undefined;

    this.source.restore();
    this.source.save();

    const rand = new Rand(seed);
    this.timeScale = rand.between(0.4, 1) ** 2;
    const effects = [...randomEffects(3, rand)];

    this.merger = new Merger(effects, this.sourceCanvas, this.gl, {
      channels: [null, null],
      edgeMode: "wrap",
    });

    const chanceTable = new ChanceTable<
      (rand: Rand, colors: Colors) => DrawFunc
    >(rand);
    chanceTable.addAll([
      [roseDots, 1],
      [bitGrid, 1],
      [maze, 1],
    ]);

    const r = () => Math.floor(rand.random() * 256);
    const backChance = rand.random();
    this.colors = {
      fore1: [r(), r(), r()],
      fore2: [r(), r(), r()],
      back:
        backChance < 0.1
          ? [r(), r(), r()]
          : backChance < 0.55
          ? [0, 0, 0]
          : [255, 255, 255],
    };
    this.drawFunc = chanceTable.pick()(rand, this.colors);
    this.rand = rand;
    return this;
  }

  /**
   * starts requesting animation frames to draw every loop, restarting
   * the animation if called again
   */
  animate() {
    if (this.curAnimationFrame !== undefined) {
      cancelAnimationFrame(this.curAnimationFrame);
      this.curAnimationFrame = undefined;
    }

    const update = (time: number) => {
      this.draw(time);
      this.curAnimationFrame = requestAnimationFrame(update);
    };
    this.curAnimationFrame = requestAnimationFrame(update);
    return this;
  }

  private setColor(layer: "back" | "fore1" | "fore2", color: TupleVec3) {
    if (this.colors === undefined) throw new Error("colors not defined yet");
    this.colors[layer] = color;
  }

  private getColor(layer: "back" | "fore1" | "fore2") {
    return this.colors !== undefined
      ? this.colors[layer]
      : ([0, 0, 0] as TupleVec3);
  }

  setBackground(color: TupleVec3) {
    this.setColor("back", color);
  }

  getBackground() {
    return this.getColor("back");
  }

  setForeground1(color: TupleVec3) {
    this.setColor("fore1", color);
  }

  getForeground1() {
    return this.getColor("fore1");
  }

  setForeground2(color: TupleVec3) {
    this.setColor("fore2", color);
  }

  getForeground2() {
    return this.getColor("fore2");
  }

  /**
   * draws to the canvas once
   * @param time time in milliseconds of the animation
   */
  draw(time: number) {
    if (this.merger === undefined || this.drawFunc === undefined) {
      this.seed();
      this.draw(time);
      return;
    }
    if (this.originalTime === undefined) this.originalTime = time;
    const t = ((time - this.originalTime) / 1000) * this.timeScale;
    this.drawFunc(t, this.source);
    this.merger.draw(t, this.mousePos.x, this.mousePos.y);
    return this;
  }
}

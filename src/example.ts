import ArtMaker, { Rand } from "./index";
import { colorVectorToHex, hexColorToVector } from "./utils";

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

let reset = false;
let artMaker: ArtMaker;
let seed: string;

{
  const gotIt = document.getElementById("gotit");
  if (gotIt === null) throw new Error("got it button was null");

  const instructions = document.getElementById("instructions");
  if (instructions === null) throw new Error("instructions div was null");
  instructions.style.visibility = "visible";

  gotIt.addEventListener("click", () => {
    instructions?.remove();
  });

  const more = document.getElementById("more");
  if (more === null) throw new Error("more button was null");

  const info = document.getElementById("info");
  if (info === null) throw new Error("info div was null");

  more.addEventListener("click", () => {
    if (info.style.display === "none") {
      more.innerText = "Less";
      info.style.display = "block";
    } else {
      more.innerText = "More";
      info.style.display = "none";
    }
  });

  const topControls = document.getElementById("topui");
  if (topControls === null) throw new Error("top div was null");

  const download = document.getElementById("download");
  if (download === null) throw new Error("download button was null");

  const nameField = document.getElementById("filename");
  if (nameField === null) throw new Error("name field was null");

  download.addEventListener("click", () => {
    artMaker.download(filename((nameField as HTMLInputElement).value));
  });

  window.addEventListener("keydown", (e) => {
    if (document.activeElement === nameField) return;
    if (e.key === "r") main();
    else if (e.key === "f") artMaker.glCanvas.requestFullscreen();
    else if (e.key === "h") {
      if (topControls.style.display === "none") {
        topControls.style.display = "block";
      } else {
        topControls.style.display = "none";
      }
    }
  });
}

function updatePath(name?: string, doColors = true) {
  const searchParams = new URLSearchParams(window.location.search);
  if (name !== undefined) searchParams.set("s", name);
  searchParams.set("v", ArtMaker.seedVersion);
  if (doColors) {
    searchParams.set("c", colorString());
  } else {
    searchParams.delete("c");
  }
  const query = window.location.pathname + "?" + searchParams.toString();
  history.pushState(null, "", query);
}

function setupInput(
  input: HTMLInputElement,
  layer: "back" | "fore1" | "fore2"
) {
  input.addEventListener("input", () => {
    artMaker.setColor(layer, hexColorToVector(input.value));
  });
  input.addEventListener("change", () => updatePath());
  return input;
}

function colorString() {
  const a = artMaker;
  return [a.getBackground(), a.getForeground1(), a.getForeground2()]
    .map((c) => colorVectorToHex(c).slice(1))
    .join("-");
}

function filename(str: string) {
  return [
    str,
    "v" + ArtMaker.seedVersion,
    seed,
    ...(new URLSearchParams(window.location.search).has("c")
      ? [colorString()]
      : []),
    "t" + Math.floor(artMaker.getTime()),
  ].join("-");
}

const backInput = setupInput(
  document.getElementById("background") as HTMLInputElement,
  "back"
);
const foreInput1 = setupInput(
  document.getElementById("foreground1") as HTMLInputElement,
  "fore1"
);
const foreInput2 = setupInput(
  document.getElementById("foreground2") as HTMLInputElement,
  "fore2"
);

function inputUpdate() {
  backInput.value = colorVectorToHex(artMaker.getBackground());
  foreInput1.value = colorVectorToHex(artMaker.getForeground1());
  foreInput2.value = colorVectorToHex(artMaker.getForeground2());
}

function colorStringsToColors(str: string) {
  const vals = str.split("-").map((n) => "#" + n);
  return vals.map(hexColorToVector);
}

function main() {
  const preset = window.location.search.substring(1);
  const query = !reset ? getQuery("s", preset) : undefined;
  const version = !reset ? getQuery("v", preset) : undefined;
  const colors = !reset ? getQuery("c", preset) : undefined;
  if (version !== undefined && version !== ArtMaker.seedVersion) {
    window.alert(
      "This seed is from a previous version. " +
        "You won't see same pattern from when you first saved the URL."
    );
  }
  seed = query ?? Rand.randString(8);
  console.log("seed:", seed);

  if (seed === undefined) throw new Error("seed was somehow undefined");
  if (!reset) artMaker = new ArtMaker();

  artMaker.seed(seed);
  if (colors !== undefined) {
    const converted = colorStringsToColors(colors);
    artMaker.setBackground(converted[0]);
    artMaker.setForeground1(converted[1]);
    artMaker.setForeground2(converted[2]);
  }

  updatePath(seed, !(colors === undefined || reset));
  inputUpdate();
  reset = true;
  artMaker.animate();
}

main();

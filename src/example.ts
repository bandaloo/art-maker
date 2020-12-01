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

const gotIt = document.getElementById("gotit");
if (gotIt === null) throw new Error("got it button was null");

const instructions = document.getElementById("instructions");
if (instructions === null) throw new Error("instructions div was null");
instructions.style.visibility = "visible";

gotIt.addEventListener("click", () => {
  console.log("clicked");
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
    console.log(info.style.display);
  }
});

window.addEventListener("keydown", (e) => {
  if (e.key === "r") main();
  else if (e.key === "f") artMaker.glCanvas.requestFullscreen();
});

function updatePath(name: string) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("s", name);
  searchParams.set("v", ArtMaker.seedVersion);
  const query = window.location.pathname + "?" + searchParams.toString();
  history.pushState(null, "", query);
}

const backInput = document.getElementById("background") as HTMLInputElement;
const foreInput1 = document.getElementById("foreground1") as HTMLInputElement;
const foreInput2 = document.getElementById("foreground2") as HTMLInputElement;

function inputSetup() {
  backInput.addEventListener("input", () =>
    artMaker.setBackground(hexColorToVector(backInput.value))
  );
  foreInput1.addEventListener("input", () =>
    artMaker.setForeground1(hexColorToVector(foreInput1.value))
  );
  foreInput2.addEventListener("input", () =>
    artMaker.setForeground2(hexColorToVector(foreInput2.value))
  );
}

function inputUpdate() {
  backInput.value = colorVectorToHex(artMaker.getBackground());
  foreInput1.value = colorVectorToHex(artMaker.getForeground1());
  foreInput2.value = colorVectorToHex(artMaker.getForeground2());
}

inputSetup();

function main() {
  const preset = window.location.search.substring(1);
  const query = !reset ? getQuery("s", preset) : undefined;
  const version = !reset ? getQuery("v", preset) : undefined;
  if (version !== undefined && version !== ArtMaker.seedVersion) {
    window.alert(
      "This seed is from a previous version. " +
        "You won't see same pattern from when you first saved the URL."
    );
  }
  const seed = query ?? Rand.randString(8);
  console.log("seed:", seed);

  if (seed === undefined) throw new Error("seed was somehow undefined");
  if (!reset) artMaker = new ArtMaker();

  reset = true;
  updatePath(seed);
  artMaker.seed(seed);
  inputUpdate();
  artMaker.animate();
}

main();

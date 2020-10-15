import { ArtMaker } from "./artmaker";
import { getQuery, randString } from "./utils";

const seedVersion = "0";

let curAnimationFrame: number;
let reset = false;

let timeScale: number;

let artMaker: ArtMaker;

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
    main();
  }
});

function updatePath(name: string) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("s", name);
  searchParams.set("v", seedVersion);
  const query = window.location.pathname + "?" + searchParams.toString();
  history.pushState(null, "", query);
}

function main() {
  const preset = window.location.search.substring(1);
  const query = !reset ? getQuery("s", preset) : undefined;
  const version = !reset ? getQuery("v", preset) : undefined;
  if (version !== undefined && version !== ArtMaker.seedVersion) {
    window.alert(
      "This seed is from a previous version. You won't see same pattern from when you first saved the URL."
    );
  }
  const seed = query ?? randString(8);
  console.log("seed:", seed);

  if (seed === undefined) throw new Error("seed was somehow undefined");
  if (!reset) artMaker = new ArtMaker();

  reset = true;
  updatePath(seed);
  artMaker.art(seed);
}

main();

import ArtMaker, { Rand } from "./index";

// browser functions
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
  if (e.key === "r") main();
});

function updatePath(name: string) {
  const searchParams = new URLSearchParams(window.location.search);
  searchParams.set("s", name);
  searchParams.set("v", ArtMaker.seedVersion);
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
  const seed = query ?? Rand.randString(8);
  console.log("seed:", seed);

  if (seed === undefined) throw new Error("seed was somehow undefined");
  if (!reset) artMaker = new ArtMaker();

  reset = true;
  updatePath(seed);
  artMaker.art(seed);
}

main();

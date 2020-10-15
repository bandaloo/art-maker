import seedrandom from "seedrandom";

export class Rand {
  private rand: seedrandom.prng;

  constructor(seed?: string) {
    this.rand = seedrandom(seed ?? Rand.randString(8));
  }

  static randString(length: number) {
    return [...Array(length)]
      .map(() => "abcdefghijklmnopqrstuvwxyz"[Math.floor(26 * Math.random())])
      .join("");
  }

  between(lo: number, hi: number) {
    return lo + (hi - lo) * this.rand();
  }

  int(num: number) {
    return Math.floor(this.rand() * num);
  }

  random() {
    return this.rand();
  }
}

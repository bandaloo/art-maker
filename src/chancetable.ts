export class ChanceTable<T> {
  info: Map<T, number>;

  constructor(info = new Map()) {
    this.info = info;
  }

  add(result: T, weight: number) {
    this.info.set(result, weight);
  }

  addAll(pairs: [T, number][]) {
    for (const p of pairs) this.add(p[0], p[1]);
  }

  pick() {
    // add up total weight
    let sum = 0;
    for (const weight of this.info.values()) {
      sum += weight;
    }

    // choose a number and count up until that choice
    let choice = Math.random() * sum;
    let count = 0;
    for (const [result, weight] of this.info.entries()) {
      if (choice > count && choice < count + weight) {
        return result;
      }
      count += weight;
    }
    throw new Error("somehow nothing was chosen from chance table");
  }
}

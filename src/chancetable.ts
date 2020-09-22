interface ChanceVals {
  weight: number;
  decr: number;
}

export class ChanceTable<T> {
  info: Map<T, ChanceVals>;

  constructor(info = new Map()) {
    this.info = info;
  }

  add(result: T, weight: number, decr = 0) {
    if (decr > 0) throw new Error("decr has to be < 0");
    this.info.set(result, { weight, decr });
  }

  addAll(pairs: [T, number, number?][]) {
    for (const p of pairs) this.add(p[0], p[1], p[2]);
  }

  private pickFromMap(map: Map<T, ChanceVals>) {
    // TODO change to reduce
    let sum = 0;
    for (const chance of map.values()) sum += chance.weight;

    // choose a number and count up until that choice
    let choice = Math.random() * sum;
    let count = 0;
    for (const [result, chance] of map.entries()) {
      if (choice > count && choice < count + chance.weight) {
        chance.weight = Math.max(chance.weight + chance.decr, 0);
        return result;
      }
      count += chance.weight;
    }
    throw new Error("somehow nothing was chosen from chance table");
  }

  pick(): T;
  pick(num: number): T[];
  pick(num?: number) {
    const cloned = new Map<T, ChanceVals>();
    for (const m of this.info) cloned.set(m[0], Object.assign({}, m[1]));

    // return just one result
    if (num === undefined) return this.pickFromMap(cloned);

    // return an array of results
    const results: T[] = [];
    for (let i = 0; i < num; i++) {
      results.push(this.pickFromMap(cloned));
    }
    return results;
  }
}

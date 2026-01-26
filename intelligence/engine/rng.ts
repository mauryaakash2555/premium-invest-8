export interface Rng {
  next(): number; // [0,1)
  int(minInclusive: number, maxInclusive: number): number;
  normal(mean: number, stdDev: number): number;
}

// Deterministic PRNG: Mulberry32
export function createRng(seed: number): Rng {
  let t = seed >>> 0;

  const next = () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };

  const int = (minInclusive: number, maxInclusive: number) => {
    const r = next();
    return minInclusive + Math.floor(r * (maxInclusive - minInclusive + 1));
  };

  // Box–Muller transform
  const normal = (mean: number, stdDev: number) => {
    let u = 0;
    let v = 0;
    while (u === 0) u = next();
    while (v === 0) v = next();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + z * stdDev;
  };

  return { next, int, normal };
}

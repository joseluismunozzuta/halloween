/**
 * Generador pseudoaleatorio con semilla (mulberry32).
 *
 * Las salpicaduras, chorretones y focos necesitan verse irregulares, pero
 * Math.random() en el render produce valores distintos en servidor y cliente y
 * React tira un error de hidratación. Con semilla fija, ambos lados calculan lo
 * mismo y el resultado sigue pareciendo aleatorio.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

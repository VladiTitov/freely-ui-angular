/** The value axis: where it ends and the values its grid lines mark. */
export interface ChartScale {
  top: number;
  ticks: number[];
}

/**
 * A value axis from 0 that ends on a clean number (1, 2 or 5 times a power of ten) with about `count` steps,
 * e.g. a peak of 37 gives 0 / 10 / 20 / 30 / 40. With `integers` a step is never below 1, for counts.
 */
export function niceScale(peak: number, count = 4, integers = true): ChartScale {
  const raw = Math.max(peak, integers ? 1 : Number.EPSILON) / Math.max(count, 1);
  const power = 10 ** Math.floor(Math.log10(raw));
  let step = [1, 2, 5, 10].map(factor => factor * power).find(candidate => candidate >= raw) ?? 10 * power;
  if (integers) step = Math.max(1, step);

  const steps = Math.max(1, Math.ceil(peak / step - 1e-9));
  const ticks = Array.from({ length: steps + 1 }, (_, index) => round(index * step));
  return { top: ticks[ticks.length - 1], ticks };
}

/** Drops the float noise of `0.1 * 3`. */
function round(value: number): number {
  return Number(value.toPrecision(12));
}

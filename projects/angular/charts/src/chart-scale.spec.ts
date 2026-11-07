import { niceScale } from './chart-scale';

describe('niceScale', () => {
  it('ends on a clean number above the peak', () => {
    expect(niceScale(37)).toEqual({ top: 40, ticks: [0, 10, 20, 30, 40] });
    expect(niceScale(1200)).toEqual({ top: 1500, ticks: [0, 500, 1000, 1500] });
  });

  it('keeps a peak that is a step itself', () => {
    expect(niceScale(40).top).toBe(40);
  });

  it('steps by whole numbers for small counts', () => {
    expect(niceScale(3)).toEqual({ top: 3, ticks: [0, 1, 2, 3] });
    expect(niceScale(0)).toEqual({ top: 1, ticks: [0, 1] });
  });

  it('steps by fractions for fractional values', () => {
    expect(niceScale(0.7, 4, false)).toEqual({ top: 0.8, ticks: [0, 0.2, 0.4, 0.6, 0.8] });
  });
});

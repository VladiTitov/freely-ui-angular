import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_FY_ICONS, FY_ICONS, provideFyIcons } from './fy-icons';
import { DEFAULT_FY_LABELS, FY_LABELS, FyLabels, provideFyLabels } from './fy-labels';

describe('FY_ICONS', () => {
  it('is Bootstrap Icons without a provider', () => {
    expect(TestBed.inject(FY_ICONS)).toEqual(DEFAULT_FY_ICONS);
  });

  it('replaces only the icons given', () => {
    TestBed.configureTestingModule({ providers: [provideFyIcons({ close: 'ph ph-x' })] });
    const icons = TestBed.inject(FY_ICONS);

    expect(icons.close).toBe('ph ph-x');
    expect(icons.search).toBe(DEFAULT_FY_ICONS.search);
  });
});

describe('FY_LABELS', () => {
  it('is English without a provider', () => {
    expect(TestBed.inject(FY_LABELS)()).toEqual(DEFAULT_FY_LABELS);
  });

  it('replaces only the labels given', () => {
    TestBed.configureTestingModule({ providers: [provideFyLabels(() => () => ({ close: 'Закрыть' }))] });
    const labels = TestBed.inject(FY_LABELS)();

    expect(labels.close).toBe('Закрыть');
    expect(labels.clear).toBe(DEFAULT_FY_LABELS.clear);
  });

  it('follows a signal, e.g. a language switch', () => {
    const language = signal<Partial<FyLabels>>({ close: 'Close' });
    TestBed.configureTestingModule({ providers: [provideFyLabels(() => () => language())] });
    const labels = TestBed.inject(FY_LABELS);

    expect(labels().close).toBe('Close');
    language.set({ close: 'Закрыть' });
    expect(labels().close).toBe('Закрыть');
  });
});

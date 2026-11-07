import { formatNumber, NumberTextOptions, readNumberEdit } from './number-text';

const EN: NumberTextOptions = { symbols: { decimal: '.', group: ',' }, decimals: 2, negative: false };
const RU: NumberTextOptions = { symbols: { decimal: ',', group: ' ' }, decimals: 2, negative: false };
const DE: NumberTextOptions = { symbols: { decimal: ',', group: '.' }, decimals: 2, negative: false };

/** Types `typed` at the end of `previous`, as a keystroke or a paste does. */
function type(previous: string, typed: string, options: NumberTextOptions) {
  const next = previous + typed;
  return readNumberEdit(previous, next, next.length, options);
}

describe('number text', () => {
  describe('formatNumber', () => {
    it('groups the digits and drops trailing zeros', () => {
      expect(formatNumber(1234567.5, EN)).toBe('1,234,567.5');
      expect(formatNumber(1234567.5, RU)).toBe('1 234 567,5');
      expect(formatNumber(1234, { ...EN, decimals: 0 })).toBe('1,234');
      expect(formatNumber(12.3456, EN)).toBe('12.35');
    });

    it('writes nothing for null', () => {
      expect(formatNumber(null, EN)).toBe('');
    });

    it('keeps the minus only when negatives are allowed', () => {
      expect(formatNumber(-5, { ...EN, negative: true })).toBe('-5');
      expect(formatNumber(-5, EN)).toBe('5');
    });
  });

  describe('readNumberEdit', () => {
    it('reads a pasted amount with spaces and a comma', () => {
      expect(type('', '1 234,50', EN)).toEqual({ text: '1,234.50', value: 1234.5, caret: 8 });
      expect(type('', '1 234,50', RU).value).toBe(1234.5);
    });

    it('takes the last of mixed separators as the decimal one', () => {
      expect(type('', '1,234.56', RU).value).toBe(1234.56);
      expect(type('', '1.234,56', EN).value).toBe(1234.56);
    });

    it('reads a lone locale group separator before three digits as grouping', () => {
      expect(type('', '1,234', EN).value).toBe(1234);
      expect(type('', '1.234', DE).value).toBe(1234);
      expect(type('', '1,5', EN).value).toBe(1.5);
    });

    it('takes either separator typed as the decimal one', () => {
      expect(type('12', ',', EN)).toEqual({ text: '12.', value: 12, caret: 3 });
      expect(type('12', '.', RU)).toEqual({ text: '12,', value: 12, caret: 3 });
    });

    it('groups the digits while typing', () => {
      expect(type('123', '4', EN)).toEqual({ text: '1,234', value: 1234, caret: 5 });
      expect(type('1,234', '5', EN)).toEqual({ text: '12,345', value: 12345, caret: 6 });
    });

    it('drops the grouping it put there itself', () => {
      // Backspace after "1,234": the comma is the field's own and not a decimal separator.
      const edit = readNumberEdit('1,234', '1,23', 4, EN);

      expect(edit).toEqual({ text: '123', value: 123, caret: 3 });
    });

    it('keeps one decimal separator', () => {
      expect(type('1.5', '.', EN).text).toBe('1.5');
      expect(type('1.5', ',', EN).text).toBe('1.5');
    });

    it('stops at the allowed decimals', () => {
      expect(type('1.25', '9', EN).value).toBe(1.25);
      expect(type('12', ',5', { ...EN, decimals: 0 })).toEqual({ text: '125', value: 125, caret: 3 });
    });

    it('drops leading zeros and puts one before a bare separator', () => {
      expect(type('0', '5', EN).text).toBe('5');
      expect(type('', '00', EN).text).toBe('0');
      expect(type('', ',', EN)).toEqual({ text: '0.', value: 0, caret: 2 });
    });

    it('drops anything but digits and separators', () => {
      expect(type('', '$1a2b', EN).value).toBe(12);
      expect(type('', 'abc', EN)).toEqual({ text: '', value: null, caret: 0 });
    });

    it('keeps a leading minus only when negatives are allowed', () => {
      const negative = { ...EN, negative: true };

      expect(type('', '-', negative)).toEqual({ text: '-', value: null, caret: 1 });
      expect(type('-', '12', negative).value).toBe(-12);
      expect(type('', '-12', EN).value).toBe(12);
    });

    it('keeps the caret after the same digit when the grouping moves', () => {
      // "1234" typed "5" between the 1 and the 2: "15234" → "15,234", caret after the 5.
      const edit = readNumberEdit('1,234', '15,234', 2, EN);

      expect(edit.text).toBe('15,234');
      expect(edit.caret).toBe(2);
    });
  });
});

/** Decimal and group separators of a locale, as `Intl.NumberFormat` prints them. */
export interface NumberSymbols {
  decimal: string;
  group: string;
}

/** What the text of a number field may hold. */
export interface NumberTextOptions {
  symbols: NumberSymbols;
  /** Digits after the decimal separator; 0 takes whole numbers only. */
  decimals: number;
  /** Whether a leading minus is kept. */
  negative: boolean;
}

/** The text to show in the field, the number it stands for and where the caret goes. */
export interface NumberEdit {
  text: string;
  value: number | null;
  caret: number;
}

/** More digits than this lose precision in a JS number. */
const MAX_INTEGER_DIGITS = 15;

const symbolsCache = new Map<string, NumberSymbols>();

export function numberSymbols(locale: string | undefined): NumberSymbols {
  const key = locale ?? '';
  let symbols = symbolsCache.get(key);
  if (!symbols) {
    const parts = new Intl.NumberFormat(locale, { useGrouping: true }).formatToParts(12345.6);
    symbols = {
      decimal: parts.find(part => part.type === 'decimal')?.value ?? '.',
      group: parts.find(part => part.type === 'group')?.value ?? ','
    };
    symbolsCache.set(key, symbols);
  }
  return symbols;
}

/** `1234.5` → `1 234,5` in Russian, `1,234.5` in English; null → empty. */
export function formatNumber(value: number | null, options: NumberTextOptions): string {
  if (value === null || !Number.isFinite(value)) return '';
  const [whole, fraction = ''] = Math.abs(value).toFixed(options.decimals).split('.');
  const trimmed = fraction.replace(/0+$/, '');
  return build(value < 0 && options.negative, whole, trimmed.length > 0, trimmed, options.symbols);
}

/**
 * Reads the text the user left in the field after an edit of `previous`, the text the field showed. The separators
 * the field put there itself are known, so only what the user typed or pasted is guessed at: the last of `.` and `,`
 * is the decimal separator, a separator that repeats groups thousands, and a lone locale group separator before
 * exactly three digits (`1,234` in English) groups too.
 *
 * `caret` is the caret in `next`; the result places it after the same digit in the rewritten text.
 */
export function readNumberEdit(previous: string, next: string, caret: number, options: NumberTextOptions): NumberEdit {
  const { symbols } = options;

  let prefix = 0;
  const shortest = Math.min(previous.length, next.length);
  while (prefix < shortest && previous[prefix] === next[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < shortest - prefix &&
    previous[previous.length - 1 - suffix] === next[next.length - 1 - suffix]
  ) {
    suffix++;
  }

  const middleEnd = next.length - suffix;
  const keptDecimal = hasDecimal(previous.slice(0, prefix), symbols) || hasDecimal(previous.slice(previous.length - suffix), symbols);
  const typedDecimal = keptDecimal ? -1 : decimalIndex(next.slice(prefix, middleEnd), symbols, options.decimals);

  // Tokens: digits, 'D' for the decimal separator, '-' for a minus. `before` counts the tokens left of the caret.
  const tokens: string[] = [];
  let before = 0;
  for (let index = 0; index < next.length; index++) {
    const char = next[index];
    const typed = index >= prefix && index < middleEnd;
    let token: string | null = null;

    if (char >= '0' && char <= '9') token = char;
    else if (char === '-' || char === '−') token = '-';
    else if (typed) token = index - prefix === typedDecimal ? 'D' : null;
    else if (char === symbols.decimal) token = 'D';

    if (token === null) continue;
    tokens.push(token);
    if (index < caret) before++;
  }

  return fromTokens(tokens, before, options);
}

function fromTokens(tokens: string[], before: number, options: NumberTextOptions): NumberEdit {
  const negative = options.negative && tokens[0] === '-';
  let whole = '';
  let fraction = '';
  let decimal = false;
  // Where the caret stands, in digits of the whole part, of the fraction, or on the sign.
  let caretWhole = 0;
  let caretFraction = 0;
  let caretAfterDecimal = false;

  tokens.forEach((token, index) => {
    const left = index < before;
    if (token === '-') return;
    if (token === 'D') {
      if (decimal || options.decimals === 0) return;
      decimal = true;
      if (left) caretAfterDecimal = true;
      return;
    }
    if (decimal) {
      if (fraction.length >= options.decimals) return;
      fraction += token;
      if (left) caretFraction++;
    } else {
      whole += token;
      if (left) caretWhole++;
    }
  });

  // Leading zeros go; a whole part of zeros only keeps one.
  const zeros = /^0*/.exec(whole)![0].length;
  const dropped = zeros === whole.length ? Math.max(0, zeros - 1) : zeros;
  if (dropped > 0) {
    whole = whole.slice(dropped);
    caretWhole = Math.max(0, caretWhole - dropped);
  }
  if (decimal && whole === '') {
    whole = '0';
    if (caretAfterDecimal) caretWhole = 1;
  }
  if (whole.length > MAX_INTEGER_DIGITS) {
    whole = whole.slice(0, MAX_INTEGER_DIGITS);
    caretWhole = Math.min(caretWhole, MAX_INTEGER_DIGITS);
  }

  // A lone minus stays on screen while the user types the digits after it, but stands for no number yet.
  const sign = negative;
  const text = build(sign, whole, decimal, fraction, options.symbols);
  const parsed = whole === '' ? null : Number(`${sign ? '-' : ''}${whole}.${fraction || '0'}`);
  const value = parsed === 0 ? 0 : parsed;

  // Walk the text to the caret: past the sign, `caretWhole` digits, then the separator and `caretFraction` digits.
  let caret = sign ? 1 : 0;
  let digits = 0;
  while (caret < text.length && digits < caretWhole) {
    if (isDigit(text[caret])) digits++;
    caret++;
  }
  if (caretAfterDecimal && decimal) {
    caret = text.indexOf(options.symbols.decimal, sign ? 1 : 0) + options.symbols.decimal.length + caretFraction;
  }

  return { text, value, caret: Math.min(caret, text.length) };
}

function build(negative: boolean, whole: string, decimal: boolean, fraction: string, symbols: NumberSymbols): string {
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, symbols.group);
  return `${negative ? '-' : ''}${grouped}${decimal ? symbols.decimal + fraction : ''}`;
}

/** Index in `typed` of the separator the user meant as decimal, or -1. */
function decimalIndex(typed: string, symbols: NumberSymbols, decimals: number): number {
  if (decimals === 0) return -1;
  const separators: number[] = [];
  for (let index = 0; index < typed.length; index++) {
    if (typed[index] === '.' || typed[index] === ',' || typed[index] === symbols.decimal) separators.push(index);
  }
  if (separators.length === 0) return -1;

  const last = separators[separators.length - 1];
  const kinds = new Set(separators.map(index => typed[index]));
  if (kinds.size > 1) return last;
  if (separators.length > 1) return -1;

  // `1,234` pasted in English: a lone group separator before exactly three digits.
  const after = typed.slice(last + 1);
  const isGroup = typed.length > 1 && typed[last] === symbols.group && /^\d{3}$/.test(after) && /\d$/.test(typed.slice(0, last));
  return isGroup ? -1 : last;
}

function hasDecimal(text: string, symbols: NumberSymbols): boolean {
  return text.includes(symbols.decimal);
}

function isDigit(char: string): boolean {
  return char >= '0' && char <= '9';
}

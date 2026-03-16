/**
 * AioP v0.1 — Canonical JSON Serialization
 *
 * Produces a deterministic JSON string from any value.
 * Rules: sorted keys, no whitespace, normalized numbers.
 */

/**
 * Canonicalize a value to a deterministic JSON string.
 *
 * - Object keys are sorted lexicographically (Unicode code point order)
 * - No whitespace between tokens
 * - Numbers: no trailing zeros, no scientific notation
 * - Strings: escape `"` and `\`, pass-through Unicode
 * - Arrays: preserve order, recurse
 * - Nested objects: recurse
 */
export function canonicalize(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'null';

  const type = typeof value;

  if (type === 'boolean') return value ? 'true' : 'false';

  if (type === 'number') {
    const n = value as number;
    if (!isFinite(n)) return 'null'; // Infinity, NaN → null (JSON spec)
    // Normalize: no trailing zeros, no scientific notation
    // Number.toString() in JS already avoids trailing zeros for most cases
    // but we need to handle edge cases
    return normalizeNumber(n);
  }

  if (type === 'string') {
    return escapeString(value as string);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => canonicalize(item));
    return '[' + items.join(',') + ']';
  }

  if (type === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort(); // Lexicographic sort
    const pairs = keys.map((key) => escapeString(key) + ':' + canonicalize(obj[key]));
    return '{' + pairs.join(',') + '}';
  }

  // Fallback for functions, symbols, etc.
  return 'null';
}

/** Normalize a number to canonical string representation. */
function normalizeNumber(n: number): string {
  if (Number.isInteger(n)) return n.toString();

  // Use toPrecision to avoid scientific notation for very small/large numbers
  // Then strip trailing zeros
  let s = n.toString();

  // Handle scientific notation from JS
  if (s.includes('e') || s.includes('E')) {
    // Convert scientific notation to plain decimal
    s = n.toFixed(20);
  }

  // Strip trailing zeros after decimal point
  if (s.includes('.')) {
    s = s.replace(/0+$/, '');
    // If only the decimal point remains, we have an integer
    if (s.endsWith('.')) {
      s = s.slice(0, -1);
    }
  }

  return s;
}

/** Escape a string for JSON output. */
function escapeString(s: string): string {
  let result = '"';
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    switch (c) {
      case 0x22: result += '\\"'; break;  // "
      case 0x5c: result += '\\\\'; break; // \
      case 0x08: result += '\\b'; break;  // backspace
      case 0x0c: result += '\\f'; break;  // form feed
      case 0x0a: result += '\\n'; break;  // newline
      case 0x0d: result += '\\r'; break;  // carriage return
      case 0x09: result += '\\t'; break;  // tab
      default:
        if (c < 0x20) {
          // Other control characters → \u00XX
          result += '\\u' + c.toString(16).padStart(4, '0');
        } else {
          result += s[i];
        }
    }
  }
  result += '"';
  return result;
}

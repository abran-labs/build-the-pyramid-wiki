import { describe, expect, test } from "bun:test";

import { inkMask, type FieldKind, type TextRow } from "./ocr-segment";
import { renderRow, rowCell } from "./ocr-strip";
import type { PixelBuffer } from "./rarity-color";

const ZERO = ["01110", "11011", "10001", "10001", "10001", "11011", "01110"] as const;
const COLON = ["00", "11", "11", "00", "00", "11", "11"] as const;
const DIGITS = [
  { label: "1", rows: ["01", "11", "01", "01", "01", "01", "11"] },
  { label: "6", rows: ["00110", "01100", "11000", "11110", "11011", "11011", "01110"] },
  { label: "/", rows: ["00001", "00001", "00010", "00100", "01000", "10000", "10000"] },
] as const;

/** Synthetic colored row: a prefix in recovery padding, followed by a zero. */
function fixture(prefix: readonly string[], kind: FieldKind = "upgrades", prefixX = 47) {
  const width = 112;
  const height = 44;
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set([25, 20, 40, 255], i);
  for (const glyph of [{ rows: prefix, x: prefixX }, { rows: ZERO, x: 60 }]) {
    for (const [y, line] of glyph.rows.entries()) {
      for (const [x, bit] of [...line].entries()) {
        if (bit !== "1") continue;
        for (let dy = 0; dy < 4; dy++) {
          for (let dx = 0; dx < 4; dx++) {
            data.set([100, 180, 250, 255], ((8 + y * 4 + dy) * width + glyph.x + x * 4 + dx) * 4);
          }
        }
      }
    }
  }
  const pixels: PixelBuffer = { data, height, width };
  const row: TextRow = {
    bottom: 35, hue: 208, inkCount: 300, kind, left: 60, right: 79, top: 8, whiteness: 0,
  };
  return { ink: inkMask(pixels), pixels, row };
}

describe("numeric row recovery padding", () => {
  test.each([47, 43])("removes a label colon at x=%i before template matching", (x) => {
    // Given: a label colon, including one clipped by the recovery margin.
    const source = fixture(COLON, "upgrades", x);
    const clean = fixture([]);
    const expected = rowCell(clean.pixels, clean.ink, clean.row);

    // When: the numeric cell is prepared for glyph matching.
    const actual = rowCell(source.pixels, source.ink, source.row);

    // Then: only the value remains, exactly as in a colon-free image.
    expect(actual).not.toBeNull();
    expect(Buffer.from(actual?.cell ?? []).equals(Buffer.from(expected?.cell ?? []))).toBe(true);
  });

  test("removes a label colon before rendering the Tesseract strip", () => {
    // Given: the same zero with and without label punctuation in its padding.
    const source = fixture(COLON);
    const clean = fixture([]);
    const expected = renderRow(clean.pixels, clean.ink, clean.row);

    // When: the Tesseract image is prepared.
    const actual = renderRow(source.pixels, source.ink, source.row);

    // Then: punctuation cannot become an extra digit in either recognizer.
    expect(actual).not.toBeNull();
    expect(actual?.width).toBe(expected?.width);
    expect(actual?.height).toBe(expected?.height);
    expect(Buffer.from(actual?.data ?? []).equals(Buffer.from(expected?.data ?? []))).toBe(true);
  });

  for (const glyph of DIGITS) {
    test(`preserves recovered '${glyph.label}' strokes`, () => {
      // Given: real glyph ink extends into recovery padding.
      const source = fixture(glyph.rows, "upgrades", 43);
      const reference = rowCell(source.pixels, source.ink, { ...source.row, kind: "white" });

      // When: numeric preprocessing runs.
      const actual = rowCell(source.pixels, source.ink, source.row);

      // Then: numeric glyphs retain the same ink as the unfiltered reference.
      expect(actual).not.toBeNull();
      expect(Buffer.from(actual?.cell ?? []).equals(Buffer.from(reference?.cell ?? []))).toBe(true);
    });
  }

  test("keeps punctuation in title rows", () => {
    // Given: a text row with punctuation in its padding.
    const source = fixture(COLON, "white");

    // When: the title cell is prepared.
    const actual = rowCell(source.pixels, source.ink, source.row);

    // Then: title punctuation is still present before the zero.
    const prefixInk = actual?.cell.some((value, index) => value === 1 && index % actual.w < 14);
    expect(prefixInk).toBe(true);
  });
});

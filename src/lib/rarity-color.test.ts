import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import type { Rarity } from "./dqr-items";
import { decodePngRgba } from "./png-rgba";
import { detectRarityFromPixels, type PixelBuffer } from "./rarity-color";

function solid(width: number, height: number, rgb: readonly [number, number, number], overlay?: Overlay): PixelBuffer {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    data[o] = rgb[0];
    data[o + 1] = rgb[1];
    data[o + 2] = rgb[2];
    data[o + 3] = 255;
  }
  if (overlay) {
    for (let y = overlay.y; y < overlay.y + overlay.h; y++) {
      for (let x = overlay.x; x < overlay.x + overlay.w; x++) {
        const o = (y * width + x) * 4;
        data[o] = overlay.rgb[0];
        data[o + 1] = overlay.rgb[1];
        data[o + 2] = overlay.rgb[2];
        data[o + 3] = 255;
      }
    }
  }
  return { data, height, width };
}

type Overlay = {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly rgb: readonly [number, number, number];
};

describe("detectRarityFromPixels", () => {
  test("classifies dark-interior prototypes as their rarity", () => {
    const cases: ReadonlyArray<readonly [Rarity, readonly [number, number, number]]> = [
      ["common", [44, 44, 44]],
      ["uncommon", [30, 55, 29]],
      ["rare", [26, 26, 55]],
      ["epic", [44, 25, 47]],
      ["legendary", [68, 47, 12]],
      ["ultimate", [71, 9, 9]],
    ];
    for (const [rarity, rgb] of cases) {
      expect(detectRarityFromPixels(solid(32, 32, rgb))).toBe(rarity);
    }
  });

  test("ignores bright text painted over chrome", () => {
    const overlay = { x: 4, y: 4, w: 8, h: 4, rgb: [255, 255, 255] as const };
    expect(detectRarityFromPixels(solid(32, 32, [26, 26, 55], overlay))).toBe("rare");
  });

  test("returns null when the buffer is all bright text", () => {
    expect(detectRarityFromPixels(solid(32, 32, [240, 240, 240]))).toBeNull();
  });

  test("wraps red hues near 0° to ultimate", () => {
    expect(detectRarityFromPixels(solid(32, 32, [80, 12, 14]))).toBe("ultimate");
    expect(detectRarityFromPixels(solid(32, 32, [80, 14, 12]))).toBe("ultimate");
  });
});

describe("assets/Rarities and sample tooltips", () => {
  const samples: ReadonlyArray<readonly [string, Rarity]> = [
    ["Rarities/Common.png", "common"],
    ["Rarities/Uncommon.png", "uncommon"],
    ["Rarities/Rare.png", "rare"],
    ["Rarities/Epic.png", "epic"],
    ["Rarities/Legendary.png", "legendary"],
    ["Rarities/Ultimate.png", "ultimate"],
    ["1.png", "rare"],
    ["2.png", "rare"],
    ["3.png", "uncommon"],
    ["4.png", "epic"],
    ["Example.png", "ultimate"],
  ];

  for (const [file, rarity] of samples) {
    test(`reads ${file} as ${rarity}`, async () => {
      const path = join(import.meta.dir, "../../assets", file);
      const bytes = await Bun.file(path).bytes();
      expect(detectRarityFromPixels(decodePngRgba(bytes))).toBe(rarity);
    });
  }
});

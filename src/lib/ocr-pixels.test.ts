import { describe, expect, test } from "bun:test";
import { join } from "node:path";

import { extractTooltip } from "./ocr-extract";
import { pickTooltipStat } from "./ocr-stat";
import { mitchellUpscale, nearestUpscale, prepareTooltipPasses, scaleFor } from "./ocr-pixels";
import { decodePngRgba, encodePngRgba } from "./png-rgba";
import type { PixelBuffer } from "./rarity-color";

function solid(width: number, height: number, rgb: readonly [number, number, number]): PixelBuffer {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    data[o] = rgb[0];
    data[o + 1] = rgb[1];
    data[o + 2] = rgb[2];
    data[o + 3] = 255;
  }
  return { data, height, width };
}

describe("scaleFor / nearestUpscale", () => {
  test("caps Common.png-sized tooltips at 4x", () => {
    expect(scaleFor(279)).toBe(4);
    expect(scaleFor(1200)).toBe(1);
  });

  test("nearest 2x duplicates each pixel", () => {
    const src = solid(1, 1, [10, 20, 30]);
    const out = nearestUpscale(src, 2);
    expect(out.width).toBe(2);
    expect(out.height).toBe(2);
    for (let i = 0; i < 4; i++) {
      const o = i * 4;
      expect(out.data[o]).toBe(10);
      expect(out.data[o + 1]).toBe(20);
      expect(out.data[o + 2]).toBe(30);
    }
  });
});

describe("png roundtrip", () => {
  test("encode then decode keeps RGBA", () => {
    const src = solid(2, 2, [1, 2, 3]);
    const back = decodePngRgba(encodePngRgba(src));
    expect(back.width).toBe(2);
    expect(back.height).toBe(2);
    expect([...back.data]).toEqual([...src.data]);
  });
});

describe("prepareTooltipPasses Common.png", () => {
  test("Mitchell color pass OCRs physical 739072, same path the browser uses", async () => {
    const path = join(import.meta.dir, "../../assets/Rarities/Common.png");
    const file = Bun.file(path);
    if (!(await file.exists())) return;
    const src = decodePngRgba(await file.bytes());
    const passes = prepareTooltipPasses(src);
    expect(passes.color.width).toBe(src.width * 4);

    const Tesseract = (await import("tesseract.js")).default;
    const worker = await Tesseract.createWorker("eng", undefined, {
      gzip: false,
      langPath: join(import.meta.dir, "../../public"),
      logger: () => {},
    });
    const colorPng = encodePngRgba(passes.color);
    const threshPng = encodePngRgba(passes.threshold);
    const { data: colorData } = await worker.recognize(Buffer.from(colorPng));
    const { data: threshData } = await worker.recognize(Buffer.from(threshPng));
    await worker.terminate();

    const ex = extractTooltip({
      imageDataUrl: null,
      nameText: "Lava King's Warrior Armor",
      processedText: threshData.text.trim(),
      rarity: "common",
      rawText: colorData.text.trim(),
    });
    const picked = pickTooltipStat(ex, ex.item);
    expect(ex.physical).toBe(739072);
    expect(picked.value).toBe(739072);
  }, 120_000);
});

describe("mitchellUpscale", () => {
  test("2x keeps a flat field", () => {
    const out = mitchellUpscale(solid(2, 2, [80, 80, 80]), 2);
    expect(out.width).toBe(4);
    expect(out.height).toBe(4);
    expect(out.data[0]).toBe(80);
  });
});

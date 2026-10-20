/*
  OCR the same preprocess the browser uses (`src/lib/ocr-pixels.ts`).
  Do not Magick-resize — that path is not the app.

  Usage: bun scripts/test-ocr-pi.ts <image...>
*/

import { join } from "node:path";

import Tesseract from "tesseract.js";

import { extractTooltip } from "../src/lib/ocr-extract.ts";
import { prepareTooltipPasses } from "../src/lib/ocr-pixels.ts";
import { pickTooltipStat } from "../src/lib/ocr-stat.ts";
import { decodePngRgba, encodePngRgba } from "../src/lib/png-rgba.ts";

const images = process.argv.slice(2);
if (images.length === 0) {
  console.error("usage: bun scripts/test-ocr-pi.ts <image...>");
  process.exit(1);
}

const langPath = join(import.meta.dir, "../public");

const worker = await Tesseract.createWorker("eng", undefined, {
  gzip: false,
  langPath,
  logger: () => {},
});

for (const image of images) {
  const src = decodePngRgba(await Bun.file(image).bytes());
  const passes = prepareTooltipPasses(src);
  const color = await worker.recognize(Buffer.from(encodePngRgba(passes.color)));
  const thresh = await worker.recognize(Buffer.from(encodePngRgba(passes.threshold)));
  const plate =
    passes.namePlate === null
      ? ""
      : (await worker.recognize(Buffer.from(encodePngRgba(passes.namePlate)))).data.text.trim();
  const rawText = color.data.text.trim();
  const processedText = thresh.data.text.trim();
  const ex = extractTooltip({
    imageDataUrl: null,
    nameText: plate,
    processedText,
    rarity: null,
    rawText,
  });
  const picked = pickTooltipStat(ex, ex.item);
  console.log(`\n########## ${image} COLOR ##########`);
  console.log(rawText);
  console.log(`########## ${image} THRESHOLD ##########`);
  console.log(processedText);
  console.log(`########## ${image} NAME ##########`);
  console.log(plate);
  console.log("extract", {
    health: ex.health,
    item: ex.item?.name ?? null,
    physical: ex.physical,
    picked: picked.value,
    spell: ex.spell,
    upsDone: ex.upsDone,
    upsTotal: ex.upsTotal,
  });
}

await worker.terminate();

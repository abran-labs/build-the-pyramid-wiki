import { describe, expect, test } from "bun:test";

import {
  isGeckoEngine,
  readClipboardImage,
  type ClipboardImageItem,
} from "./clipboard-image";

function item(
  blobs: Readonly<Record<string, Blob>>,
): ClipboardImageItem {
  return {
    types: Object.keys(blobs),
    getType: async (type: string) => {
      const blob = blobs[type];
      if (blob === undefined) {
        throw new DOMException(`no ${type}`, "NotFoundError");
      }
      return blob;
    },
  };
}

describe("readClipboardImage", () => {
  test("returns null when clipboard is missing", async () => {
    // Given / When
    const got = await readClipboardImage(undefined);
    // Then
    expect(got).toBeNull();
  });

  test("returns null when clipboard has no image", async () => {
    // Given
    const text = new Blob(["hi"], { type: "text/plain" });
    // When
    const got = await readClipboardImage({
      read: async () => [item({ "text/plain": text })],
    });
    // Then
    expect(got).toBeNull();
  });

  test("returns the image blob when clipboard has an image", async () => {
    // Given
    const png = new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" });
    // When
    const got = await readClipboardImage({
      read: async () => [item({ "image/png": png })],
    });
    // Then
    expect(got).toBe(png);
  });

  test("prefers image over text on the same item", async () => {
    // Given
    const png = new Blob([new Uint8Array([9])], { type: "image/png" });
    const text = new Blob(["x"], { type: "text/plain" });
    // When
    const got = await readClipboardImage({
      read: async () => [
        item({ "text/plain": text, "image/png": png }),
      ],
    });
    // Then
    expect(got).toBe(png);
  });

  test("uses the first clipboard item that has an image", async () => {
    // Given
    const jpeg = new Blob([new Uint8Array([4])], { type: "image/jpeg" });
    // When
    const got = await readClipboardImage({
      read: async () => [
        item({ "text/plain": new Blob(["a"], { type: "text/plain" }) }),
        item({ "image/jpeg": jpeg }),
      ],
    });
    // Then
    expect(got).toBe(jpeg);
  });

  test("returns null when read is denied", async () => {
    // Given / When
    const got = await readClipboardImage({
      read: async () => {
        throw new DOMException("denied", "NotAllowedError");
      },
    });
    // Then
    expect(got).toBeNull();
  });

  test("returns null when clipboard is empty", async () => {
    // Given / When
    const got = await readClipboardImage({
      read: async () => {
        throw new DOMException("empty", "NotFoundError");
      },
    });
    // Then
    expect(got).toBeNull();
  });

  test("returns null when read is unsupported", async () => {
    // Given / When
    const got = await readClipboardImage({
      read: async () => {
        throw new TypeError("clipboard.read is not a function");
      },
    });
    // Then
    expect(got).toBeNull();
  });

  test("propagates unexpected errors", async () => {
    // Given
    const boom = new RangeError("boom");
    // When
    let thrown: unknown;
    try {
      await readClipboardImage({
        read: async () => {
          throw boom;
        },
      });
    } catch (error) {
      thrown = error;
    }
    // Then
    expect(thrown).toBe(boom);
  });
});

describe("isGeckoEngine", () => {
  test("is true when -moz-appearance is supported", () => {
    // Given
    const supports = (property: string, value: string) =>
      property === "-moz-appearance" && value === "none";
    // When / Then
    expect(isGeckoEngine(supports)).toBe(true);
  });

  test("is false when -moz-appearance is not supported", () => {
    // Given
    const supports = () => false;
    // When / Then
    expect(isGeckoEngine(supports)).toBe(false);
  });
});

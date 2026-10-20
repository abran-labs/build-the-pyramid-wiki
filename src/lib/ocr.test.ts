import { describe, expect, test } from "bun:test";

import { RaidBossError, raidBossTitle } from "./ocr";

describe("raidBossTitle", () => {
  test("flags a +N raid suffix, stripping chrome pipes", () => {
    expect(raidBossTitle("| Twisted Wood Greatsword +30 |")).toBe("Twisted Wood Greatsword +30");
    expect(raidBossTitle("Vorpal Blade +1")).toBe("Vorpal Blade +1");
  });
  test("ignores dungeon names and OCR chrome", () => {
    expect(raidBossTitle("Eldenbark Greatstaff")).toBeNull();
    expect(raidBossTitle("| Mjolnir")).toBeNull();
    expect(raidBossTitle("Ice Greatspear +")).toBeNull();
    expect(raidBossTitle("— Norse Greataxe")).toBeNull();
    expect(raidBossTitle("")).toBeNull();
  });
});

describe("RaidBossError", () => {
  test("says raid items are unsupported", () => {
    const err = new RaidBossError("Twisted Wood Greatsword +30");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("Boss raid items haven't been added yet.");
    expect(err.title).toBe("Twisted Wood Greatsword +30");
  });
});

import { describe, expect, test } from "bun:test";

import { DUNGEONS, ITEMS } from "./dqr-items";

describe("dungeon order", () => {
  test("lists dungeons hardest first", () => {
    expect(DUNGEONS[0]?.code).toBe("GS");
    expect(DUNGEONS[DUNGEONS.length - 1]?.code).toBe("DT");
  });

  test("items follow dungeon order hardest first", () => {
    expect(ITEMS[0]?.dungeon).toBe("GS");
    expect(ITEMS[ITEMS.length - 1]?.dungeon).toBe("DT");
  });
});

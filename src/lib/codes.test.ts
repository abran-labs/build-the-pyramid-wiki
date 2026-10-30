import { describe, expect, test } from "bun:test";

import { CODE_ENTRIES, codeViews, parseCodesState, type CodesState } from "./codes";

const NOW = 1_760_000_000;

function state(codes: CodesState["codes"]): CodesState {
  return { codes };
}

describe("parseCodesState", () => {
  test("rejects anything that is not a codes snapshot", () => {
    expect(parseCodesState(null)).toBeNull();
    expect(parseCodesState({ updatedAt: 1 })).toBeNull();
    expect(parseCodesState({ updatedAt: 1, codes: [] })).toBeNull();
  });

  test("keeps known fields and drops malformed code entries", () => {
    const parsed = parseCodesState({
      updatedAt: NOW,
      codes: {
        WELCOME: { enabled: false },
        BROKEN: { rewards: [] },
        PETS: { enabled: true, rewards: [{ kind: "coins", amount: 25000 }], expiresAt: NOW + 60 },
      },
    });
    expect(parsed?.codes.WELCOME).toEqual({ enabled: false });
    expect(parsed?.codes.BROKEN).toBeUndefined();
    expect(parsed?.codes.PETS).toEqual({
      enabled: true,
      rewards: [{ kind: "coins", amount: 25000 }],
      expiresAt: NOW + 60,
    });
  });
});

describe("codeViews", () => {
  test("keeps the hardcoded rewards and Working status without a live snapshot", () => {
    const views = codeViews(null, NOW);
    expect(views).toHaveLength(CODE_ENTRIES.length);
    expect(views[0]?.code).toBe("DEADEND");
    expect(views[0]?.rewards).toEqual(CODE_ENTRIES.find((entry) => entry.code === "DEADEND")?.rewards);
    expect(views.every((view) => view.status === "Working")).toBe(true);
  });

  test("orders tallest reward lists first, then by code name", () => {
    const views = codeViews(null, NOW);
    const codes = views.map((view) => view.code);
    expect(codes.slice(0, 4)).toEqual(["DEADEND", "MAZERUNNER", "UPDATEDELAY3", "WHATISTHISPLACE"]);
    expect(new Set(codes).size).toBe(CODE_ENTRIES.length);

    const counts = views.map((view) => view.rewards.length);
    for (let index = 1; index < counts.length; index += 1) {
      expect(counts[index - 1]).toBeGreaterThanOrEqual(counts[index] ?? 0);
    }
  });

  test("ignores live codes the wiki does not list", () => {
    const views = codeViews(state({ NOTREAL: { enabled: true } }), NOW);
    expect(views).toHaveLength(CODE_ENTRIES.length);
  });

  test("uses live rewards and turns disabled codes off", () => {
    const views = codeViews(state({ WELCOME: { enabled: false } }), NOW);
    const welcome = views.find((view) => view.code === "WELCOME");
    expect(welcome?.status).toBe("Disabled");
    expect(welcome?.rewards).toEqual(CODE_ENTRIES.find((entry) => entry.code === "WELCOME")?.rewards);
  });

  test("reports expired and fully claimed codes", () => {
    const views = codeViews(
      state({
        MAZERUNNER: { enabled: true, expiresAt: NOW - 1, rewards: [{ kind: "speed", amount: 10 }] },
        FREECODE: { enabled: true, maxClaims: 500, claimed: 500 },
        PETS: { enabled: true, maxClaims: 500, claimed: 499 },
      }),
      NOW,
    );
    expect(views.find((view) => view.code === "MAZERUNNER")?.status).toBe("Expired");
    expect(views.find((view) => view.code === "FREECODE")?.status).toBe("Fully claimed");
    expect(views.find((view) => view.code === "PETS")?.status).toBe("Working");
  });

  test("maps every live reward kind to an icon and label", () => {
    const views = codeViews(
      state({
        WELCOME: {
          enabled: true,
          rewards: [
            { kind: "coins", amount: 1 },
            { kind: "candyCorn", amount: 2000 },
            { kind: "speed", amount: 500 },
            { kind: "strength", amount: 750 },
            { kind: "pet", petId: "Bat", amount: 2 },
            { kind: "potion", potion: "Luck", tier: 5, amount: 3 },
          ],
        },
      }),
      NOW,
    );
    const rewards = views.find((view) => view.code === "WELCOME")?.rewards ?? [];
    expect(rewards.map((reward) => reward.label)).toEqual([
      "1 Coin",
      "2,000 Candy Corn",
      "500 Speed",
      "750 Strength",
      "2× Bat Pet",
      "3× Luck Potion V",
    ]);
    expect(rewards[4]?.href).toBe("/pets/bat");
    expect(rewards[5]?.image).toBe("/potions/luck-5.png");
  });
});

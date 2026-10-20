import { describe, expect, test } from "bun:test";

import { buildDiscordText } from "./discord-copy";
import type { Track } from "./item-tracks";

const SEP = "> ---------------------------------------->";
const dps: Track = {
  chrome: "physical",
  kind: "dps",
  percentile: 92.4,
  value: 4_350_147,
  valueLabel: "Potential",
};
const health: Track = {
  chrome: "health",
  kind: "health",
  percentile: 61,
  value: 85_371_082,
  valueLabel: "Health",
};

describe("buildDiscordText", () => {
  test("weapon paste is title plus the arrow block", () => {
    // Given / When
    const text = buildDiscordText({
      rarity: "Rare",
      title: "Midgardian Mage Helmet",
      tracks: [dps],
    });
    // Then
    expect(text).toBe(
      [
        "**Midgardian Mage Helmet** · Rare",
        SEP,
        "> :trophy: Potential: `4,350,147`",
        "> :chart_with_upwards_trend: Tier: `Good Pot` (92.4%)",
        SEP,
      ].join("\n"),
    );
  });

  test("hybrid legendary paste lists Physical then Spell", () => {
    const spell: Track = { ...dps, chrome: "spell", percentile: 40, value: 320 };
    const text = buildDiscordText({
      rarity: "Legendary",
      title: "Desert Fury",
      tracks: [dps, spell],
    });
    expect(text).toBe(
      [
        "**Desert Fury** · Legendary",
        SEP,
        "> **Physical**",
        "> :trophy: Potential: `4,350,147`",
        "> :chart_with_upwards_trend: Tier: `Good Pot` (92.4%)",
        "> **Spell**",
        "> :trophy: Potential: `320`",
        "> :chart_with_upwards_trend: Tier: `Average Pot` (40.0%)",
        SEP,
      ].join("\n"),
    );
  });

  test("DPS armor paste lists DPS then Health in the arrow block", () => {
    const text = buildDiscordText({
      rarity: "Epic",
      title: "Midgardian Mage Armor",
      tracks: [dps, health],
    });
    expect(text).toBe(
      [
        "**Midgardian Mage Armor** · Epic",
        SEP,
        "> **DPS**",
        "> :trophy: Potential: `4,350,147`",
        "> :chart_with_upwards_trend: Tier: `Good Pot` (92.4%)",
        "> **Health**",
        "> :green_heart: Health: `85,371,082`",
        "> :chart_with_upwards_trend: Tier: `Average Pot` (61.0%)",
        SEP,
      ].join("\n"),
    );
  });
});

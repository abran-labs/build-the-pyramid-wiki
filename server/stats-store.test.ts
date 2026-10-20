import { Database } from "bun:sqlite";
import { describe, expect, test } from "bun:test";

import { openStatsStore } from "./stats-store";

function store() {
  return openStatsStore(new Database(":memory:"));
}

describe("openStatsStore field feedback", () => {
  test("counts each field vote toward accuracy, not the old calculation flag", () => {
    const stats = store();
    const id = stats.insertCalculation(null, null);
    expect(stats.applyFieldFeedback(id, "item", true)).toBe("ok");
    expect(stats.applyFieldFeedback(id, "upgrades", true)).toBe("ok");
    expect(stats.applyFieldFeedback(id, "physical", false)).toBe("ok");
    const aggregate = stats.readAggregate();
    expect(aggregate.feedbackTotal).toBe(3);
    expect(aggregate.feedbackAccurate).toBe(2);
    expect(aggregate.accuracy).toBe(66.7);
    expect(aggregate.itemsCalculated).toBe(1);
  });

  test("rejects a second vote on the same field of the same calculation", () => {
    const stats = store();
    const id = stats.insertCalculation(null, null);
    expect(stats.applyFieldFeedback(id, "health", true)).toBe("ok");
    expect(stats.applyFieldFeedback(id, "health", false)).toBe("duplicate");
    expect(stats.readAggregate().feedbackTotal).toBe(1);
  });

  test("rejects a vote for an unknown calculation", () => {
    const stats = store();
    expect(stats.applyFieldFeedback(99, "item", true)).toBe("missing");
  });
});

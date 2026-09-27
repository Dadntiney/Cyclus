/**
 * Wave 2/3 smoke checks for doctor summary + tip personalization helpers.
 * Run: npx tsx scripts/verify-wave2.ts
 */
import assert from "node:assert/strict"
import { buildDoctorSummary } from "../src/lib/cycle/doctor-summary"

const checkins = []
for (let i = 1; i <= 12; i++) {
  const poor = i <= 6
  checkins.push({
    date: `2026-01-${String(i).padStart(2, "0")}`,
    energy: poor ? 2 : 4,
    mood: 3,
    sleep: poor ? 1 : 5,
    stress: poor ? 4 : 2,
    symptoms: poor ? ["Brain fog"] : [],
    notes: i === 2 ? "Slecht geslapen" : null,
  })
}

const summary = buildDoctorSummary({
  weeks: 8,
  checkins,
  cycleProfile: {
    has_cycle: true,
    last_period_start: "2026-01-01",
    average_cycle_length: 28,
    regularity: "regelmatig",
  },
  menstruationDates: ["2026-01-01", "2026-01-02"],
})

assert.equal(summary.checkinCount, 12)
assert.ok(summary.averages.sleep !== null)
assert.ok(summary.topSymptoms.some((s) => s.symptom === "Brain fog"))
assert.ok(summary.insights.length >= 1)
assert.match(summary.cycleNote, /cyclus/i)
assert.ok(summary.noteHighlights.length >= 1)

console.log("Wave 2/3 checks passed")
console.log("  insight:", summary.insights[0]?.text)
console.log("  cycle:", summary.cycleNote)

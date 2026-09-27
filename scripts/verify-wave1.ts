/**
 * Wave 1 verification: personalization engine + correlation insights.
 * Run: npx tsx scripts/verify-wave1.ts
 */
import assert from "node:assert/strict"
import { computePersonalInsights } from "../src/lib/cycle/insights"
import {
  buildRecommendation,
  pickTodaysRecipe,
  pickTodaysWorkout,
  shouldPreferShort,
  wantsLowerIntensityToday,
} from "../src/lib/recommendations/engine"

const workouts = [
  { id: "1", title: "Kracht", type: "krachttraining", duration: 35, difficulty: "pittig" },
  { id: "2", title: "Yoga", type: "yoga", duration: 20, difficulty: "makkelijk" },
  { id: "3", title: "Adem", type: "mobiliteit", duration: 5, difficulty: "makkelijk" },
  { id: "4", title: "Hardlopen", type: "hardlopen", duration: 30, difficulty: "pittig" },
  { id: "5", title: "Wandelen", type: "wandelen", duration: 30, difficulty: "makkelijk" },
]

const recipes = [
  {
    id: "r1",
    title: "Snel",
    category: ["Snel", "Lunch"],
    preparation_time: 10,
    nutrition_information: { koolhydraten: "30g" },
  },
  {
    id: "r2",
    title: "Lang",
    category: ["Diner", "Eiwitrijk"],
    preparation_time: 45,
    nutrition_information: { koolhydraten: "40g" },
  },
]

const baseProfile = {
  training_preferences: ["Krachttraining", "Yoga", "Wandelen"],
  health_conditions: [] as string[],
  movement_limitations: [] as string[],
  wellness_preference: "natuurlijk",
}

assert.equal(
  wantsLowerIntensityToday({
    energy: 1,
    mood: null,
    sleep: null,
    stress: null,
    symptoms: [],
    need: null,
  }),
  true,
)
assert.equal(
  wantsLowerIntensityToday({
    energy: 4,
    mood: 2,
    sleep: 4,
    stress: 2,
    symptoms: [],
    need: null,
  }),
  true,
)

const lowPick = pickTodaysWorkout({
  profile: baseProfile,
  latestCheckin: {
    energy: 1,
    mood: 2,
    sleep: 2,
    stress: 4,
    symptoms: ["Vermoeidheid"],
    need: "rust",
  },
  cycleEstimate: {
    cycleDay: 14,
    phase: "ovulatie",
    phaseLabel: "Ovulatie",
    isEstimate: true,
  },
  workouts,
  seed: "user-2026-01-01",
})
assert.ok(lowPick.workout)
assert.equal(lowPick.workout.difficulty, "makkelijk")

const mensEstimate = {
  cycleDay: 2,
  phase: "menstruatie" as const,
  phaseLabel: "Menstruatie",
  isEstimate: true as const,
}
const mensPick = pickTodaysWorkout({
  profile: { ...baseProfile, wellness_preference: "fitness" },
  latestCheckin: {
    energy: 4,
    mood: 4,
    sleep: 4,
    stress: 2,
    symptoms: [],
    need: null,
  },
  cycleEstimate: mensEstimate,
  workouts,
  seed: "user-2026-01-02",
})
assert.ok(mensPick.workout)
assert.notEqual(mensPick.workout.difficulty, "pittig")
assert.ok(shouldPreferShort(null, mensEstimate))
assert.match(mensPick.reason, /menstruatie/i)

const a = pickTodaysWorkout({
  profile: baseProfile,
  latestCheckin: null,
  workouts,
  seed: "same-day",
})
const b = pickTodaysWorkout({
  profile: baseProfile,
  latestCheckin: null,
  workouts,
  seed: "same-day",
})
assert.equal(a.workout?.id, b.workout?.id)

const recipePick = pickTodaysRecipe({
  profile: { nutrition_preferences: [], nutrition_style: "normaal" },
  latestCheckin: { need: null, energy: 1, sleep: 2, symptoms: [] },
  recipes,
  seed: "food-1",
})
assert.ok(recipePick.recipe)
assert.ok((recipePick.recipe.preparation_time ?? 99) <= 20)

const checkins = []
for (let i = 0; i < 6; i++) {
  checkins.push({
    date: `2026-01-0${i + 1}`,
    sleep: 1,
    energy: 2,
    mood: 3,
    stress: 3,
    symptoms: ["Brain fog"],
  })
}
for (let i = 0; i < 6; i++) {
  checkins.push({
    date: `2026-01-${10 + i}`,
    sleep: 5,
    energy: 4,
    mood: 4,
    stress: 2,
    symptoms: [] as string[],
  })
}
const insights = computePersonalInsights(checkins, null)
assert.ok(insights.length >= 1)
assert.ok(insights.some((i) => /brain fog|slaap/i.test(i.text)))
assert.equal(computePersonalInsights(checkins.slice(0, 5), null).length, 0)

const rec = buildRecommendation({
  profile: {
    name: "Anna",
    goals: [],
    training_preferences: ["Yoga"],
    nutrition_preferences: [],
    nutrition_style: "normaal",
    health_conditions: [],
    movement_limitations: [],
    wellness_preference: "natuurlijk",
  },
  cycleEstimate: mensEstimate,
  latestCheckin: {
    energy: 4,
    mood: 4,
    sleep: 4,
    stress: 2,
    symptoms: [],
    need: null,
  },
  workouts,
  recipes,
  seed: "rec-1",
})
assert.match(rec.dayFocus, /menstruatie/i)

console.log("Wave 1 checks passed")
console.log(`  low-intensity: ${lowPick.workout!.title} — ${lowPick.reason}`)
console.log(`  menstruatie: ${mensPick.workout!.title} — ${mensPick.reason}`)
console.log(`  insight: ${insights[0].text}`)

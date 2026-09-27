import "server-only"

// Best-effort English search query per known workout, since Pexels matches
// far better on English terms than Dutch titles. Falls back to a
// type-based query for anything not in this list (e.g. future workouts).
// "Mobiliteit" here mostly covers breathing/sleep/reset content rather than
// stretching, so those queries lean calm/restful instead of active.
const WORKOUT_QUERIES: Record<string, string> = {
  "Fietsen - Duurtraining": "cycling road bike outdoor",
  "Fietsen - Pittige Intervaltraining": "cycling sprint intense outdoor",
  "Hardlopen - Interval": "runner sprint interval training",
  "Hardlopen - Rustige Duurloop": "jogging calm outdoor park",
  "Hardlopen - Tempotraining": "runner tempo training road",
  "Core sessie - 7 minuten": "core workout plank woman",
  "Krachttraining - Hele lichaam": "full body strength training gym",
  "Pittige krachttraining - Hele lichaam": "intense strength training weights",
  "Ademhaling & Ontspanning": "breathing relaxation calm woman",
  "Ademreset 4 minuten": "deep breathing exercise calm",
  "Body scan 6 minuten": "body scan meditation lying down",
  "Kort lontje reset 5 minuten": "calm breathing stress relief",
  "Mobiliteit - Rustige Reset": "gentle stretching mobility calm",
  "Nek & Schouders Reset": "neck shoulder stretch relief",
  "Slaapritueel 8 minuten": "bedtime relaxation calm evening",
  "Pilates - Core & Stabiliteit": "pilates core exercise mat",
  "Pilates - Hele lichaam flow": "pilates flow studio",
  "Pilates - Pittige Core": "pilates core intense workout",
  "Wandelen - Actief Herstel": "walking outdoor nature recovery",
  "Wandelen - Korte Wandeling": "short walk park path",
  "Wandelen - Stevige Heuveltraining": "hiking hill trail walking",
  "Wandeling met aandacht 10 minuten": "mindful walking nature calm",
  "Yoga - Energieke Flow": "yoga flow energetic pose",
  "Yoga - Pittige Power Yoga": "power yoga intense pose",
  "Yoga Flow - Zachte Beweging": "gentle yoga flow calm",
}

const TYPE_QUERIES: Record<string, string> = {
  krachttraining: "strength training workout",
  wandelen: "walking outdoor",
  hardlopen: "running outdoor",
  fietsen: "cycling outdoor",
  yoga: "yoga pose calm",
  pilates: "pilates workout",
  mobiliteit: "gentle stretching relaxation",
}

function buildQuery(title: string, type: string): string {
  if (WORKOUT_QUERIES[title]) return WORKOUT_QUERIES[title]
  return TYPE_QUERIES[type] ?? "exercise fitness"
}

export interface FetchedImage {
  base64: string
  contentType: string
}

/**
 * Finds and downloads one stock photo for a workout via the Pexels API.
 * Server-only — the API key must never reach client code. Mirrors
 * fetchRecipeStockPhoto in pexels-provider.ts.
 */
export async function fetchWorkoutStockPhoto(title: string, type: string): Promise<FetchedImage> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not configured.")
  }

  const query = buildQuery(title, type)
  const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`

  const searchResponse = await fetch(searchUrl, {
    headers: { Authorization: apiKey },
  })
  if (!searchResponse.ok) {
    const detail = await searchResponse.text().catch(() => "")
    throw new Error(`Pexels search failed (${searchResponse.status}): ${detail.slice(0, 300)}`)
  }

  const searchData = await searchResponse.json()
  const photoUrl: string | undefined = searchData?.photos?.[0]?.src?.large
  if (!photoUrl) {
    throw new Error(`Pexels search returned no results for query "${query}".`)
  }

  const imageResponse = await fetch(photoUrl)
  if (!imageResponse.ok) {
    throw new Error(`Downloading the Pexels photo failed (${imageResponse.status}).`)
  }

  const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg"
  const arrayBuffer = await imageResponse.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString("base64")

  return { base64, contentType }
}

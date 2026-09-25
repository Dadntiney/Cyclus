import "server-only"

// Best-effort English search query per known recipe, since Pexels matches
// far better on English terms than Dutch titles. Falls back to a
// category-based query for anything not in this list (e.g. future recipes).
const RECIPE_QUERIES: Record<string, string> = {
  "Zalm met zoete aardappel en groenten": "salmon sweet potato vegetables plate",
  "Overnight oats met bessen": "overnight oats berries jar",
  "Linzensalade met feta": "lentil salad feta",
  Kikkererwtencurry: "chickpea curry bowl",
  "Griekse yoghurt met noten en honing": "greek yogurt honey walnuts",
  "Gegrilde kip met quinoa en groenten": "grilled chicken quinoa vegetables",
  "Veganistische smoothiebowl": "smoothie bowl fruit",
  "Pittige pompoensoep": "pumpkin soup bowl",
  "Budget kip-rijst bowl": "chicken rice bowl vegetables",
  "Tonijnsalade met ei en aardappel": "tuna salad egg potato",
  "Kwark met havermout en fruit": "yogurt oatmeal fruit bowl",
  "Bonen-groentestoof": "white bean vegetable stew bowl",
  "Gebakken ei met volkoren brood en groente": "fried egg toast vegetables",
  "Linzen-aardappel curry": "lentil potato curry",
  "Hummus met groentesticks": "hummus vegetable sticks dip",
  "Appel met pindakaas en kaneel": "apple peanut butter slices",
  "Cottage cheese met komkommer en radijs": "cottage cheese cucumber radish",
  "Courgette-noedels met gehaktballetjes": "zucchini noodles meatballs",
  "Volkoren wrap met hummus en groenten": "vegetable wrap hummus",
  "Zalmfilet met broccolipuree en amandeldressing": "salmon fillet broccoli plate almonds",
  "Linzensoep met venkel": "lentil soup fennel",
  "Havermout-pannenkoekjes": "oatmeal pancakes stack",
  "Griekse yoghurt met honing en walnoten": "greek yogurt honey walnuts bowl",
  "Gerookte makreel op rijstwafel": "smoked mackerel rice cake",
  "Overnight oats met bosvruchten": "overnight oats mixed berries jar",
  "Roerei met spinazie en volkoren toast": "scrambled eggs spinach toast",
  "Quinoa salade met feta en granaatappelpit": "quinoa salad feta pomegranate",
  "Kip-avocado wrap": "chicken avocado wrap",
}

const CATEGORY_QUERIES: Record<string, string> = {
  Ontbijt: "healthy breakfast bowl",
  Lunch: "healthy lunch bowl",
  Diner: "healthy dinner plate",
  Snack: "healthy snack",
}

function buildQuery(title: string, categories: string[]): string {
  if (RECIPE_QUERIES[title]) return RECIPE_QUERIES[title]
  const category = categories.find((c) => CATEGORY_QUERIES[c])
  return category ? CATEGORY_QUERIES[category] : "healthy food plate"
}

export interface FetchedImage {
  base64: string
  contentType: string
}

/**
 * Finds and downloads one stock photo for a recipe via the Pexels API.
 * Server-only — the API key must never reach client code.
 */
export async function fetchRecipeStockPhoto(
  title: string,
  categories: string[],
): Promise<FetchedImage> {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    throw new Error("PEXELS_API_KEY is not configured.")
  }

  const query = buildQuery(title, categories)
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

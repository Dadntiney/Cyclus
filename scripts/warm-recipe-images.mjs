import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "fs"

function loadEnv() {
  if (!existsSync(".env.local")) return
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const i = line.indexOf("=")
    if (i < 0 || line.startsWith("#")) continue
    const k = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim()
    if (!process.env[k]) process.env[k] = v
  }
}
loadEnv()

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = "recipe-images"
const LIMIT = Number(process.env.WARM_LIMIT || 120)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const MEALDB_ALIASES = {
  "Bibimbap met kimchi": "Bibimbap",
  "Palak paneer": "Puttanesca", // weak - skip
  "Paella met zeevruchten": "Seafood paella",
  "Franse ratatouille": "Ratatouille",
  "Spaghetti aglio e olio met broccoli": "Spaghetti",
  "Pasta primavera met lentegroenten": "Pasta",
  "Romige paddenstoelenrisotto": "Risotto",
  "Thaise groene curry met tofu": "Thai Green Curry",
  "Mexicaanse chili con carne": "Chili",
  "Japanse misosoep met tofu en wakame": "Miso",
  "Miso-soep met tofu en wakame": "Miso",
  "Vietnamese pho bo": "Pho",
  "Shakshuka met feta en volkoren brood": "Shakshuka",
  "Stamppot boerenkool met rookworst": "Stamppot",
  "Hongaarse goulash met aardappelen": "Goulash",
  "Salade Niçoise met tonijn": "Nicoise",
  "Salade Niçoise": "Nicoise",
  "Dal makhani (romige zwarte linzencurry)": "Dal fry",
  "Kokos-linzen dhal met spinazie": "Dal fry",
  "Indonesische nasi goreng met ei": "Nasi lemak",
  "Kleurrijke groentecurry met kokosmelk": "Vegetarian",
  "Gado-gado": "Gado",
  "Gazpacho Andaluz": "Gazpacho",
  "Koude tomatensoep met volkoren croutons": "Gazpacho",
  "Spaanse aardappel-tortilla": "Spanish omelette",
  "Griekse moussaka": "Moussaka",
  "Turkse mercimek çorbası": "Lentil",
  "West-Afrikaanse pindastoof met kip en spinazie": "Peanut",
  "Zalm-teriyaki rijstbowl met edamame": "Salmon",
  "Gyudon (Japanse rundvlees-rijstbowl)": "Beef",
  "Brazilian açaí bowl": "Acai",
  "Braziliaanse açaí bowl": "Acai",
  "Chia-pudding met mango en kokos": "Chia",
  "Overnight chia pudding met perzik en amandel": "Chia",
  "Pannenkoeken van banaan en ei": "Pancake",
  "Warm chocolade-havermoutontbijt": "Oatmeal",
  "Scandinavische havermoutpap met bosbessen": "Oatmeal",
  "Groene smoothie met spinazie, banaan en pindakaas": "Smoothie",
  "Bessen-yoghurt smoothie met haver": "Smoothie",
  "One-pot tomatensoep-pasta": "Tomato soup",
  "Pasta e ceci (pasta met kikkererwten)": "Pasta",
  "Zoete aardappel-chili sin carne": "Sweet potato",
  "Peruaanse quinoa salade met avocado": "Quinoa",
  "Omelet met spinazie en geitenkaas": "Omelette",
  "Turks menemen": "Menemen",
  "Hummus-wrap met geroosterde groenten": "Hummus",
  "Volkoren wrap met kip, avocado en yoghurt-dressing": "Wrap",
  "Dark chocolate oat cups": "Chocolate",
  "Gegrilde halloumi-salade met watermeloen": "Halloumi",
  "Mexicaanse black bean tacos": "Tacos",
  "Geroosterde bloemkool-tacos met tahin": "Tacos",
  "Ethiopische misir wot (pittige linzenstoof)": "Lentil",
  "Koreaanse kimchi-jjigae met tofu": "Kimchi",
  "Marokkaanse zoete aardappel-kikkererwtenschotel": "Chickpea",
  "Portugese bacalhau à Brás": "Cod",
  "Boekweitpannenkoekjes met gerookte zalm": "Pancake",
  "Japanse tamago-sando": "Egg",
  "Amerikaanse pompoen-quinoa ovenschotel": "Pumpkin",
  "Vlaamse stoofpot met rundvlees en donker bier": "Beef stew",
  "Caribische kip-kokosrijst met bonen (rice and peas)": "Rice peas",
  "Fesenjan (Perzische kip in granaatappel-walnootsaus)": "Chicken",
  "Libanese tabouleh met quinoa": "Tabbouleh",
  "Thaise mangosalade met gegrilde garnalen": "Mango salad",
  "Vietnamese zomerrolletjes met garnaal": "Spring rolls",
  "Vietnamese rijstpapierrolletjes met regenboog groenten": "Spring rolls",
  "Griekse boerensalade (Horiatiki)": "Greek salad",
  "Caprese salade met burrata": "Caprese",
  "Bibim guksu (Koreaanse pittige koude noedels)": "Noodles",
  "Som tam (groene papajasalade)": "Papaya salad",
  "Panzanella (Toscaanse broodsalade)": "Panzanella",
  "Regenboog Buddha bowl met tahin-dressing": "Buddha bowl",
  "Mexicaanse bonen bowl met mangosalsa": "Bean bowl",
  "Zelfgemaakte trailmix met pure chocolade": "Trail mix",
  "Donkere chocolade-energyballs met dadels": "Energy balls",
  "Chocoladepudding van avocado en cacao": "Chocolate pudding",
  "Bananen-nicecream met pure chocolade": "Banana ice cream",
  "Warme appel-kaneelcrumble met havermout": "Apple crumble",
  "Warme chocolademelk met kaneel": "Hot chocolate",
  "Gezouten karamel-notenmix": "Nuts",
  "Hartige kaas-zadencrackers": "Crackers",
  "Kikkererwten-brownies": "Brownies",
  "Griekse yoghurt-chocolademousse": "Chocolate mousse",
  "Kaasplankje met noten en honing": "Cheese board",
  "Loaded sweet potato fries met kaas en spek": "Sweet potato fries",
  "Popcorn met pure chocolade en zeezout": "Popcorn chocolate",
  "Pindakaas-havermout cookies (no-bake)": "Peanut butter cookies",
  "Toscaanse witte bonen met salie en tomaat": "White beans tomato",
  "Turkse kabak mücver (courgette-pannenkoekjes)": "Zucchini fritters",
  "Turkse mezze met gegrilde groenten en granaatappel": "Mezze",
  "Griekse fakes (linzensoep)": "Lentil soup",
  "Griekse gegrilde vis met citroen en oregano": "Grilled fish lemon",
  "Marokkaanse harira": "Harira",
  "Marokkaanse couscoussalade met citroen en munt": "Couscous salad",
  "Marokkaanse kip met abrikozen en amandelen": "Chicken apricot",
  "Marokkaanse kikkererwtentajine met zoete aardappel": "Chickpea tagine",
  "Libanese adas bi hamod": "Lentil soup lemon",
  "Mujadara (linzen met rijst en gekarameliseerde ui)": "Mujadara",
  "Koreaanse dak-doritang (gestoofde kip met aardappel)": "Korean chicken stew",
  "Koreaanse miyeok-guk met rundvlees": "Seaweed soup",
  "Portugese gegrilde sardines met paprika": "Grilled sardines",
  "Portugese sopa de grão (kikkererwtensoep met chorizo)": "Chickpea soup",
  "Peruaanse ceviche met zoete aardappel en mais": "Ceviche",
  "Frisse mango-avocado salade met limoen": "Mango avocado salad",
  "Pasta met pompoen en salie": "Pumpkin pasta",
}

async function fetchPexels(query) {
  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) return null
  const searchUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`
  const res = await fetch(searchUrl, { headers: { Authorization: apiKey } })
  if (!res.ok) throw new Error(`Pexels ${res.status}`)
  const data = await res.json()
  const photoUrl = data?.photos?.[0]?.src?.large
  if (!photoUrl) return null
  const img = await fetch(photoUrl)
  if (!img.ok) throw new Error(`Pexels dl ${img.status}`)
  return { buf: Buffer.from(await img.arrayBuffer()), contentType: img.headers.get("content-type") || "image/jpeg", source: "pexels" }
}

async function fetchMealDb(title) {
  const q = MEALDB_ALIASES[title] || title.split(/[,(]/)[0].trim().split(" ").slice(0, 2).join(" ")
  const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MealDB ${res.status}`)
  const data = await res.json()
  const meal = data?.meals?.[0]
  if (!meal?.strMealThumb) return null
  const img = await fetch(meal.strMealThumb)
  if (!img.ok) return null
  return { buf: Buffer.from(await img.arrayBuffer()), contentType: "image/jpeg", source: "themealdb:" + meal.strMeal }
}

async function fetchWikimedia(query) {
  await sleep(1200) // throttle
  const searchUrl =
    "https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&format=json&srlimit=8&origin=*&srsearch=" +
    encodeURIComponent(query)
  const searchRes = await fetch(searchUrl, {
    headers: { "User-Agent": "CyclusRecipeWarmer/1.1 (https://cyclus-eight.vercel.app; recipe image backfill)" },
  })
  if (!searchRes.ok) throw new Error(`Commons search ${searchRes.status}`)
  const searchData = await searchRes.json()
  for (const hit of searchData?.query?.search || []) {
    if (!/\.(jpg|jpeg|png|webp)$/i.test(hit.title)) continue
    await sleep(400)
    const infoUrl =
      "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|mime|size&format=json&origin=*&titles=" +
      encodeURIComponent(hit.title)
    const infoRes = await fetch(infoUrl, {
      headers: { "User-Agent": "CyclusRecipeWarmer/1.1 (https://cyclus-eight.vercel.app; recipe image backfill)" },
    })
    if (!infoRes.ok) continue
    const infoData = await infoRes.json()
    const page = Object.values(infoData?.query?.pages || {})[0]
    const ii = page?.imageinfo?.[0]
    if (!ii?.url || (ii.size && ii.size > 6_000_000)) continue
    if (!(ii.mime || "").startsWith("image/")) continue
    const img = await fetch(ii.url, {
      headers: { "User-Agent": "CyclusRecipeWarmer/1.1 (https://cyclus-eight.vercel.app; recipe image backfill)" },
    })
    if (!img.ok) continue
    const buf = Buffer.from(await img.arrayBuffer())
    if (buf.length < 8_000) continue
    return { buf, contentType: ii.mime || "image/jpeg", source: "commons" }
  }
  return null
}

function extFor(contentType) {
  if (contentType.includes("png")) return "png"
  if (contentType.includes("webp")) return "webp"
  return "jpg"
}

const { data: recipes, error } = await supabase.from("recipes").select("id, title, category, image_url").order("title")
if (error) throw error
const pending = (recipes || []).filter((r) => !r.image_url).slice(0, LIMIT)
console.log(`Pending: ${pending.length}`)

let ok = 0, fail = 0
for (const recipe of pending) {
  try {
    let fetched = null
    try { fetched = await fetchPexels(MEALDB_ALIASES[recipe.title] || recipe.title) } catch {}
    if (!fetched) fetched = await fetchMealDb(recipe.title)
    if (!fetched) {
      const q = MEALDB_ALIASES[recipe.title] || recipe.title.split(/[,(]/)[0].trim()
      fetched = await fetchWikimedia(q + " food")
    }
    if (!fetched) throw new Error("no image")
    const path = `${recipe.id}.${extFor(fetched.contentType)}`
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, fetched.buf, {
      contentType: fetched.contentType, upsert: true, cacheControl: "31536000",
    })
    if (upErr) throw upErr
    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)
    const { error: updErr } = await supabase.from("recipes").update({ image_url: pub.publicUrl }).eq("id", recipe.id).is("image_url", null)
    if (updErr) throw updErr
    ok++
    console.log("OK", fetched.source, recipe.title)
  } catch (e) {
    fail++
    console.warn("FAIL", recipe.title, e.message || e)
  }
}
console.log(JSON.stringify({ processed: pending.length, ok, fail }, null, 2))

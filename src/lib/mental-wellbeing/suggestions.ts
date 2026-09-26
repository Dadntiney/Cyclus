import type { BuddyStyle } from "@/lib/buddy/styles"
import { pickStyleForToday } from "@/lib/buddy/styles"
import type { MentalWellbeingCategory } from "@/lib/constants"
import { MINDFUL_EXERCISES, type MindfulExercise } from "@/lib/data/mindful-exercises"

/**
 * Derives an optional "wat heeft mijn hoofd vandaag nodig?" suggestion from
 * her EXISTING daily check-in — never a second question. Uses the new
 * MENTAL_SYMPTOM_OPTIONS checkboxes (only shown when mental wellbeing is
 * enabled, see constants.ts) as the primary signal, and falls back to her
 * existing mood rating for a low-mood day where she didn't tick a specific
 * symptom. Deliberately narrow: only the 6 categories with a direct,
 * recognizable check-in signal trigger a suggestion — the other 5 (rust,
 * zelfvertrouwen, slaap, positiviteit, zelfzorg) are things she browses for
 * herself in the library, not things the app guesses she needs.
 *
 * Per the product brief's "geen verplichte positiviteit": the text below
 * always acknowledges first, and never tries to argue her out of a feeling.
 */

const CATEGORY_BY_SYMPTOM: Record<string, MentalWellbeingCategory> = {
  Gespannen: "angst_spanning",
  Angstig: "angst_spanning",
  Overprikkeld: "overprikkeling",
  Prikkelbaar: "prikkelbaarheid",
  Somber: "somberheid",
  Eenzaam: "eenzaamheid",
  Piekerig: "piekeren",
}

interface SuggestionCopy {
  neutral: string
  styles?: Partial<Record<BuddyStyle, string>>
}

const SUGGESTION_COPY: Record<
  "angst_spanning" | "overprikkeling" | "prikkelbaarheid" | "somberheid" | "eenzaamheid" | "piekeren",
  SuggestionCopy
> = {
  angst_spanning: {
    neutral:
      "Je voelt je vandaag misschien wat gespannen of angstig. Misschien is dit een goed moment om even te vertragen.",
    styles: {
      liefdevol: "Voel je je gespannen vandaag? Gun jezelf een klein momentje om even te vertragen. 💛",
      humor: "Je zenuwen staan vandaag misschien wat aan. Tijd om ze even in de vliegtuigstand te zetten. 😄",
      spiritueel: "Adem bewust in, en voel hoe de spanning bij het uitademen iets kan zakken. ✨",
      motiverend: "Je hoeft de spanning niet te laten winnen — één rustige ademhaling helpt al. 💪",
      informatief: "Spanning en onrust kunnen samenhangen met hoe je je vandaag voelt — een korte ademhalingsoefening kan helpen te kalmeren.",
      rustig: "Adem rustig in. En laat je schouders bij de uitademing zakken. 🌿",
      direct: "Gespannen vandaag? Doe nu twee minuten ademhaling.",
      luchtig: "Beetje gespannen vandaag? Een korte ademhaling kan al helpen. 😊",
    },
  },
  overprikkeling: {
    neutral: "Het klinkt alsof alles vandaag wat veel is. Je hoeft niet altijd door te blijven gaan.",
    styles: {
      liefdevol: "Voelt alles vandaag wat te veel? Je mag even een stapje terug doen. 💛",
      humor: "Je hoofd staat vandaag op te veel tabbladen tegelijk. Tijd om er een paar te sluiten. 😄",
      spiritueel: "Trek je even terug uit de drukte en kom terug bij jezelf. ✨",
      motiverend: "Even pauzeren is geen zwakte — het geeft je juist weer ruimte. 💪",
      informatief: "Overprikkeling kan ontstaan door te veel prikkels tegelijk — een korte mindfulness-oefening kan helpen om even uit de drukte te stappen.",
      rustig: "Trek je heel even terug uit de drukte. Dat mag. 🌿",
      direct: "Overprikkeld? Neem nu vijf minuten rust.",
      luchtig: "Beetje te veel vandaag? Tijd voor een korte pauze. 😊",
    },
  },
  prikkelbaarheid: {
    neutral: "Je reageert vandaag misschien sneller geïrriteerd dan normaal. Dat mag er zijn.",
    styles: {
      liefdevol: "Voel je je vandaag sneller geïrriteerd? Dat is oké — je hoeft dat niet te verbergen. 💛",
      humor: "Kort lontje vandaag? Zelfs de rustigste mensen hebben zulke dagen. 😉",
      spiritueel: "Merk de irritatie op zonder hem meteen te hoeven wegduwen. ✨",
      motiverend: "Een kort moment voor jezelf kan helpen om weer wat rust te voelen. 💪",
      informatief: "Prikkelbaarheid kan samenhangen met hoe je je op dit moment voelt — een korte pauze kan helpen om te resetten.",
      rustig: "Even een stapje terug doen kan al helpen. 🌿",
      direct: "Prikkelbaar vandaag? Neem even afstand voor je reageert.",
      luchtig: "Iedereen heeft wel eens een kort lontje-dag. Klein pauzemoment? 😊",
    },
  },
  somberheid: {
    neutral: "Een moeilijke dag hoeft geen slechte week te worden. Misschien helpt het om vandaag één klein moment voor jezelf te nemen.",
    styles: {
      liefdevol: "Voelt vandaag wat zwaar? Je hoeft dat niet meteen op te lossen. 💛",
      humor: "Sommige dagen zijn gewoon een pyjamadag-gevoel, ook zonder pyjama. Dat mag. 😉",
      spiritueel: "Laat dit gevoel er zijn, zonder het te hoeven begrijpen of veranderen. ✨",
      motiverend: "Je hoeft vandaag niet te presteren — één klein moment voor jezelf is al genoeg. 💪",
      informatief: "Stemming kan van dag tot dag verschillen — een klein moment van aandacht voor jezelf kan al helpen.",
      rustig: "Het is oké dat vandaag zwaar voelt. Neem het rustig. 🌿",
      direct: "Zware dag? Neem één moment voor jezelf, meer hoeft niet.",
      luchtig: "Minder vrolijke dag? Een klein momentje voor jezelf kan geen kwaad. 😊",
    },
  },
  eenzaamheid: {
    neutral: "Je voelt je vandaag misschien wat alleen. Dat gevoel mag er zijn — soms helpt een klein moment van verbinding met jezelf al.",
    styles: {
      liefdevol: "Voel je je vandaag wat alleen? Je bent in ieder geval hier, bij jezelf. 💛",
      humor: "Alleen voelen is geen contract — het mag ook weer overgaan. 😄",
      spiritueel: "Zoek even verbinding met jezelf, ook als er nu niemand anders is. ✨",
      motiverend: "Een klein moment van aandacht voor jezelf telt ook als verbinding. 💪",
      informatief: "Eenzaamheid kan door verschillende dingen komen — een moment van aandacht voor jezelf kan al iets verzachten.",
      rustig: "Het is oké om je nu alleen te voelen. Neem rustig een moment voor jezelf. 🌿",
      direct: "Voel je je alleen? Neem contact op met iemand, of neem een moment voor jezelf.",
      luchtig: "Alleen-gevoel vandaag? Een klein momentje voor jezelf kan al net iets helpen. 😊",
    },
  },
  piekeren: {
    neutral: "Je gedachten blijven vandaag misschien wat rondgaan. Probeer ze even een moment rustiger te laten worden.",
    styles: {
      liefdevol: "Blijven je gedachten maar rondgaan? Gun ze even een adempauze. 💛",
      humor: "Je hoofd draait vandaag overuren. Tijd om het even in de spaarstand te zetten. 😄",
      spiritueel: "Gedachten zijn als wolken — je hoeft ze niet allemaal te volgen. ✨",
      motiverend: "Je hoeft niet alles op te lossen in je hoofd — één moment van rust helpt al. 💪",
      informatief: "Piekeren kan de kop opsteken als er veel op je bordje ligt — een korte oefening kan helpen om je gedachten wat rustiger te laten worden.",
      rustig: "Laat je gedachten even rustig worden, zonder ze te hoeven oplossen. 🌿",
      direct: "Piekeren vandaag? Doe nu een korte oefening om je hoofd rustiger te maken.",
      luchtig: "Gedachten die maar blijven ronddraaien? Klein momentje om te resetten? 😊",
    },
  },
}

export interface MentalWellbeingSuggestion {
  category: keyof typeof SUGGESTION_COPY
  text: string
  exercise: MindfulExercise
}

function seededIndex(seed: string, length: number): number {
  if (length <= 0) return 0
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % length
}

/**
 * @param symptoms Today's check-in symptoms (may include physical ones too — only the mental ones are used here).
 * @param mood Today's check-in mood rating (1-5), or null if not filled in.
 */
export function pickMentalWellbeingSuggestion({
  symptoms,
  mood,
  seed,
  preferredStyles = [],
}: {
  symptoms: string[]
  mood: number | null
  seed: string
  preferredStyles?: BuddyStyle[]
}): MentalWellbeingSuggestion | null {
  const matchedCategories = new Set<keyof typeof SUGGESTION_COPY>()
  for (const symptom of symptoms) {
    const category = CATEGORY_BY_SYMPTOM[symptom]
    if (category && category in SUGGESTION_COPY) {
      matchedCategories.add(category as keyof typeof SUGGESTION_COPY)
    }
  }
  // Low-mood fallback, only when she didn't already flag something more
  // specific — mood is existing data she's already filled in, so this
  // never asks her anything new.
  if (matchedCategories.size === 0 && mood !== null && mood <= 2) {
    matchedCategories.add("somberheid")
  }

  if (matchedCategories.size === 0) return null

  const categories = Array.from(matchedCategories)
  const category = categories[seededIndex(`${seed}-category`, categories.length)]
  const copy = SUGGESTION_COPY[category]

  const style = pickStyleForToday(`${seed}-style`, preferredStyles)
  const text = (style && copy.styles?.[style]) || copy.neutral

  const relevantExercises = MINDFUL_EXERCISES.filter((e) => e.categories.includes(category))
  const pool = relevantExercises.length ? relevantExercises : MINDFUL_EXERCISES
  const exercise = pool[seededIndex(`${seed}-exercise`, pool.length)]

  return { category, text, exercise }
}

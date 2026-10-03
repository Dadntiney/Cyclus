import type { BuddyChatMessage, BuddyProvider, BuddyReply } from "./types"

const CONCERNING_PATTERNS = [
  /hevige?\s+pijn/i,
  /flauwval/i,
  /bewusteloos/i,
  /veel\s+bloedverlies/i,
  /doorweek\w*\s+(maandverband|tampon)/i,
  /zelfmoord/i,
  /suïcid/i,
  /geen\s+zin\s+meer\s+om\s+te\s+leven/i,
  /mishandel/i,
  /koorts/i,
]

const REFERRAL_REPLY =
  "Wat je beschrijft klinkt als iets wat ik niet voor je kan beoordelen. Ik ben geen arts en kan geen diagnoses stellen. Neem hiervoor contact op met je huisarts of, bij spoed, bel 112. Je klachten serieus laten nakijken is de beste volgende stap."

/** One or more ways to say the same thing (BUD-6): Buddy does not repeat herself word for word. */
type Variants = readonly [string, ...string[]]

function pickSymptomLine(context: string[]): string | null {
  return context.find((line) => line.startsWith("Klachten:")) ?? null
}

function pickCheckinLine(context: string[]): string | null {
  return context.find((line) => line.startsWith("Laatste check-in:")) ?? null
}

function pickCycleLine(context: string[]): string | null {
  return context.find((line) => line.startsWith("Cyclusdag")) ?? null
}

const CLOSING_BY_STYLE: Record<string, string> = {
  liefdevol:
    "Ik ben er voor je. Kijk voor concrete suggesties op Vandaag, of vertel me gerust meer over hoe je je voelt.",
  humor:
    "Voor meer tips: kijk op Vandaag. Of vertel me gewoon meer — ik luister, zonder oordeel (en zonder koffie nodig).",
  spiritueel: "Kijk voor meer op Vandaag, of neem een moment om te voelen wat je nu nodig hebt.",
  motiverend: "Kijk voor concrete suggesties op Vandaag — of vertel me meer, dan denken we samen verder.",
  informatief: "Op Vandaag vind je meer achtergrondinformatie die aansluit bij wat je nu deelt.",
  rustig: "Kijk rustig verder op Vandaag, of vertel me op je gemak meer over hoe je je voelt.",
  direct: "Meer suggesties vind je op Vandaag. Of vertel me gewoon wat er speelt.",
  luchtig: "Voor meer tips: kijk even op Vandaag. Of vertel me gerust meer!",
}

function pickStyle(context: string[]): string | null {
  const styleLine = context.find((line) => line.startsWith("Buddy-stijl"))
  return styleLine?.split(": ")[1]?.split(", ")[0]?.trim() || null
}

function pickClosing(context: string[]): string {
  const firstStyle = pickStyle(context)
  return (firstStyle && CLOSING_BY_STYLE[firstStyle]) || "Kijk voor concrete suggesties op Vandaag, of vertel me meer over hoe je je voelt."
}

/** Short follow-ups — no intro dump, respond to what she just said. */
const FOLLOWUP_BY_THEME: Array<{ test: RegExp; byStyle: Record<string, Variants>; fallback: Variants }> = [
  {
    test: /\b(moe|vermoeid|uitgeput|kapot|geen energie)\b/i,
    byStyle: {
      liefdevol: ["Dat hoor ik. Moe mag er ook zijn — gun jezelf vandaag iets zachters, zonder dat je iets hoeft te presteren."],
      rustig: ["Moe zijn is een signaal om zachter te doen. Even liggen, warm drinken, of alleen dat wat écht moet vandaag."],
      direct: ["Klinkt alsof je lichaam rust vraagt. Plan vandaag lichter in waar dat kan."],
      motiverend: ["Moeheid is geen falen. Kies vandaag één klein ding dat helpt — en laat de rest liggen."],
      luchtig: ["Moe mag. Geen heldendaad vandaag nodig — een halfuur stilliggen telt ook."],
    },
    fallback: [
      "Dat hoor ik. Moe mag er zijn — kies vandaag waar mogelijk voor rust, en kijk op Vandaag voor zachte suggesties.",
      "Vermoeidheid kan veel van je vragen. Misschien helpt het om vandaag wat minder van jezelf te verwachten; op Vandaag staan zachte suggesties.",
      "Dat klinkt vermoeiend. Gun jezelf waar het kan een rustmoment — je hoeft vandaag niet alles te doen.",
    ],
  },
  {
    test: /\b(pijn|zeer|kramp|buikpijn|hoofdpijn)\b/i,
    byStyle: {
      liefdevol: ["Pijn is zwaar. Wees zacht voor jezelf — warmte, rust, en bel je arts als het erger wordt of niet past bij wat je kent."],
      direct: ["Bij pijn: rust en warmte. Wordt het heviger of anders dan anders, check het bij je huisarts."],
      rustig: ["Neem het rustig. Warmte en weinig prikkels kunnen helpen — en twijfel je, bel je arts."],
    },
    fallback: [
      "Pijn verdient aandacht. Neem rust waar je kunt. Wordt het heviger of voelt het anders: bel je huisarts.",
      "Wat vervelend dat je pijn hebt. Warmte en rust kunnen voor sommige vrouwen helpen. Is het heviger of anders dan je gewend bent, neem dan contact op met je huisarts.",
      "Pijn kan veel van je vragen. Neem het rustig aan waar je kunt — en twijfel je, of wordt het erger, bel dan je huisarts.",
    ],
  },
  {
    test: /\b(stress|gespannen|overprikkeld|angst|bang|pieker)\b/i,
    byStyle: {
      liefdevol: ["Dat klinkt intens. Adem even mee — je hoeft dit niet alleen te dragen. Op Vandaag staan korte oefeningen als je dat fijn vindt."],
      rustig: ["Even stilte mag. Een korte ademoefening of een korte wandeling kan al iets verzachten."],
      spiritueel: ["Merk het op zonder oordeel. Je mag dit gevoel laten zijn — en daarna kijken wat je lichaam nodig heeft."],
    },
    fallback: [
      "Dat klinkt spannend. Gun jezelf een klein moment stilte. Op Vandaag vind je iets rustigs als je dat wilt.",
      "Dat klinkt als veel tegelijk. Een paar rustige ademhalingen kunnen soms al wat ruimte geven.",
      "Ik hoor dat het veel is. Je hoeft het niet in één keer op te lossen — een korte pauze kan al helpen.",
    ],
  },
  {
    test: /\b(somber|verdriet|alleen|eenzaam|down|niet oké|niet oke)\b/i,
    byStyle: {
      liefdevol: ["Fijn dat je het zegt. Je hoeft niet vrolijk te doen — ik ben er. Wil je iets meer vertellen over wat er speelt?"],
      rustig: ["Dat mag er zijn. Je hoeft het niet op te lossen in één bericht — vertel gerust wat er speelt, of kijk op Vandaag."],
    },
    fallback: [
      "Dank je dat je het deelt. Je mag hier zacht voor jezelf zijn. Vertel gerust meer, of kijk op Vandaag wat past.",
      "Fijn dat je het me vertelt. Je hoeft je niet anders voor te doen dan je je voelt. Wil je vertellen wat er speelt?",
      "Dat klinkt zwaar. Je staat er niet alleen voor. Blijft dit gevoel lang hangen, dan kan het fijn zijn om erover te praten met je huisarts of iemand die je vertrouwt.",
    ],
  },
  {
    test: /^(ok|oke|okay|prima|goed|ja|nee|hmm+|mh+)\.?$/i,
    byStyle: {
      liefdevol: ["Oké. Ik blijf in de buurt — zeg het als je iets wilt delen."],
      direct: ["Oké. Ik hoor je als je meer wilt zeggen."],
      luchtig: ["Oké! Ik ben er als je verder wilt praten."],
    },
    fallback: [
      "Oké. Ik ben er als je meer wilt delen.",
      "Helder. Laat het gerust weten als er nog iets is.",
      "Oké! Je kunt altijd later verder praten.",
    ],
  },
  {
    test: /^(hoi|hallo|hey|hai|goedemorgen|goedemiddag|goedenavond)\b/i,
    byStyle: {
      liefdevol: ["Hoi — fijn dat je er bent. Hoe gaat het met je vandaag?"],
      luchtig: ["Hoi! Leuk dat je er bent. Hoe is het vandaag?"],
      direct: ["Hoi. Hoe gaat het vandaag?"],
    },
    fallback: [
      "Hoi — fijn dat je er bent. Hoe gaat het vandaag met je?",
      "Hallo! Fijn dat je er bent. Hoe voel je je vandaag?",
      "Hoi! Hoe is je dag tot nu toe?",
    ],
  },
]

/**
 * Soft default when no theme matches: acknowledge without dumping profile
 * context again. Three ways per style, so a generic reply rarely repeats.
 */
export const GENERIC_REPLY_BY_STYLE: Record<string, Variants> = {
  liefdevol: [
    "Ik hoor je. Vertel gerust wat meer — of houd het kort, dat mag ook.",
    "Dank je dat je dit met me deelt. Neem gerust de ruimte, ik lees met aandacht mee.",
    "Fijn dat je het zegt. Hoe voel je je er zelf bij?",
  ],
  humor: [
    "Ik ben een en al oor — nou ja, bij wijze van spreken. Vertel gerust meer.",
    "Genoteerd, zonder oordeel en zonder rode pen. Wat speelt er nog meer?",
    "Dank je! Ik heb alle tijd en verder geen afspraken vandaag. Zeg het maar.",
  ],
  spiritueel: [
    "Dank je voor het delen. Neem even een moment om te voelen wat je nu nodig hebt.",
    "Wat je voelt, mag er zijn. Wat vraagt je lichaam op dit moment van je?",
    "Ik hoor je. Adem even rustig in en uit, en vertel dan gerust verder.",
  ],
  motiverend: [
    "Goed dat je het zegt. Wat zou één klein stapje vandaag kunnen zijn?",
    "Mooi dat je hier even bij stilstaat. Wat zou je vandaag een beetje verder helpen?",
    "Dank je! Kleine stappen tellen ook. Wat voelt nu haalbaar?",
  ],
  informatief: [
    "Dank je. Vertel gerust wat meer, dan kan ik gerichter meedenken.",
    "Goed om te weten. Merk je dit vaker op een bepaald moment in je cyclus? Dat kan helpen om het beter te begrijpen.",
    "Helder. Op Vandaag lees je wat er in deze fase van je cyclus kan spelen — of vertel me gerust meer.",
  ],
  rustig: [
    "Dank je. Neem de tijd; zeg wat je kwijt wilt, of kijk rustig op Vandaag.",
    "Er is geen haast. Vertel gerust verder wanneer het jou uitkomt.",
    "Ik hoor je. Neem gerust even rust; ik ben er als je verder wilt praten.",
  ],
  direct: [
    "Begrepen. Wat speelt er het meest voor jou nu?",
    "Duidelijk. Waar wil je het vandaag over hebben?",
    "Oké. Wat is voor jou nu het belangrijkste?",
  ],
  luchtig: [
    "Thanks dat je het deelt. Wat zou nu het fijnst voelen?",
    "Leuk dat je het vertelt! Wat houdt je nog meer bezig?",
    "Dank je! Zin om er nog iets meer over te vertellen?",
  ],
}

/** The generic reply without a style preference. */
export const GENERIC_REPLY: Variants = [
  "Ik hoor je. Vertel gerust wat meer over hoe je je voelt — of kijk op Vandaag wat bij je past.",
  "Dank je dat je het deelt. Wat speelt er op dit moment het meest voor je?",
  "Fijn dat je het vertelt. Wil je er iets meer over kwijt? Ik denk graag met je mee.",
]

/** Opens the first reply of a conversation: what Buddy builds on, no roadmap. */
export const FIRST_REPLY_OPENER =
  "Dank je voor je bericht. Ik denk met je mee op basis van wat je in GoFiev deelt."

/**
 * Small stable string hash → index (FNV-1a, 32 bit). Spreads short
 * messages evenly over a handful of variants.
 */
function hashIndex(seed: string, length: number): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) % length
}

/** "Moe." and "  moe" are the same message for picking a variant. */
function normalizeSeed(message: string): string {
  return message.trim().toLowerCase().replace(/\s+/g, " ")
}

/**
 * Picks one variant, deterministically from her message (no randomness, no
 * lookups), and never the reply Buddy gave last time when another variant
 * exists. Pure.
 */
export function pickVariant(variants: readonly string[], seed: string, previousReply: string | null = null): string {
  if (variants.length === 0) return ""
  let index = hashIndex(normalizeSeed(seed), variants.length)
  if (previousReply !== null && variants.length > 1 && variants[index] === previousReply) {
    index = (index + 1) % variants.length
  }
  return variants[index]
}

/**
 * Her style's wording when she chose one; if that single line is exactly
 * what Buddy just said, the neutral lines for the same theme instead.
 */
function pickReply(styled: Variants | undefined, neutral: Variants, seed: string, previousReply: string | null): string {
  const choice = pickVariant(styled ?? neutral, seed, previousReply)
  if (styled && choice === previousReply) return pickVariant(neutral, seed, previousReply)
  return choice
}

function followUpForMessage(userMessage: string, context: string[], previousReply: string | null): string {
  const style = pickStyle(context)
  const trimmed = userMessage.trim()

  for (const theme of FOLLOWUP_BY_THEME) {
    if (theme.test.test(trimmed)) {
      return pickReply(style ? theme.byStyle[style] : undefined, theme.fallback, trimmed, previousReply)
    }
  }

  return pickReply(style ? GENERIC_REPLY_BY_STYLE[style] : undefined, GENERIC_REPLY, trimmed, previousReply)
}

function firstReply(contextLines: string[]): string {
  const cycleLine = pickCycleLine(contextLines)
  const checkinLine = pickCheckinLine(contextLines)
  const symptomLine = pickSymptomLine(contextLines)

  const parts: string[] = []
  parts.push(FIRST_REPLY_OPENER)

  if (checkinLine) {
    parts.push(`Uit je laatste check-in: ${checkinLine.replace("Laatste check-in: ", "")}.`)
  }
  if (symptomLine) {
    parts.push(
      `Je gaf klachten aan: ${symptomLine.replace("Klachten: ", "")}. Neem het rustig aan vandaag.`,
    )
  }
  if (cycleLine) {
    parts.push(`${cycleLine}.`)
  }

  parts.push(pickClosing(contextLines))
  return parts.join(" ")
}

/**
 * Templated, non-AI fallback. First reply in a conversation may use
 * check-in/cycle context. Later replies stay short and respond to her
 * latest message — never re-dump the same intro, and never the previous
 * reply word for word when there is another way to say it.
 */
export class RuleBasedBuddyProvider implements BuddyProvider {
  async generateReply(
    history: BuddyChatMessage[],
    userMessage: string,
    contextLines: string[],
  ): Promise<BuddyReply> {
    if (CONCERNING_PATTERNS.some((pattern) => pattern.test(userMessage))) {
      return { message: REFERRAL_REPLY, aiGenerated: false }
    }

    // History (oldest first) holds the conversation before her new message.
    const assistantReplies = history.filter((m) => m.role === "assistant")
    const isFirstReply = assistantReplies.length === 0
    const previousReply = assistantReplies.at(-1)?.message ?? null

    const message = isFirstReply
      ? firstReply(contextLines)
      : followUpForMessage(userMessage, contextLines, previousReply)

    return { message, aiGenerated: false }
  }
}

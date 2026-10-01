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
const FOLLOWUP_BY_THEME: Array<{ test: RegExp; byStyle: Record<string, string>; fallback: string }> = [
  {
    test: /\b(moe|vermoeid|uitgeput|kapot|geen energie)\b/i,
    byStyle: {
      liefdevol: "Dat hoor ik. Moe mag er ook zijn — gun jezelf vandaag iets zachters, zonder dat je iets hoeft te presteren.",
      rustig: "Moe zijn is een signaal om zachter te doen. Even liggen, warm drinken, of alleen dat wat écht moet vandaag.",
      direct: "Klinkt alsof je lichaam rust vraagt. Plan vandaag lichter in waar dat kan.",
      motiverend: "Moeheid is geen falen. Kies vandaag één klein ding dat helpt — en laat de rest liggen.",
      luchtig: "Moe mag. Geen heldendaad vandaag nodig — een halfuur stilliggen telt ook.",
    },
    fallback: "Dat hoor ik. Moe mag er zijn — kies vandaag waar mogelijk voor rust, en kijk op Vandaag voor zachte suggesties.",
  },
  {
    test: /\b(pijn|zeer|kramp|buikpijn|hoofdpijn)\b/i,
    byStyle: {
      liefdevol: "Pijn is zwaar. Wees zacht voor jezelf — warmte, rust, en bel je arts als het erger wordt of niet past bij wat je kent.",
      direct: "Bij pijn: rust en warmte. Wordt het heviger of anders dan anders, check het bij je huisarts.",
      rustig: "Neem het rustig. Warmte en weinig prikkels kunnen helpen — en twijfel je, bel je arts.",
    },
    fallback: "Pijn verdient aandacht. Neem rust waar je kunt. Wordt het heviger of voelt het anders: bel je huisarts.",
  },
  {
    test: /\b(stress|gespannen|overprikkeld|angst|bang|pieker)\b/i,
    byStyle: {
      liefdevol: "Dat klinkt intens. Adem even mee — je hoeft dit niet alleen te dragen. Op Vandaag staan korte oefeningen als je dat fijn vindt.",
      rustig: "Even stilte mag. Een korte ademoefening of een korte wandeling kan al iets verzachten.",
      spiritueel: "Merk het op zonder oordeel. Je mag dit gevoel laten zijn — en daarna kijken wat je lichaam nodig heeft.",
    },
    fallback: "Dat klinkt spannend. Gun jezelf een klein moment stilte. Op Vandaag vind je iets rustigs als je dat wilt.",
  },
  {
    test: /\b(somber|verdriet|alleen|eenzaam|down|niet oké|niet oke)\b/i,
    byStyle: {
      liefdevol: "Fijn dat je het zegt. Je hoeft niet vrolijk te doen — ik ben er. Wil je iets meer vertellen over wat er speelt?",
      rustig: "Dat mag er zijn. Je hoeft het niet op te lossen in één bericht — vertel gerust wat er speelt, of kijk op Vandaag.",
    },
    fallback: "Dank je dat je het deelt. Je mag hier zacht voor jezelf zijn. Vertel gerust meer, of kijk op Vandaag wat past.",
  },
  {
    test: /^(ok|oke|okay|prima|goed|ja|nee|hmm+|mh+)\.?$/i,
    byStyle: {
      liefdevol: "Oké. Ik blijf in de buurt — zeg het als je iets wilt delen.",
      direct: "Oké. Ik hoor je als je meer wilt zeggen.",
      luchtig: "Oké! Ik ben er als je verder wilt praten.",
    },
    fallback: "Oké. Ik ben er als je meer wilt delen.",
  },
  {
    test: /^(hoi|hallo|hey|hai|goedemorgen|goedemiddag|goedenavond)\b/i,
    byStyle: {
      liefdevol: "Hoi — fijn dat je er bent. Hoe gaat het met je vandaag?",
      luchtig: "Hoi! Leuk dat je er bent. Hoe is het vandaag?",
      direct: "Hoi. Hoe gaat het vandaag?",
    },
    fallback: "Hoi — fijn dat je er bent. Hoe gaat het vandaag met je?",
  },
]

function followUpForMessage(userMessage: string, context: string[]): string {
  const style = pickStyle(context)
  const trimmed = userMessage.trim()

  for (const theme of FOLLOWUP_BY_THEME) {
    if (theme.test.test(trimmed)) {
      if (style && theme.byStyle[style]) return theme.byStyle[style]
      return theme.fallback
    }
  }

  // Soft default: acknowledge without dumping profile context again.
  const defaults: Record<string, string> = {
    liefdevol: "Ik hoor je. Vertel gerust wat meer — of houd het kort, dat mag ook.",
    rustig: "Dank je. Neem de tijd; zeg wat je kwijt wilt, of kijk rustig op Vandaag.",
    direct: "Begrepen. Wat speelt er het meest voor jou nu?",
    luchtig: "Thanks dat je het deelt. Wat zou nu het fijnst voelen?",
    motiverend: "Goed dat je het zegt. Wat zou één klein stapje vandaag kunnen zijn?",
  }
  if (style && defaults[style]) return defaults[style]
  return "Ik hoor je. Vertel gerust wat meer over hoe je je voelt — of kijk op Vandaag wat bij je past."
}

function firstReply(contextLines: string[]): string {
  const cycleLine = pickCycleLine(contextLines)
  const checkinLine = pickCheckinLine(contextLines)
  const symptomLine = pickSymptomLine(contextLines)

  const parts: string[] = []
  parts.push(
    "Dank je voor je bericht. Ik ben nog geen volwaardige AI-gesprekspartner — die koppeling volgt later — maar ik kan je wel helpen op basis van wat je met GoFiev hebt gedeeld.",
  )

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
 * Templated, non-AI fallback. First reply in a conversation may introduce
 * the limitation + use check-in/cycle context. Later replies stay short and
 * respond to her latest message — never re-dump the same intro.
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

    // History already includes the user message we just saved.
    const priorAssistantReplies = history.filter((m) => m.role === "assistant").length
    const isFirstReply = priorAssistantReplies === 0

    const message = isFirstReply
      ? firstReply(contextLines)
      : followUpForMessage(userMessage, contextLines)

    return { message, aiGenerated: false }
  }
}

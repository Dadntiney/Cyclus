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

/**
 * A templated, non-AI fallback. It uses real profile/check-in context to
 * sound relevant, but it never claims to understand free-form language —
 * only Anthropic's API (once BUDDY_AI_API_KEY is configured) provides
 * genuine conversational replies. We're upfront about that in the copy
 * so we never pass a scripted response off as an AI one.
 */
export class RuleBasedBuddyProvider implements BuddyProvider {
  async generateReply(
    _history: BuddyChatMessage[],
    userMessage: string,
    contextLines: string[],
  ): Promise<BuddyReply> {
    if (CONCERNING_PATTERNS.some((pattern) => pattern.test(userMessage))) {
      return { message: REFERRAL_REPLY, aiGenerated: false }
    }

    const cycleLine = pickCycleLine(contextLines)
    const checkinLine = pickCheckinLine(contextLines)
    const symptomLine = pickSymptomLine(contextLines)

    const parts: string[] = []
    parts.push(
      "Dank je voor je bericht. Ik ben nog geen volwaardige AI-gesprekspartner — die koppeling volgt later — maar ik kan je wel helpen op basis van wat je met Cyclus hebt gedeeld.",
    )

    if (checkinLine) {
      parts.push(`Uit je laatste check-in: ${checkinLine.replace("Laatste check-in: ", "")}.`)
    }
    if (symptomLine) {
      parts.push(`Je gaf klachten aan: ${symptomLine.replace("Klachten: ", "")}. Neem het rustig aan vandaag.`)
    }
    if (cycleLine) {
      parts.push(`${cycleLine}.`)
    }

    parts.push(
      "Kijk voor concrete suggesties op Vandaag, of vertel me meer over hoe je je voelt.",
    )

    return { message: parts.join(" "), aiGenerated: false }
  }
}

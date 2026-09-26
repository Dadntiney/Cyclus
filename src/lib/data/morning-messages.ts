import type { CyclePhase } from "@/lib/cycle/estimate"
import type { BuddyStyle } from "@/lib/buddy/styles"
import { pickStyleForToday } from "@/lib/buddy/styles"
import { getDailyBuddyQuote } from "@/lib/data/buddy-quotes"
import { AFFIRMATIONS } from "@/lib/data/affirmations"
import type { MorningReminderContentType } from "@/lib/constants"

/**
 * Content for the optional Goedemorgen-melding. "Quote" and "affirmation"
 * deliberately reuse the existing buddy-quotes/affirmations pools rather
 * than duplicating a content library — same warm, hedged voice she already
 * knows from elsewhere in the app. Only "reminder" (the default) and
 * "buddy" get their own small pools here, since those two are specific to
 * a morning greeting.
 */

interface MorningMessage {
  text: string
  /** Phase-tagged variants are mixed in occasionally, never every day. */
  phases?: CyclePhase[]
  styles?: Partial<Record<BuddyStyle, string>>
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

const REMINDER_MESSAGES: MorningMessage[] = [
  {
    text: "Tijd voor je check-in. Hoe voelt je lichaam vandaag?",
    styles: {
      liefdevol: "Een nieuwe dag hoeft niet perfect te beginnen. Luister vandaag vooral naar wat jij nodig hebt.",
      motiverend: "Nieuwe dag, nieuwe kans om goed voor jezelf te zorgen. Eén kleine stap is genoeg.",
      rustig: "Neem rustig de tijd om even te voelen hoe je vandaag wakker wordt.",
      humor: "Goedemorgen! Je koffie kan wachten, je check-in duurt maar tien seconden. 😉",
      spiritueel: "Een moment van aandacht voordat de dag begint: hoe voelt je lichaam vandaag?",
      informatief: "Je dagelijkse check-in staat klaar — zo bouw je een duidelijker beeld van je patronen op.",
      direct: "Goedemorgen. Check-in tijd.",
      luchtig: "Goedemorgen! Tijd voor je check-in. 😊",
    },
  },
  { text: "Een nieuwe dag. Hoe wil jij hem beginnen?" },
  { text: "Neem even een moment: hoe voel je je vandaag?" },
  { text: "Even inchecken bij jezelf — hoe gaat het vandaag?" },
  { text: "Wat heb jij vandaag nodig? Vul je check-in in om erachter te komen." },
  {
    text: "Misschien is dit vandaag een mooi moment om iets rustiger aan te doen. Luister vooral naar wat jouw lichaam aangeeft.",
    phases: ["menstruatie"],
  },
  {
    text: "Je energie bouwt zich in deze fase vaak wat op. Benieuwd hoe jij je vandaag voelt?",
    phases: ["folliculair"],
  },
  {
    text: "Voor veel vrouwen is dit een fase met wat meer energie. Hoe voelt dat bij jou vandaag?",
    phases: ["ovulatie"],
  },
  {
    text: "Je lichaam bouwt in deze fase vaak rustig toe naar rust. Sommige vrouwen merken dat hun stemming in bepaalde fases kan veranderen — kijk vooral naar wat jij bij jezelf herkent.",
    phases: ["luteaal"],
  },
]

const BUDDY_MESSAGES: MorningMessage[] = [
  {
    text: "Goedemorgen. Fijn dat je er weer bent.",
    styles: {
      liefdevol: "Goedemorgen, lieverd. Fijn dat je er weer bent — vandaag mag precies worden zoals jij het nodig hebt.",
      humor: "Goedemorgen! Officieel: de dag is begonnen. Onofficieel: koffie eerst.",
      spiritueel: "Goedemorgen. Een nieuwe dag, een nieuw moment om bewust aanwezig te zijn.",
      motiverend: "Goedemorgen! Een nieuwe dag vol kleine kansen om goed voor jezelf te zorgen.",
      informatief: "Goedemorgen. Wist je dat de eerste minuten van je dag vaak de toon zetten voor de rest?",
      rustig: "Goedemorgen. Neem rustig de tijd om wakker te worden, er is geen haast.",
      direct: "Goedemorgen. Nieuwe dag, nieuwe kansen.",
      luchtig: "Goedemorgen! Klaar voor vandaag? 😊",
    },
  },
  {
    text: "Goedemorgen. Even een momentje voor jezelf voordat de dag begint.",
    styles: {
      liefdevol: "Goedemorgen. Gun jezelf een klein momentje voordat de drukte begint. 💛",
      humor: "Goedemorgen! Je bed mist je nu al, maar de dag wacht niet. 😄",
      spiritueel: "Goedemorgen. Adem eens rustig in voordat je de dag instapt.",
      motiverend: "Goedemorgen! Jij bepaalt hoe deze dag voelt — begin sterk.",
      informatief: "Goedemorgen. Een rustig ochtendmoment kan bijdragen aan hoe je de rest van de dag ervaart.",
      rustig: "Goedemorgen. Even een moment voor jezelf voordat alles begint. 🌿",
      direct: "Goedemorgen. Neem een moment, dan ga je verder.",
      luchtig: "Goedemorgen! Eerst even bijkomen, dan de dag in. 😊",
    },
  },
  {
    text: "Goedemorgen. Vandaag mag het gewoon een gewone dag zijn.",
    styles: {
      liefdevol: "Goedemorgen. Je hoeft vandaag niets bijzonders te presteren — gewoon jezelf zijn is genoeg. 💛",
      humor: "Goedemorgen! Geen druk vandaag — tenzij die druk 'nog vijf minuten' heet. 😉",
      spiritueel: "Goedemorgen. Elke dag, ook een gewone, is de moeite van het aanwezig zijn waard.",
      motiverend: "Goedemorgen! Ook een gewone dag is een kans om iets goeds voor jezelf te doen.",
      informatief: "Goedemorgen. Niet elke dag hoeft bijzonder te zijn om waardevol te zijn.",
      rustig: "Goedemorgen. Een gewone, rustige dag mag er ook gewoon zijn.",
      direct: "Goedemorgen. Gewone dag. Ga ervoor.",
      luchtig: "Goedemorgen! Lekker gewoontjes vandaag? Ook prima. 😊",
    },
  },
]

export interface MorningMessageResult {
  title: string
  body: string
}

export function getMorningMessage({
  contentType,
  seed,
  phase,
  preferredStyles = [],
}: {
  contentType: MorningReminderContentType
  seed: string
  phase: CyclePhase | null
  preferredStyles?: BuddyStyle[]
}): MorningMessageResult {
  const title = "☀️ Goedemorgen!"

  if (contentType === "quote") {
    const quote = getDailyBuddyQuote(`${seed}-morning-quote`, phase, preferredStyles)
    return { title, body: `${quote.emoji} ${quote.text}` }
  }

  if (contentType === "affirmation") {
    const affirmation = AFFIRMATIONS[seededIndex(`${seed}-morning-affirmation`, AFFIRMATIONS.length)]
    return { title, body: `"${affirmation.text}"` }
  }

  if (contentType === "buddy") {
    const message = BUDDY_MESSAGES[seededIndex(`${seed}-morning-buddy`, BUDDY_MESSAGES.length)]
    const style = pickStyleForToday(`${seed}-morning-buddy-style`, preferredStyles)
    const body = (style && message.styles?.[style]) || message.text
    return { title, body }
  }

  // "reminder" (default)
  const phaseMatches = phase ? REMINDER_MESSAGES.filter((m) => m.phases?.includes(phase)) : []
  const usePhaseMessage = phaseMatches.length > 0 && seededIndex(`${seed}-morning-phase-gate`, 3) === 0
  const pool = usePhaseMessage ? phaseMatches : REMINDER_MESSAGES.filter((m) => !m.phases)

  const style = pickStyleForToday(`${seed}-morning-style`, preferredStyles)
  if (style) {
    const styledPool = pool.filter((m) => m.styles?.[style])
    if (styledPool.length > 0) {
      const message = styledPool[seededIndex(seed, styledPool.length)]
      return { title, body: message.styles![style]! }
    }
  }

  const message = pool[seededIndex(seed, pool.length)]
  return { title, body: message.text }
}

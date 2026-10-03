/**
 * Fixed Buddy texts shared by the conversation and the "Over Buddy" sheet.
 */

/** The first line of every conversation, and repeated in "Over Buddy". */
export const BUDDY_DISCLAIMER =
  "Geen diagnoses, wel een luisterend oor. Bij ernstige of nieuwe klachten: neem contact op met je huisarts."

/** First run: Buddy opens the conversation (not saved, nothing is sent). */
export const BUDDY_GREETING =
  "Hoi, ik ben je Buddy. Vertel gerust hoe je je voelt, of kies een vraag hieronder."

/** Starting points on a first run. They only fill the composer; she decides to send. */
export const STARTER_QUESTIONS = [
  "Waarom slaap ik slechter rond mijn menstruatie?",
  "Wat kan ik doen als ik me deze week moe voel?",
  "Hoe weet ik of mijn klachten bij de overgang horen?",
] as const

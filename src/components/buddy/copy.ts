/**
 * Fixed Buddy texts shared by the conversation and the "Over Buddy" sheet.
 */

/** The first line of every conversation, and repeated in "Over Buddy". */
export const BUDDY_DISCLAIMER =
  "Buddy is geen arts. Bij ernstige of nieuwe klachten kan het verstandig zijn om contact op te nemen met je huisarts."

/** First run: Buddy opens the conversation (not saved, nothing is sent). */
export const BUDDY_GREETING =
  "Hoi, ik ben je Buddy. Vertel gerust hoe je je voelt, of kies een vraag hieronder."

/**
 * Starting points on a first run. They only fill the composer; she decides
 * to send. Short enough for one line on a phone.
 */
export const STARTER_QUESTIONS = [
  "Slaap ik slechter door mijn cyclus?",
  "Wat helpt als ik me moe voel?",
  "Merk ik al iets van de overgang?",
] as const

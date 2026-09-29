import { STANDING, type FigurePose } from "@/lib/training/figure-pose"

export type InstructionCue = {
  /** Seconds from loop start when this cue becomes active (visual caption). */
  at: number
  text: string
}

export type ExerciseInstruction = {
  /** Stable id — one instruction per unique movement. */
  id: string
  title: string
  category: "krachttraining" | "pilates" | "yoga" | "mobiliteit"
  /** Full Dutch voice-over, spoken once when the user taps play. */
  narration: string
  /** Loop duration in ms for the pose animation. */
  loopMs: number
  /** Ordered poses; animation walks 0→1→…→0. */
  poses: FigurePose[]
  /** Short captions synced to the visual loop. */
  cues: InstructionCue[]
}

/**
 * Name aliases → instruction id. Exact lowercase match after normalizing
 * punctuation. Prefer explicit aliases over fuzzy substring matching so
 * "Side plank" never gets the front-plank demo.
 */
const ALIASES: Record<string, string> = {
  squats: "squat",
  squat: "squat",
  "push-ups": "push-up",
  "push ups": "push-up",
  "push-up": "push-up",
  pushups: "push-up",
  "rows met weerstandsband of gewicht": "row",
  rows: "row",
  row: "row",
  "glute bridge": "glute-bridge",
  plank: "plank",
  "side plank": "side-plank",
  "side plank per kant": "side-plank",
  "the hundred": "the-hundred",
  "roll-up": "roll-up",
  rollup: "roll-up",
  "leg circles": "leg-circles",
  "kat-koe": "kat-koe",
  "neerwaartse hond": "neerwaartse-hond",
  kindhouding: "kindhouding",
  "torsie liggend": "torsie-liggend",
  heupopeners: "heupopeners",
  schoudercirkels: "schoudercirkels",
  enkelmobiliteit: "enkelmobiliteit",
  "nekrek zijwaarts": "nekrek-zijwaarts",
  borstopener: "borstopener",
  buikademhaling: "buikademhaling",
}

function normalizeName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ")
}

const squatDown: FigurePose = {
  ...STANDING,
  rootY: 88,
  torso: 12,
  lHip: 55,
  rHip: 55,
  lKnee: 95,
  rKnee: 95,
  lShoulder: 40,
  rShoulder: -40,
  lElbow: 20,
  rElbow: -20,
}

const pushUpHigh: FigurePose = {
  rootX: 100,
  rootY: 55,
  bodyRotation: 90,
  torso: 0,
  lShoulder: 170,
  rShoulder: 170,
  lElbow: 15,
  rElbow: 15,
  lHip: 0,
  rHip: 0,
  lKnee: 0,
  rKnee: 0,
}

const pushUpLow: FigurePose = {
  ...pushUpHigh,
  rootY: 70,
  lElbow: 80,
  rElbow: 80,
}

const rowPull: FigurePose = {
  ...STANDING,
  torso: 25,
  rootY: 78,
  lHip: 15,
  rHip: 5,
  lShoulder: -70,
  rShoulder: -70,
  lElbow: -100,
  rElbow: -100,
}

const rowExtend: FigurePose = {
  ...STANDING,
  torso: 25,
  rootY: 78,
  lHip: 15,
  rHip: 5,
  lShoulder: -20,
  rShoulder: -20,
  lElbow: -30,
  rElbow: -30,
}

const bridgeUp: FigurePose = {
  rootX: 100,
  rootY: 100,
  bodyRotation: -90,
  torso: -20,
  lShoulder: 160,
  rShoulder: 160,
  lElbow: 0,
  rElbow: 0,
  lHip: -35,
  rHip: -35,
  lKnee: 70,
  rKnee: 70,
}

const bridgeDown: FigurePose = {
  ...bridgeUp,
  torso: 5,
  lHip: -5,
  rHip: -5,
}

const plankPose: FigurePose = {
  rootX: 100,
  rootY: 60,
  bodyRotation: 90,
  torso: 0,
  lShoulder: 175,
  rShoulder: 175,
  lElbow: 90,
  rElbow: 90,
  lHip: 0,
  rHip: 0,
  lKnee: 0,
  rKnee: 0,
}

const sidePlank: FigurePose = {
  rootX: 100,
  rootY: 95,
  bodyRotation: 90,
  torso: 0,
  lShoulder: 0,
  rShoulder: 160,
  lElbow: 0,
  rElbow: 90,
  lHip: 5,
  rHip: 5,
  lKnee: 0,
  rKnee: 0,
}

const hundredPose: FigurePose = {
  rootX: 100,
  rootY: 110,
  bodyRotation: -90,
  torso: 20,
  lShoulder: 40,
  rShoulder: -40,
  lElbow: 10,
  rElbow: -10,
  lHip: -35,
  rHip: -35,
  lKnee: 5,
  rKnee: 5,
}

const hundredPump: FigurePose = {
  ...hundredPose,
  lShoulder: 55,
  rShoulder: -55,
}

const rollUpMid: FigurePose = {
  rootX: 100,
  rootY: 130,
  bodyRotation: 0,
  torso: 45,
  lShoulder: 70,
  rShoulder: -70,
  lElbow: 20,
  rElbow: -20,
  lHip: 20,
  rHip: 20,
  lKnee: 10,
  rKnee: 10,
}

const rollUpSit: FigurePose = {
  rootX: 100,
  rootY: 120,
  bodyRotation: 0,
  torso: 10,
  lShoulder: 90,
  rShoulder: -90,
  lElbow: 10,
  rElbow: -10,
  lHip: 70,
  rHip: 70,
  lKnee: 20,
  rKnee: 20,
}

const lyingFlat: FigurePose = {
  rootX: 100,
  rootY: 110,
  bodyRotation: -90,
  torso: 0,
  lShoulder: 0,
  rShoulder: 0,
  lElbow: 0,
  rElbow: 0,
  lHip: 0,
  rHip: 0,
  lKnee: 0,
  rKnee: 0,
}

const legCircle: FigurePose = {
  ...lyingFlat,
  rootY: 110,
  rHip: -70,
  rKnee: 10,
  lHip: 10,
}

const legCircle2: FigurePose = {
  ...lyingFlat,
  rootY: 110,
  rHip: -40,
  rKnee: 10,
  lHip: 10,
  rShoulder: 20,
}

const catPose: FigurePose = {
  rootX: 100,
  rootY: 120,
  bodyRotation: 0,
  torso: 25,
  lShoulder: 150,
  rShoulder: 150,
  lElbow: 20,
  rElbow: 20,
  lHip: -30,
  rHip: -30,
  lKnee: 80,
  rKnee: 80,
}

const cowPose: FigurePose = {
  ...catPose,
  torso: -20,
  rootY: 115,
}

const downDog: FigurePose = {
  rootX: 100,
  rootY: 100,
  bodyRotation: 0,
  torso: 45,
  lShoulder: 160,
  rShoulder: 160,
  lElbow: 10,
  rElbow: 10,
  lHip: 50,
  rHip: 50,
  lKnee: 10,
  rKnee: 10,
}

const childPose: FigurePose = {
  rootX: 100,
  rootY: 140,
  bodyRotation: 0,
  torso: 50,
  lShoulder: 160,
  rShoulder: 160,
  lElbow: 10,
  rElbow: 10,
  lHip: 70,
  rHip: 70,
  lKnee: 110,
  rKnee: 110,
}

const twistPose: FigurePose = {
  rootX: 100,
  rootY: 110,
  bodyRotation: -90,
  torso: 15,
  lShoulder: 40,
  rShoulder: -20,
  lElbow: 10,
  rElbow: 10,
  lHip: 40,
  rHip: -10,
  lKnee: 70,
  rKnee: 70,
}

const hipOpen: FigurePose = {
  ...STANDING,
  lHip: 45,
  rHip: -10,
  lKnee: 20,
  rKnee: 5,
}

const shoulderCircles: FigurePose = {
  ...STANDING,
  lShoulder: -100,
  rShoulder: 100,
  lElbow: -20,
  rElbow: 20,
}

const shoulderCircles2: FigurePose = {
  ...STANDING,
  lShoulder: 40,
  rShoulder: -40,
  lElbow: 30,
  rElbow: -30,
}

const anklePose: FigurePose = {
  ...STANDING,
  rootY: 78,
  lHip: 20,
  lKnee: 40,
  rHip: -5,
}

const neckSide: FigurePose = {
  ...STANDING,
  torso: 12,
  lShoulder: 20,
  rShoulder: -5,
}

const chestOpen: FigurePose = {
  ...STANDING,
  lShoulder: -140,
  rShoulder: 140,
  lElbow: -20,
  rElbow: 20,
  torso: -8,
}

const breathPose: FigurePose = {
  ...STANDING,
  lShoulder: 50,
  rShoulder: -50,
  lElbow: 40,
  rElbow: -40,
}

export const EXERCISE_INSTRUCTIONS: Record<string, ExerciseInstruction> = {
  squat: {
    id: "squat",
    title: "Squats",
    category: "krachttraining",
    narration:
      "Sta met je voeten ongeveer heupbreed. Adem in, zak rustig door je knieën alsof je gaat zitten. Houd je borst open en je knieën in lijn met je tenen. Duw door je hielen weer omhoog.",
    loopMs: 2800,
    poses: [STANDING, squatDown, STANDING],
    cues: [
      { at: 0, text: "Voeten heupbreed, borst open" },
      { at: 0.9, text: "Zak alsof je gaat zitten" },
      { at: 1.9, text: "Duw door je hielen omhoog" },
    ],
  },
  "push-up": {
    id: "push-up",
    title: "Push-ups",
    category: "krachttraining",
    narration:
      "Kom in een rechte plank op handen en knieën of tenen. Laat je borst rustig richting de mat zakken, ellebogen dicht bij je lichaam. Duw krachtig terug omhoog zonder je rug te hol trekken.",
    loopMs: 2600,
    poses: [pushUpHigh, pushUpLow, pushUpHigh],
    cues: [
      { at: 0, text: "Rechte lijn van hoofd tot heupen" },
      { at: 0.8, text: "Borst zacht naar de mat" },
      { at: 1.7, text: "Duw terug omhoog" },
    ],
  },
  row: {
    id: "row",
    title: "Rows",
    category: "krachttraining",
    narration:
      "Buig licht vanuit je heupen, rug lang. Trek de band of het gewicht naar je middel en knijp je schouderbladen samen. Laat gecontroleerd terugkomen zonder je schouders op te trekken.",
    loopMs: 2600,
    poses: [rowExtend, rowPull, rowExtend],
    cues: [
      { at: 0, text: "Rug lang, licht voorover" },
      { at: 0.8, text: "Trek naar je middel" },
      { at: 1.7, text: "Schouderbladen knijpen" },
    ],
  },
  "glute-bridge": {
    id: "glute-bridge",
    title: "Glute bridge",
    category: "krachttraining",
    narration:
      "Lig op je rug, knieën gebogen, voeten plat. Druk door je hielen en til je heupen op tot een rechte lijn. Knijp je bilspieren bovenaan samen en laat gecontroleerd zakken.",
    loopMs: 2800,
    poses: [bridgeDown, bridgeUp, bridgeDown],
    cues: [
      { at: 0, text: "Voeten plat, knieën gebogen" },
      { at: 0.9, text: "Heupen omhoog, bilspieren aan" },
      { at: 1.9, text: "Langzaam laten zakken" },
    ],
  },
  plank: {
    id: "plank",
    title: "Plank",
    category: "krachttraining",
    narration:
      "Steun op je onderarmen en tenen of knieën. Elleboog onder schouder. Span je buik, houd een rechte lijn van hoofd tot hielen, en adem rustig door.",
    loopMs: 3200,
    poses: [plankPose, { ...plankPose, rootY: 58 }, plankPose],
    cues: [
      { at: 0, text: "Elleboog onder schouder" },
      { at: 1.1, text: "Buik aan, rechte lijn" },
      { at: 2.2, text: "Adem rustig door" },
    ],
  },
  "side-plank": {
    id: "side-plank",
    title: "Side plank",
    category: "pilates",
    narration:
      "Lig op je zij en steun op je onderarm. Til je heupen op tot een rechte lijn van hoofd tot voeten. Houd je schouders gestapeld en wissel daarna van kant.",
    loopMs: 3000,
    poses: [
      { ...sidePlank, rootY: 110 },
      sidePlank,
      { ...sidePlank, rootY: 110 },
    ],
    cues: [
      { at: 0, text: "Steun op je onderarm" },
      { at: 1, text: "Heupen omhoog, rechte lijn" },
      { at: 2, text: "Schouders gestapeld" },
    ],
  },
  "the-hundred": {
    id: "the-hundred",
    title: "The Hundred",
    category: "pilates",
    narration:
      "Lig op je rug, til hoofd en schouders licht. Benen lang of knieën gebogen. Pomp je armen op en neer terwijl je rustig in- en uitademt. Houd je onderrug zacht op de mat.",
    loopMs: 2200,
    poses: [hundredPose, hundredPump, hundredPose],
    cues: [
      { at: 0, text: "Hoofd licht omhoog" },
      { at: 0.7, text: "Armen pompen, buik aan" },
      { at: 1.5, text: "Onderrug zacht op de mat" },
    ],
  },
  "roll-up": {
    id: "roll-up",
    title: "Roll-up",
    category: "pilates",
    narration:
      "Lig languit, armen naar voren. Rol wervel voor wervel omhoog naar zit. Rol daarna net zo gecontroleerd weer terug. Geen rukken — langzaam en soepel.",
    loopMs: 3600,
    poses: [lyingFlat, rollUpMid, rollUpSit, rollUpMid, lyingFlat],
    cues: [
      { at: 0, text: "Start liggend, armen vooruit" },
      { at: 1.1, text: "Rol wervel voor wervel omhoog" },
      { at: 2.4, text: "Gecontroleerd terugrollen" },
    ],
  },
  "leg-circles": {
    id: "leg-circles",
    title: "Leg circles",
    category: "pilates",
    narration:
      "Lig stabiel op je rug. Eén been wijst omhoog. Maak rustige cirkels met dat been terwijl je bekken stil blijft. Wissel daarna van richting en van been.",
    loopMs: 2800,
    poses: [legCircle, legCircle2, legCircle],
    cues: [
      { at: 0, text: "Bekken stabiel op de mat" },
      { at: 0.9, text: "Rustige cirkels met één been" },
      { at: 1.9, text: "Wissel van richting" },
    ],
  },
  "kat-koe": {
    id: "kat-koe",
    title: "Kat-koe",
    category: "yoga",
    narration:
      "Kom op handen en knieën. Bij de uitademing bol je rug als een kat. Bij de inademing laat je je borst zacht zakken en kijk je licht omhoog. Beweeg met je adem.",
    loopMs: 3000,
    poses: [catPose, cowPose, catPose],
    cues: [
      { at: 0, text: "Uitademing: bolle rug" },
      { at: 1.1, text: "Inademing: borst opent" },
      { at: 2.1, text: "Volg je ademhaling" },
    ],
  },
  "neerwaartse-hond": {
    id: "neerwaartse-hond",
    title: "Neerwaartse hond",
    category: "yoga",
    narration:
      "Vanuit handen en voeten duw je heupen omhoog en achteren. Armen lang, schouders weg van je oren. Laat je hielen richting de mat zakken — ze hoeven de grond niet te raken.",
    loopMs: 3200,
    poses: [
      catPose,
      downDog,
      { ...downDog, rootY: 98, lKnee: 18, rKnee: 18 },
      downDog,
    ],
    cues: [
      { at: 0, text: "Heupen omhoog en achter" },
      { at: 1.1, text: "Armen lang, schouders laag" },
      { at: 2.2, text: "Hielen zacht naar de mat" },
    ],
  },
  kindhouding: {
    id: "kindhouding",
    title: "Kindhouding",
    category: "yoga",
    narration:
      "Kniel en zak met je billen richting je hielen. Laat je bovenlichaam voorover komen en strek je armen naar voren of langs je lichaam. Adem rustig en gun jezelf deze pauze.",
    loopMs: 3400,
    poses: [catPose, childPose, childPose, catPose],
    cues: [
      { at: 0, text: "Billen naar je hielen" },
      { at: 1.2, text: "Voorover, armen lang" },
      { at: 2.4, text: "Adem rustig door" },
    ],
  },
  "torsie-liggend": {
    id: "torsie-liggend",
    title: "Torsie liggend",
    category: "yoga",
    narration:
      "Lig op je rug, trek je knieën in en laat ze zacht naar één kant zakken. Schouders blijven op de mat. Adem een paar keer en wissel daarna van kant.",
    loopMs: 3200,
    poses: [lyingFlat, twistPose, lyingFlat],
    cues: [
      { at: 0, text: "Knieën trekken in" },
      { at: 1, text: "Zacht naar één kant" },
      { at: 2.2, text: "Schouders op de mat" },
    ],
  },
  heupopeners: {
    id: "heupopeners",
    title: "Heupopeners",
    category: "mobiliteit",
    narration:
      "Sta stevig en maak rustige cirkels met je heupen. Groot en langzaam, beide richtingen. Blijf ademen en forceer niets.",
    loopMs: 2600,
    poses: [STANDING, hipOpen, STANDING, { ...hipOpen, lHip: -10, rHip: 45 }],
    cues: [
      { at: 0, text: "Rustige heupcirkels" },
      { at: 1.2, text: "Beide richtingen" },
    ],
  },
  schoudercirkels: {
    id: "schoudercirkels",
    title: "Schoudercirkels",
    category: "mobiliteit",
    narration:
      "Maak grote, langzame cirkels met je schouders. Eerst naar achteren, daarna naar voren. Laat je nek lang en ontspannen.",
    loopMs: 2400,
    poses: [STANDING, shoulderCircles, shoulderCircles2, STANDING],
    cues: [
      { at: 0, text: "Grote cirkels naar achteren" },
      { at: 1.2, text: "Daarna naar voren" },
    ],
  },
  enkelmobiliteit: {
    id: "enkelmobiliteit",
    title: "Enkelmobiliteit",
    category: "mobiliteit",
    narration:
      "Til één voet licht en draai je enkel rustig rond. Beide richtingen, daarna wisselen van voet. Blijf ontspannen staan.",
    loopMs: 2400,
    poses: [STANDING, anklePose, STANDING],
    cues: [
      { at: 0, text: "Enkel rustig ronddraaien" },
      { at: 1.2, text: "Wissel van voet" },
    ],
  },
  "nekrek-zijwaarts": {
    id: "nekrek-zijwaarts",
    title: "Nekrek zijwaarts",
    category: "mobiliteit",
    narration:
      "Laat je oor rustig richting je schouder zakken. Geen forceren — de zwaartekracht doet het werk. Adem uit, kom terug, en wissel van kant.",
    loopMs: 3000,
    poses: [STANDING, neckSide, STANDING, { ...neckSide, torso: -12 }],
    cues: [
      { at: 0, text: "Oor naar schouder" },
      { at: 1.5, text: "Wissel van kant" },
    ],
  },
  borstopener: {
    id: "borstopener",
    title: "Borstopener",
    category: "mobiliteit",
    narration:
      "Vouw je handen achter je rug of pak een handdoek. Trek je schouders naar achteren en beneden tot je een milde rek in je borst voelt. Adem rustig door.",
    loopMs: 2800,
    poses: [STANDING, chestOpen, STANDING],
    cues: [
      { at: 0, text: "Schouders naar achteren" },
      { at: 1.2, text: "Milde rek in je borst" },
    ],
  },
  buikademhaling: {
    id: "buikademhaling",
    title: "Buikademhaling",
    category: "mobiliteit",
    narration:
      "Zit of lig comfortabel. Adem in door je neus en laat je buik meebewegen. Adem langzaam uit door je mond. Houd het rustig en zonder haast.",
    loopMs: 3200,
    poses: [STANDING, breathPose, STANDING],
    cues: [
      { at: 0, text: "Inademen: buik zet uit" },
      { at: 1.6, text: "Uitademen: langzaam loslaten" },
    ],
  },
}

export function lookupExerciseInstruction(exerciseName: string): ExerciseInstruction | null {
  const key = normalizeName(exerciseName)
  const id = ALIASES[key]
  if (!id) return null
  return EXERCISE_INSTRUCTIONS[id] ?? null
}

export function listInstructionCoverage() {
  return Object.values(EXERCISE_INSTRUCTIONS)
}

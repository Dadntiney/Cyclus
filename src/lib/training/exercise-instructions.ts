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

type Limb = readonly [number, number]

/**
 * A pose in screen angles, whatever the body rotation: 0 = straight down,
 * 90 = forward (to the right, where she faces), 180 = up, −90 = back.
 * Arms are [upper arm, forearm], legs [thigh, shin]. Floor work is easier
 * to read and check this way: "arms straight down to the mat" is [0, 0],
 * also when the body is rotated. The body rotations below are solved so
 * that both contact points (hands or elbows, and knees or toes) rest on
 * the mat; figure-geometry.test.ts guards that.
 */
function onScreen(
  body: { rootX?: number; bodyRotation: number; torso?: number },
  limbs: { lArm: Limb; rArm: Limb; lLeg: Limb; rLeg: Limb },
): FigurePose {
  const r = body.bodyRotation
  return {
    rootX: body.rootX ?? 100,
    rootY: 100,
    bodyRotation: r,
    torso: body.torso ?? 0,
    lShoulder: limbs.lArm[0] + r,
    lElbow: limbs.lArm[1] - limbs.lArm[0],
    rShoulder: limbs.rArm[0] + r,
    rElbow: limbs.rArm[1] - limbs.rArm[0],
    lHip: limbs.lLeg[0] + r,
    lKnee: limbs.lLeg[0] - limbs.lLeg[1],
    rHip: limbs.rLeg[0] + r,
    rKnee: limbs.rLeg[0] - limbs.rLeg[1],
  }
}

/** A straight limb at one screen angle. */
const straight = (deg: number): Limb => [deg, deg]

// Squat: hips back (the upper body leans forward), thighs forward, shins
// back to the feet, arms forward for balance. The feet stay where they were.
const squatDown = onScreen(
  { rootX: 88, bodyRotation: 0, torso: -18 },
  { lArm: [80, 85], rArm: [75, 80], lLeg: [72, -22], rLeg: [68, -22] },
)

// Row: hinge at the hips, knees soft; the arms hang, then the elbows pull back.
const rowExtend = onScreen(
  { bodyRotation: 0, torso: -22 },
  { lArm: straight(8), rArm: straight(4), lLeg: [22, -6], rLeg: [18, -6] },
)
const rowPull = onScreen(
  { bodyRotation: 0, torso: -22 },
  { lArm: [-60, 10], rArm: [-64, 6], lLeg: [22, -6], rLeg: [18, -6] },
)

// Push-up, head to the right: hands under the shoulders, one line to the toes.
const pushUpHigh = onScreen(
  { bodyRotation: 56.7 },
  { lArm: straight(0), rArm: straight(0), lLeg: straight(-56.7), rLeg: straight(-56.7) },
)
// Bottom: chest just above the mat, elbows back, hands and toes stay put.
const pushUpLow = onScreen(
  { rootX: 115, bodyRotation: 85.8 },
  { lArm: [-74.6, 26.3], rArm: [-140, 0], lLeg: straight(-85.8), rLeg: straight(-85.8) },
)

// Forearm plank: elbows under the shoulders, forearms forward on the mat.
const plankFor = (rootX: number, rotation: number) =>
  onScreen(
    { rootX, bodyRotation: rotation },
    { lArm: [0, 90], rArm: [0, 90], lLeg: straight(-rotation), rLeg: straight(-rotation) },
  )
const plankPose = plankFor(100, 71.6)
const plankBrace = plankFor(99, 70.1)

// Side plank, seen from the front: the lower forearm on the mat, the top
// arm to the ceiling, then the hips lift into one line.
const sidePlankLow = onScreen(
  { bodyRotation: 79.4, torso: 8 },
  { lArm: straight(150), rArm: [0, 90], lLeg: straight(-71.4), rLeg: straight(-71.4) },
)
const sidePlankUp = onScreen(
  { bodyRotation: 71.6 },
  { lArm: straight(180), rArm: [0, 90], lLeg: straight(-71.6), rLeg: straight(-71.6) },
)

// Glute bridge, lying on the back (head left): knees up, feet flat; then
// the hips lift while shoulders and feet stay on the mat.
const bridgeDown = onScreen(
  { bodyRotation: -90 },
  { lArm: straight(90), rArm: straight(90), lLeg: [141.9, 10], rLeg: [146.9, 12] },
)
const bridgeUp = onScreen(
  { rootX: 87, bodyRotation: -90, torso: 34 },
  { lArm: straight(90), rArm: straight(90), lLeg: [95.3, 4], rLeg: [100.3, 6] },
)

// The Hundred: head and shoulders curled up, legs long at 45°, arms long
// above the mat, pumping.
const hundredFor = (arm: number) =>
  onScreen(
    { bodyRotation: -80 },
    { lArm: straight(arm), rArm: straight(arm + 4), lLeg: straight(130), rLeg: straight(134) },
  )
const hundredPose = hundredFor(96)
const hundredPump = hundredFor(108)

// Roll-up: lying long with the arms to the ceiling, curling up, then
// sitting tall and reaching forward.
const lyingArmsUp = onScreen(
  { bodyRotation: -90 },
  { lArm: straight(180), rArm: straight(180), lLeg: straight(90), rLeg: straight(90) },
)
const rollUpMid = onScreen(
  { rootX: 103, bodyRotation: -40 },
  { lArm: straight(80), rArm: straight(84), lLeg: straight(90), rLeg: straight(90) },
)
const rollUpSit = onScreen(
  { rootX: 93, bodyRotation: 20 },
  { lArm: straight(95), rArm: straight(98), lLeg: straight(90), rLeg: straight(90) },
)

// Leg circles: lying, one leg to the ceiling, drawing small circles.
const legCircleFor = (leg: number) =>
  onScreen(
    { bodyRotation: -90 },
    { lArm: straight(90), rArm: straight(90), lLeg: straight(90), rLeg: straight(leg) },
  )
const legCircle = legCircleFor(175)
const legCircle2 = legCircleFor(150)

// On hands and knees (tabletop). Cat: back rounded, head down. Cow: chest
// low, head up. Hands and knees stay on the mat.
const tabletop = onScreen(
  { bodyRotation: 72.2 },
  { lArm: [35, 45], rArm: [35, 45], lLeg: [0, -90], rLeg: [0, -90] },
)
const catPose = onScreen(
  { bodyRotation: 78.2, torso: 12 },
  { lArm: [29, 39], rArm: [29, 39], lLeg: [0, -90], rLeg: [0, -90] },
)
const cowPose = onScreen(
  { rootX: 104, bodyRotation: 66.2, torso: -10 },
  { lArm: [35, 40], rArm: [35, 40], lLeg: [0, -90], rLeg: [0, -90] },
)

// Downward dog: hips high, arms in line with the back, legs long.
const downDog = onScreen(
  { rootX: 105, bodyRotation: 121.3 },
  { lArm: straight(58.7), rArm: straight(58.7), lLeg: straight(-35), rLeg: straight(-31) },
)
// Pedalling: one knee soft, the other heel towards the mat.
const downDogPedal = onScreen(
  { rootX: 105, bodyRotation: 121.3 },
  { lArm: straight(58.7), rArm: straight(58.7), lLeg: [-28, -40], rLeg: [-24, -36] },
)

// Child's pose: from tabletop the hips sink to the heels, chest on the
// thighs, arms long forward on the mat. The knees stay where they were.
const childPose = onScreen(
  { rootX: 69, bodyRotation: 99.8 },
  { lArm: straight(90), rArm: straight(90), lLeg: [67, -90], rLeg: [70, -90] },
)

// Twist lying: knees drawn in, then lowered while the shoulders stay down.
const kneesIn = onScreen(
  { bodyRotation: -90 },
  { lArm: straight(-90), rArm: straight(-90), lLeg: [150, 70], rLeg: [154, 74] },
)
const twistPose = onScreen(
  { bodyRotation: -90 },
  { lArm: straight(-90), rArm: straight(-90), lLeg: [118, 56], rLeg: [122, 60] },
)

// Seen from the front: one leg swings out to the side, then the other.
const hipOpen: FigurePose = {
  ...STANDING,
  lHip: -40,
  lKnee: -15,
  rHip: -4,
  rKnee: -2,
}

const hipOpenOther: FigurePose = {
  ...STANDING,
  lHip: 4,
  lKnee: 2,
  rHip: 40,
  rKnee: 15,
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

// One foot lifted just off the floor, knee soft.
const anklePose: FigurePose = {
  ...STANDING,
  lHip: -12,
  lKnee: 30,
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
    poses: [plankPose, plankBrace, plankPose],
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
    poses: [sidePlankLow, sidePlankUp, sidePlankLow],
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
    poses: [lyingArmsUp, rollUpMid, rollUpSit, rollUpMid, lyingArmsUp],
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
    poses: [tabletop, downDog, downDogPedal, downDog],
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
    poses: [tabletop, childPose, childPose, tabletop],
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
    poses: [kneesIn, twistPose, kneesIn],
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
    poses: [STANDING, hipOpen, STANDING, hipOpenOther],
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

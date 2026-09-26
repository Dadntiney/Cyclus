import type { MentalWellbeingCategory } from "@/lib/constants"

/**
 * Content for the optional "Mijn mentale rust" module — short, guided
 * meditations and mindfulness exercises. Static, hand-curated content (like
 * buddy-quotes.ts and phase-content.ts) rather than a database table: this
 * is editorial copy the app ships with, not user data.
 *
 * There's no audio here — each exercise is a small sequence of short,
 * guided text prompts meant to be read one at a time at your own pace (see
 * the step-timer UI on the exercise detail page). Deliberately laagdrempelig:
 * no elaborate spiritual language, no long paragraphs.
 */

export type MindfulExerciseKind = "meditatie" | "mindfulness"

export interface MindfulExercise {
  id: string
  kind: MindfulExerciseKind
  title: string
  categories: MentalWellbeingCategory[]
  /** Roughly how long this takes — used for filtering and as a countdown per step. */
  durationMinutes: number
  intro: string
  steps: string[]
  closing: string
}

export const MINDFUL_EXERCISES: MindfulExercise[] = [
  // ---- Meditaties ----
  {
    id: "even-landen",
    kind: "meditatie",
    title: "Even landen",
    categories: ["rust", "overprikkeling"],
    durationMinutes: 2,
    intro: "Een korte pauze om even helemaal hier te zijn, precies waar je nu bent.",
    steps: [
      "Zoek een houding die prettig voelt, zittend of liggend.",
      "Laat je ogen zakken of richt je blik zacht naar beneden.",
      "Adem drie keer iets dieper in en uit dan je gewend bent.",
      "Voel waar je lichaam de ondergrond raakt.",
      "Je hoeft nu even helemaal niets — je bent er al.",
    ],
    closing: "Open je ogen weer wanneer jij daar klaar voor bent.",
  },
  {
    id: "adem-uit-de-spanning",
    kind: "meditatie",
    title: "Adem uit de spanning",
    categories: ["angst_spanning"],
    durationMinutes: 2,
    intro: "Een korte ademhalingsoefening voor als je je gespannen of onrustig voelt.",
    steps: [
      "Adem rustig in via je neus, tel daarbij tot vier.",
      "Houd je adem heel even vast.",
      "Adem langzaam uit via je mond, tel tot zes.",
      "Laat bij het uitademen je schouders een stukje zakken.",
      "Herhaal dit nog drie keer, in je eigen tempo.",
    ],
    closing: "Je hoeft de spanning niet meteen weg te krijgen — dit is al een stap.",
  },
  {
    id: "rustig-ademhalen",
    kind: "meditatie",
    title: "Rustig ademhalen",
    categories: ["angst_spanning", "rust"],
    durationMinutes: 5,
    intro: "Iets langer stilstaan bij je adem, om je zenuwstelsel wat rust te geven.",
    steps: [
      "Ga zitten of liggen op een plek waar je even niet gestoord wordt.",
      "Laat je adem gewoon komen zoals hij komt, zonder hem te sturen.",
      "Merk op: is je adem hoog in je borst, of laag in je buik?",
      "Probeer, als dat lukt, iets meer naar je buik toe te ademen.",
      "Bij elke uitademing: laat een klein beetje spanning los.",
      "Blijf nog even zo zitten, zonder iets te hoeven.",
    ],
    closing: "Neem de rust die je nu voelt mee in de rest van je dag.",
  },
  {
    id: "zelfcompassie-pauze",
    kind: "meditatie",
    title: "Zelfcompassie-pauze",
    categories: ["somberheid", "zelfvertrouwen"],
    durationMinutes: 5,
    intro: "Voor een moment waarop je vooral vriendelijkheid voor jezelf kunt gebruiken.",
    steps: [
      "Leg, als dat prettig voelt, een hand op je hart.",
      "Erken voor jezelf: dit voelt nu even niet makkelijk.",
      "Zeg (hardop of in gedachten): ik hoef dit niet meteen op te lossen.",
      "Bedenk wat je tegen een goede vriendin zou zeggen in jouw situatie.",
      "Probeer die woorden, al is het maar een beetje, ook voor jezelf te voelen.",
    ],
    closing: "Je verdient dezelfde vriendelijkheid die je een ander zou geven.",
  },
  {
    id: "ochtendmoment",
    kind: "meditatie",
    title: "Ochtendmoment",
    categories: ["positiviteit", "zelfzorg"],
    durationMinutes: 5,
    intro: "Een rustige start van de dag, voordat de drukte begint.",
    steps: [
      "Ga rechtop zitten, ergens waar je het ochtendlicht een beetje kunt voelen.",
      "Neem drie rustige ademhalingen.",
      "Bedenk één ding waar je vandaag naar uitkijkt, hoe klein ook.",
      "Bedenk één manier waarop je vandaag lief voor jezelf kunt zijn.",
      "Neem dat voornemen mee als je opstaat.",
    ],
    closing: "Je dag hoeft niet perfect te zijn om goed te beginnen.",
  },
  {
    id: "bodyscan-voor-meer-rust",
    kind: "meditatie",
    title: "Bodyscan voor meer rust",
    categories: ["rust", "slaap"],
    durationMinutes: 10,
    intro: "Rustig door je lichaam wandelen met je aandacht, van top tot teen.",
    steps: [
      "Ga liggen of zitten in een houding die je lang kunt volhouden.",
      "Breng je aandacht naar je voeten — voel ze gewoon, zonder iets te veranderen.",
      "Wandel langzaam omhoog: je benen, je buik, je borst.",
      "Merk je schouders op — laat ze, als dat kan, iets zakken.",
      "Ga verder naar je nek, je kaak, je ogen — vaak plekken waar spanning zit.",
      "Voel tot slot je hele lichaam in één keer, rustig ademend.",
    ],
    closing: "Je lichaam heeft nu even wat aandacht gekregen — dat is genoeg.",
  },
  {
    id: "los-durven-laten",
    kind: "meditatie",
    title: "Los durven laten",
    categories: ["piekeren"],
    durationMinutes: 10,
    intro: "Voor als je gedachten blijven rondgaan en je even lucht nodig hebt.",
    steps: [
      "Ga ergens rustig zitten en sluit, als dat prettig voelt, je ogen.",
      "Merk op dat er gedachten zijn, zonder ze meteen te willen oplossen.",
      "Stel je voor dat elke gedachte een wolk is die voorbij drijft.",
      "Je hoeft niet met elke wolk mee te reizen — je mag hem ook laten gaan.",
      "Kom telkens terug naar je adem als anker.",
      "Als er weer een gedachte komt: dat is oké, begin gewoon opnieuw.",
    ],
    closing: "Piekeren stopt niet in één keer — elke keer terugkomen naar je adem is al winst.",
  },
  {
    id: "terug-naar-jezelf",
    kind: "meditatie",
    title: "Terug naar jezelf",
    categories: ["eenzaamheid", "zelfzorg"],
    durationMinutes: 10,
    intro: "Een moment van verbinding met jezelf, voor als je je alleen voelt.",
    steps: [
      "Ga zitten op een plek waar jij je senang voelt.",
      "Leg een hand op je borst of buik — waar dat maar prettig voelt.",
      "Voel de warmte van je eigen hand.",
      "Bedenk iemand, een dier, of een plek die jou een gevoel van verbinding geeft.",
      "Laat dat gevoel er even zijn, zonder het vast te hoeven houden.",
      "Herinner jezelf: dit gevoel van alleen zijn mag er zijn, en het is niet blijvend.",
    ],
    closing: "Je bent hier, met jezelf — dat telt ook.",
  },
  {
    id: "avondroutine-voor-diepe-ontspanning",
    kind: "meditatie",
    title: "Avondroutine voor diepe ontspanning",
    categories: ["slaap"],
    durationMinutes: 15,
    intro: "Een langere meditatie om je lichaam en hoofd voor te bereiden op slaap.",
    steps: [
      "Ga liggen in bed, zet eventueel het licht al uit.",
      "Adem drie keer langzaam in en diep uit.",
      "Wandel rustig door je lichaam: hoofd, schouders, armen, buik, benen, voeten.",
      "Laat bij elk lichaamsdeel een beetje spanning los, in jouw eigen tempo.",
      "Denk terug aan één moment van vandaag waar je blij mee was, hoe klein ook.",
      "Laat je gedachten steeds trager worden, zoals een dag die uitdooft.",
      "Sta jezelf toe om weg te doezelen wanneer dat gebeurt.",
    ],
    closing: "Er is niets meer dat je vanavond hoeft te doen. Welterusten.",
  },
  {
    id: "innerlijke-rust-opbouwen",
    kind: "meditatie",
    title: "Innerlijke rust opbouwen",
    categories: ["rust", "overprikkeling"],
    durationMinutes: 15,
    intro: "Een uitgebreidere meditatie voor wanneer alles even te veel voelt.",
    steps: [
      "Zoek een plek waar je even niet gestoord wordt.",
      "Ga zitten of liggen en sluit je ogen.",
      "Adem enkele keren rustig in en uit, zonder iets te forceren.",
      "Merk op wat er allemaal binnenkomt: geluiden, gedachten, gevoelens.",
      "Je hoeft niets van dit alles op te lossen — laat het er gewoon zijn.",
      "Stel je een rustige plek voor: binnen of buiten, echt of verzonnen.",
      "Blijf daar even, ademend, tot je merkt dat je iets rustiger wordt.",
    ],
    closing: "Deze rust zit al in je — je hebt hem alleen even opgezocht.",
  },
  {
    id: "focus-vinden",
    kind: "meditatie",
    title: "Focus vinden",
    categories: ["piekeren", "zelfvertrouwen"],
    durationMinutes: 5,
    intro: "Voor als je hoofd vol zit en je iets meer richting wilt voelen.",
    steps: [
      "Ga rechtop zitten, voeten stevig op de grond.",
      "Adem drie keer rustig in en uit.",
      "Bedenk: wat is nu, op dit moment, het enige dat écht om aandacht vraagt?",
      "Laat de rest, voor nu, even los.",
      "Zeg voor jezelf: dit is genoeg om nu mee te beginnen.",
    ],
    closing: "Je hoeft niet alles tegelijk te doen — één ding is al een goed begin.",
  },
  {
    id: "kalmeren-in-het-moment",
    kind: "meditatie",
    title: "Kalmeren in het moment",
    categories: ["angst_spanning", "overprikkeling"],
    durationMinutes: 2,
    intro: "Een hele korte oefening voor als het even te veel wordt.",
    steps: [
      "Voel je voeten stevig op de grond.",
      "Adem in via je neus, tel tot vier.",
      "Adem uit via je mond, tel tot zes.",
      "Benoem voor jezelf: ik ben hier, dit gaat voorbij.",
      "Herhaal de ademhaling nog twee keer.",
    ],
    closing: "Als dit gevoel vaker terugkomt of aanhoudt, kan het goed zijn om er met iemand over te praten.",
  },

  // ---- Mindfulness-oefeningen ----
  {
    id: "1-minuut-bewust-ademen",
    kind: "mindfulness",
    title: "1 minuut bewust ademen",
    categories: ["rust", "angst_spanning", "overprikkeling"],
    durationMinutes: 1,
    intro: "De kortste reset die er is — overal en altijd te doen.",
    steps: [
      "Sluit, als dat kan, even je ogen.",
      "Adem in, en merk hoe de lucht naar binnen stroomt.",
      "Adem uit, en merk hoe je lichaam iets zachter wordt.",
      "Doe dit nog twee keer, zonder iets anders te hoeven.",
    ],
    closing: "Eén minuut is genoeg om even te resetten.",
  },
  {
    id: "5-4-3-2-1-oefening",
    kind: "mindfulness",
    title: "5-4-3-2-1 oefening",
    categories: ["angst_spanning", "overprikkeling", "piekeren"],
    durationMinutes: 3,
    intro: "Je zintuigen gebruiken om terug te komen in het hier en nu.",
    steps: [
      "Benoem 5 dingen die je nu kunt zien.",
      "Benoem 4 dingen die je nu kunt horen.",
      "Benoem 3 dingen die je nu kunt voelen (bijvoorbeeld je kleding, de lucht).",
      "Benoem 2 dingen die je nu kunt ruiken.",
      "Benoem 1 ding dat je nu zou kunnen proeven.",
    ],
    closing: "Je zintuigen brengen je vanzelf terug naar nu.",
  },
  {
    id: "bodyscan-kort",
    kind: "mindfulness",
    title: "Body scan",
    categories: ["rust", "overprikkeling"],
    durationMinutes: 3,
    intro: "Kort stilstaan bij verschillende delen van je lichaam.",
    steps: [
      "Voel je voeten en onderbenen.",
      "Voel je buik en je ademhaling daar.",
      "Voel je schouders — hangen ze, of zitten ze omhoog?",
      "Voel je kaak — is die gespannen of ontspannen?",
      "Voel voor even je hele lichaam als geheel.",
    ],
    closing: "Je lichaam vertelt je vaak meer dan je gedachten.",
  },
  {
    id: "bewust-wandelen",
    kind: "mindfulness",
    title: "Bewust wandelen",
    categories: ["rust", "positiviteit"],
    durationMinutes: 10,
    intro: "Een korte wandeling waarbij je aandacht hebt voor je omgeving en je lichaam.",
    steps: [
      "Ga naar buiten, of loop een rondje binnen als dat makkelijker is.",
      "Voel bij elke stap hoe je voet de grond raakt.",
      "Kijk bewust om je heen: kleuren, vormen, licht.",
      "Luister naar de geluiden om je heen, zonder ze te beoordelen.",
      "Voel de lucht op je huid, de temperatuur, de wind.",
    ],
    closing: "Bewegen én aandacht geven — dat combineert goed.",
  },
  {
    id: "moment-voor-jezelf",
    kind: "mindfulness",
    title: "Moment voor jezelf",
    categories: ["zelfzorg", "rust"],
    durationMinutes: 5,
    intro: "Een korte begeleide pauze, puur voor jou.",
    steps: [
      "Zoek een plekje waar je even niet gestoord wordt.",
      "Zet, als je wilt, je telefoon op stil.",
      "Vraag jezelf af: wat heb ik nu nodig?",
      "Geef jezelf toestemming om dat — al is het kort — te nemen.",
      "Adem nog een paar keer rustig, zonder ergens heen te hoeven.",
    ],
    closing: "Tijd voor jezelf nemen is geen luxe, het is onderhoud.",
  },
  {
    id: "spanning-loslaten-in-je-lijf",
    kind: "mindfulness",
    title: "Spanning loslaten in je lijf",
    categories: ["angst_spanning", "prikkelbaarheid"],
    durationMinutes: 3,
    intro: "Een snelle manier om fysieke spanning eruit te schudden.",
    steps: [
      "Span je schouders even hard op naar je oren.",
      "Laat ze met een zucht weer helemaal los.",
      "Bal je handen tot vuisten, span even aan.",
      "Laat ze weer helemaal open en ontspannen.",
      "Schud, als dat kan, even je armen en benen los.",
    ],
    closing: "Spanning zit vaak in je lijf — bewegen helpt om het los te laten.",
  },
  {
    id: "dankbaarheidsmoment",
    kind: "mindfulness",
    title: "Dankbaarheidsmoment",
    categories: ["positiviteit", "zelfvertrouwen"],
    durationMinutes: 2,
    intro: "Even stilstaan bij iets kleins dat goed voelde.",
    steps: [
      "Denk terug aan de afgelopen dag.",
      "Zoek één moment, hoe klein ook, dat fijn was.",
      "Voel, als dat lukt, nog even wat dat moment met je deed.",
      "Zeg voor jezelf: dit telde ook mee vandaag.",
    ],
    closing: "Kleine dingen tellen ook — vooral op dagen die zwaar voelden.",
  },
]

export function getMindfulExercise(id: string): MindfulExercise | null {
  return MINDFUL_EXERCISES.find((e) => e.id === id) ?? null
}

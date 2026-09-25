import type { CyclePhase } from "@/lib/cycle/estimate"
import type { BuddyStyle } from "@/lib/buddy/styles"

/**
 * Content for the daily "Buddy"-quote card on Vandaag — a short, warm
 * message that isn't always about motivation. Deliberately a static,
 * hand-curated pool (like phase-content.ts) rather than a database table:
 * this is editorial copy the app ships with, not user data, so it doesn't
 * need a migration to grow — just add a line here.
 *
 * Phase-tagged entries are mixed subtly into the daily pool rather than
 * always shown — the Buddy notices your cycle, it doesn't lecture about it.
 *
 * Some entries also carry a `styles` map: the same underlying message,
 * rephrased in her optional Buddy tone-of-voice preference(s). Not every
 * entry needs one — quotes without a `styles` map simply never come up on
 * days her selected style(s) apply, so a "styled" pick always genuinely
 * sounds like the style she chose (see getDailyBuddyQuote below).
 */

export type BuddyQuoteCategory =
  | "positief"
  | "motivatie"
  | "weetje"
  | "herkenbaar"
  | "tip"
  | "bemoedigend"
  | "luchtig"
  | "uitleg"
  | "reflectie"

export interface BuddyQuote {
  emoji: string
  text: string
  category: BuddyQuoteCategory
  /** When set, this quote fits especially well in these phases. */
  phases?: CyclePhase[]
  /** Per-style rewrites of this same message — same idea, different tone. */
  styles?: Partial<Record<BuddyStyle, string>>
}

const GENERAL_QUOTES: BuddyQuote[] = [
  { emoji: "🌿", text: "Je hoeft vandaag niet perfect te zijn. Goed genoeg is ook goed.", category: "positief" },
  { emoji: "✨", text: "Klein succesje geteld is ook een succesje.", category: "positief" },
  { emoji: "🫶", text: "Wat je vandaag ook voelt — het is oké dat het er is.", category: "positief" },
  { emoji: "🌱", text: "Je lijf werkt de hele dag door voor je, ook als je er niet bij stilstaat.", category: "positief" },
  { emoji: "🧘‍♀️", text: "Rust nemen is geen luxe, het is onderhoud.", category: "positief" },

  { emoji: "💪", text: "Je hebt al zoveel dagen doorstaan waarvan je dacht dat het niet zou lukken.", category: "motivatie" },
  { emoji: "🔥", text: "Elke kleine stap telt mee, ook als niemand hem ziet.", category: "motivatie" },
  { emoji: "🚶‍♀️", text: "Je hoeft niet te rennen. Lopen in jouw tempo brengt je ook vooruit.", category: "motivatie" },
  { emoji: "🌤️", text: "Vandaag is een nieuwe kans om iets kleins voor jezelf te doen.", category: "motivatie" },
  { emoji: "🎯", text: "Consistentie klopt niet met perfectie — vaak genoeg is genoeg.", category: "motivatie" },

  { emoji: "🧠", text: "Wist je dat je lichaamstemperatuur licht schommelt gedurende je cyclus?", category: "weetje" },
  { emoji: "💧", text: "Wist je dat je vochtbehoefte kan meebewegen met hoe actief je bent, niet alleen met het weer?", category: "weetje" },
  { emoji: "😴", text: "Wist je dat slaap een van de grootste hefbomen is voor hoe je je overdag voelt?", category: "weetje" },
  { emoji: "🩸", text: "Wist je dat de gemiddelde cyclusduur ergens tussen de 21 en 35 dagen ligt — en dat allebei heel normaal kan zijn?", category: "weetje" },
  { emoji: "🍫", text: "Wist je dat trek in iets zoets niet per se een teken van 'zwak zijn' is, maar gewoon iets is wat veel mensen ervaren?", category: "weetje" },
  { emoji: "🚶", text: "Wist je dat een korte wandeling al kan bijdragen aan een helderder hoofd?", category: "weetje" },

  { emoji: "🫠", text: "Sommige dagen voelt alles zwaarder dan het is. Dat is geen falen, dat is een dag.", category: "herkenbaar" },
  { emoji: "🙃", text: "Je hoeft niet elke dag evenveel energie te hebben — dat is niemand gegeven.", category: "herkenbaar" },
  { emoji: "😅", text: "Een dag zonder to-do-lijstje afvinken is ook een geldige dag.", category: "herkenbaar" },
  { emoji: "🛋️", text: "Soms is 'niets doen' precies het juiste om te doen.", category: "herkenbaar" },
  { emoji: "📵", text: "Het is oké om vandaag even niet overal 'ja' op te zeggen.", category: "herkenbaar" },

  { emoji: "💡", text: "Zet een glas water binnen handbereik — kleine gewoontes maken vaak het verschil.", category: "tip" },
  { emoji: "🪟", text: "Even daglicht opzoeken, ook maar vijf minuten, kan al net dat beetje energie geven.", category: "tip" },
  { emoji: "📝", text: "Schrijf één ding op waar je vandaag blij van werd, hoe klein ook.", category: "tip" },
  { emoji: "🫁", text: "Drie rustige, diepe ademhalingen kunnen al helpen om een moment te resetten.", category: "tip" },
  { emoji: "⏰", text: "Zet vanavond je scherm iets eerder weg — je lichaam zal het je morgen danken.", category: "tip" },

  { emoji: "🌷", text: "Je doet het beter dan je van jezelf denkt.", category: "bemoedigend" },
  { emoji: "🤍", text: "Wat er ook speelt vandaag — je hoeft het niet alleen te dragen.", category: "bemoedigend" },
  { emoji: "🌈", text: "Moeilijke dagen zijn ook maar dagen. Ze gaan voorbij.", category: "bemoedigend" },
  { emoji: "🕊️", text: "Je bent toegestaan om trots te zijn op iets kleins.", category: "bemoedigend" },
  { emoji: "🌻", text: "Vergelijk je binnenkant niet met ieders buitenkant.", category: "bemoedigend" },

  { emoji: "🐢", text: "Traag is ook een snelheid.", category: "luchtig" },
  { emoji: "☕", text: "Soms is de beste planning: koffie, en dan verder zien.", category: "luchtig" },
  { emoji: "🧦", text: "Twee verschillende sokken aan is geen crisis, gewoon een vibe.", category: "luchtig" },
  { emoji: "🎧", text: "Een goed liedje kan een matige dag zomaar net iets beter maken.", category: "luchtig" },
  { emoji: "🐌", text: "Je hoeft vandaag geen slak in te halen. Geniet van het tempo.", category: "luchtig" },

  // Richly styled entries — same message, eight tones. See the `styles`
  // note above the BuddyQuote interface for how these get selected.
  {
    emoji: "💛",
    text: "Je lichaam is vandaag misschien wat gevoeliger. Geef jezelf gerust wat extra ruimte.",
    category: "positief",
    styles: {
      liefdevol: "Je lichaam is vandaag misschien wat gevoeliger. Geef jezelf gerust wat extra ruimte. 💛",
      humor: "Vandaag even geen superheldenmodus? Helemaal prima. Zelfs Wonder Woman heeft soms een pyjamadag. 😉",
      spiritueel: "Luister vandaag eens bewust naar wat je lichaam je vertelt. Soms zit de beste richting al in jezelf. ✨",
      motiverend: "Je hoeft vandaag niet alles te kunnen. Kies één ding dat goed voelt en zet die stap. 💪",
      informatief:
        "Wist je dat veranderingen in hormoonspiegels invloed kunnen hebben op je energie en stemming? Je lichaam is continu aan het aanpassen.",
      rustig: "Adem even rustig in. Je hoeft vandaag niet te haasten. Geef je lichaam de ruimte om zijn eigen ritme te volgen. 🌿",
      direct: "Voel je je vandaag wat minder fit? Pas je plan gewoon aan. Geen uitleg nodig.",
      luchtig: "Niet je sterkste dag? Morgen ziet de wereld er vast weer anders uit. 😊",
    },
  },
  {
    emoji: "💧",
    text: "Een glas water binnen handbereik kan net dat beetje verschil maken.",
    category: "tip",
    styles: {
      liefdevol: "Zorg lief voor jezelf vandaag: zet een glas water binnen handbereik. 💛",
      humor: "Je lichaam bestaat voor een groot deel uit water — vul het bij, zoals een plant die te lang op het vensterbankje stond. 😄",
      spiritueel: "Water voedt niet alleen je lichaam, maar ook je aandacht — drink bewust, met een moment van stilte. ✨",
      motiverend: "Kleine gewoontes maken het verschil: zet nu een glas water binnen handbereik. 💪",
      informatief: "Voldoende drinken ondersteunt onder andere je concentratie en energieniveau gedurende de dag.",
      rustig: "Neem even de tijd voor een glas water. Een klein, rustig moment voor jezelf. 🌿",
      direct: "Drink een glas water. Nu. Klein gebaar, echt effect.",
      luchtig: "Glaasje water erbij? Je lichaam zegt dankjewel. 😊",
    },
  },
  {
    emoji: "😴",
    text: "Slaap is een van de grootste hefbomen voor hoe je je overdag voelt.",
    category: "weetje",
    styles: {
      liefdevol: "Wist je dat je lichaam je dankbaar is voor iedere extra minuut slaap die je jezelf gunt? 💛",
      humor: "Wist je dat 'nog even op de telefoon' en 'goed slapen' zelden hand in hand gaan? Vraag maar aan je energieniveau. 😄",
      spiritueel: "Slaap is een moment waarop lichaam en geest zich herstellen — geef het de aandacht die het verdient. ✨",
      motiverend: "Wist je dat betere slaap kan bijdragen aan meer energie voor de dingen die jij belangrijk vindt? 💪",
      informatief:
        "Slaap speelt een rol bij herstel, concentratie en hormoonbalans — een van de grootste hefbomen voor hoe je je overdag voelt.",
      rustig: "Wist je dat een rustige avondroutine je lichaam kan helpen om makkelijker in slaap te vallen? 🌿",
      direct: "Slecht geslapen? Dat verklaart waarschijnlijk waarom je je nu zo voelt.",
      luchtig: "Wist je dat 'vroeg slapen' soms de meest onderschatte zelfzorg is? 😊",
    },
  },
  {
    emoji: "🫠",
    text: "Sommige dagen voelt alles zwaarder dan het is. Dat is geen falen, dat is een dag.",
    category: "herkenbaar",
    styles: {
      liefdevol: "Als vandaag zwaar voelt: dat is oké. Je hoeft niet sterk te zijn, je mag gewoon zijn. 💛",
      humor: "Sommige dagen loop je op halve batterij. Geen crisis — gewoon spaarstand aan. 😄",
      spiritueel: "Niet elke dag hoeft licht te voelen. Ook de zwaardere dagen horen bij het ritme van het leven. ✨",
      motiverend: "Zware dag? Je hoeft niet alles te doen — één ding goed doen is ook genoeg. 💪",
      informatief: "Schommelingen in energie door de dag of over je cyclus heen zijn bij veel mensen heel gewoon.",
      rustig: "Als het vandaag zwaar voelt, mag je het rustig aan doen. Er is geen haast. 🌿",
      direct: "Zware dag. Gebeurt. Ga er niet tegenin, ga ermee mee.",
      luchtig: "Vandaag een dag op halve kracht? Morgen draait de teller weer om. 😊",
    },
  },
  {
    emoji: "🌷",
    text: "Je doet het beter dan je van jezelf denkt.",
    category: "bemoedigend",
    styles: {
      liefdevol: "Je doet het beter dan je van jezelf denkt — echt waar. 💛",
      humor: "Spoiler: je bent minder aan het falen dan je innerlijke criticus beweert. 😄",
      spiritueel: "Je innerlijke stem is soms harder dan nodig. Luister liever naar wat je lichaam en hart je vertellen. ✨",
      motiverend: "Je doet het beter dan je denkt. Bewijs: je bent er vandaag ook weer. 💪",
      informatief: "Zelfkritiek is vaak feller dan de werkelijkheid rechtvaardigt — iets om je bewust van te zijn.",
      rustig: "Je hoeft jezelf niet steeds te bewijzen. Je doet het al goed genoeg. 🌿",
      direct: "Je bent strenger voor jezelf dan nodig is. Hou daarmee op.",
      luchtig: "Plot twist: je doet het prima. 😊",
    },
  },
  {
    emoji: "🐢",
    text: "Traag is ook een snelheid.",
    category: "luchtig",
    styles: {
      liefdevol: "Het is oké om vandaag rustiger aan te doen dan gisteren. 💛",
      humor: "Traag is ook een snelheid. Vraag maar aan slakken — die halen ook gewoon hun bestemming. 😄",
      spiritueel: "Vertragen is geen falen, het is een uitnodiging om even bij jezelf te komen. ✨",
      motiverend: "Ook op een lager tempo kom je vooruit. Blijf bewegen, in jouw ritme. 💪",
      informatief: "Je energieniveau kan van dag tot dag verschillen — dat is een normaal onderdeel van hoe je lichaam werkt.",
      rustig: "Vandaag mag het rustig. Traag is ook een snelheid. 🌿",
      direct: "Minder tempo vandaag? Prima. Ga gewoon door, alleen langzamer.",
      luchtig: "Traag is ook een snelheid — en een hele fijne, eigenlijk. 😊",
    },
  },
  {
    emoji: "🚶",
    text: "Een korte wandeling kan al bijdragen aan een helderder hoofd.",
    category: "tip",
    styles: {
      liefdevol: "Als het past: een klein wandelingetje kan je lichaam goed doen. Geen druk, gewoon een aanbod. 💛",
      humor: "Vijf minuten naar buiten lopen: goedkoper dan koffie, en werkt ook. 😄",
      spiritueel: "Een wandeling buiten kan helpen om weer verbinding te voelen met jezelf en je omgeving. ✨",
      motiverend: "Zelfs een korte wandeling telt. Zet die eerste stap. 💪",
      informatief: "Beweging, ook licht, kan bijdragen aan een helderder hoofd door onder andere de doorbloeding te stimuleren.",
      rustig: "Een rustige wandeling buiten kan een fijne manier zijn om je hoofd wat leger te maken. 🌿",
      direct: "Kort blokje om. Doe het gewoon, je voelt het verschil.",
      luchtig: "Buiten lucht happen: kleine moeite, groot cadeautje aan jezelf. 😊",
    },
  },
  {
    emoji: "🧠",
    text: "Je energieniveau hangt niet alleen af van slaap, maar ook van je hormonen gedurende je cyclus.",
    category: "uitleg",
    styles: {
      liefdevol: "Als je energie op en neer gaat: dat ligt niet aan jou, je lichaam is gewoon druk met aanpassen. Wees lief voor jezelf. 💛",
      humor: "Je hormonen hebben een eigen agenda, en die delen ze helaas niet vooraf met je. 😄",
      spiritueel: "Je lichaam kent een eigen, wijs ritme — het is geen toeval dat je je niet elke dag hetzelfde voelt. ✨",
      motiverend: "Begrijpen waarom je je zo voelt, geeft je meer grip om er slim mee om te gaan. 💪",
      informatief: "Hormoonspiegels schommelen gedurende je cyclus en kunnen invloed hebben op energie, stemming en concentratie.",
      rustig: "Het is oké als je energie niet iedere dag hetzelfde is — je lichaam volgt zijn eigen, rustige ritme. 🌿",
      direct: "Je hormonen schommelen. Dat verklaart een hoop. Ga er niet tegen vechten.",
      luchtig: "Je hormonen doen soms hun eigen dingetje — niet persoonlijk bedoeld. 😊",
    },
  },
  {
    emoji: "🤔",
    text: "Wat heb jij vandaag echt nodig — rust, beweging, of gewoon een moment voor jezelf?",
    category: "reflectie",
    styles: {
      liefdevol: "Even een vraag voor jezelf: wat zou vandaag goed voelen voor jou? 💛",
      humor: "Kleine check-in: rust, chocolade of allebei? Beide zijn geldige antwoorden. 😄",
      spiritueel: "Neem een moment: wat vertelt je lichaam je op dit moment, als je er echt naar luistert? ✨",
      motiverend: "Wat is vandaag dat ene ding dat jou vooruit zou helpen? 💪",
      informatief: "Even stilstaan bij wat je nodig hebt, kan helpen om bewuster keuzes te maken gedurende de dag.",
      rustig: "Een rustige vraag voor onderweg: wat heb jij vandaag nodig? 🌿",
      direct: "Wat heb je vandaag nodig? Denk er even echt over na, en doe het dan ook.",
      luchtig: "Kleine vraag tussendoor: waar krijg jij vandaag een goed gevoel van? 😊",
    },
  },
]

const PHASE_QUOTES: BuddyQuote[] = [
  { emoji: "🌙", text: "Extra rust nemen deze dagen is geen luxe — het past gewoon bij deze fase.", category: "tip", phases: ["menstruatie"] },
  { emoji: "🫖", text: "Iets warms drinken en het rustiger aan doen: helemaal oké vandaag.", category: "positief", phases: ["menstruatie"] },
  { emoji: "🧣", text: "Als je lichaam om zachtheid vraagt deze dagen, mag je daar gehoor aan geven.", category: "bemoedigend", phases: ["menstruatie"] },

  { emoji: "🌤️", text: "Merk je wat meer energie deze dagen? Een fijn moment om iets nieuws te proberen.", category: "motivatie", phases: ["folliculair"] },
  { emoji: "📋", text: "Veel mensen plannen graag in deze fase — misschien is dit een goed moment om je week te bekijken.", category: "tip", phases: ["folliculair"] },
  { emoji: "🌼", text: "Frisse energie, frisse start — volg het tempo dat bij jou past.", category: "positief", phases: ["folliculair"] },

  { emoji: "⚡", text: "Voelt dit als een sterke dag? Benut het waar het kan.", category: "motivatie", phases: ["ovulatie"] },
  { emoji: "🎤", text: "Sommige mensen voelen zich rond nu socialer of zelfverzekerder — herken je dat?", category: "weetje", phases: ["ovulatie"] },
  { emoji: "🌟", text: "Een piekmoment voelen mag gevierd worden, groot of klein.", category: "positief", phases: ["ovulatie"] },

  { emoji: "🍂", text: "Als je merkt dat je lichaam iets rustiger aan wil, is dat de moeite waard om te volgen.", category: "herkenbaar", phases: ["luteaal"] },
  { emoji: "🥜", text: "Magnesiumrijke snacks zoals noten kunnen in deze fase een fijne toevoeging zijn.", category: "tip", phases: ["luteaal"] },
  { emoji: "🕯️", text: "Wat extra zachtheid voor jezelf past goed bij deze periode van je cyclus.", category: "bemoedigend", phases: ["luteaal"] },

  // Richly styled, phase-tagged entries.
  {
    emoji: "🌙",
    text: "Extra rust nemen deze dagen is geen luxe — het past gewoon bij deze fase.",
    category: "herkenbaar",
    phases: ["menstruatie"],
    styles: {
      liefdevol: "Wees deze dagen extra zacht voor jezelf — rust is hier geen luxe, het hoort erbij. 💛",
      humor: "Menstruatiedagen: officieel geldige reden voor een extra dekentje en niks moeten. 😄",
      spiritueel: "Deze dagen nodigen uit tot naar binnen keren en loslaten — geef jezelf die ruimte. ✨",
      motiverend: "Ook op rustige dagen ben je in beweging — je lichaam werkt hard, ook als jij even pauzeert. 💪",
      informatief: "Tijdens je menstruatie daalt je energieniveau bij veel mensen — dat hangt onder andere samen met veranderende hormoonspiegels.",
      rustig: "Laat jezelf deze dagen wat trager gaan. Dat past bij deze fase van je cyclus. 🌿",
      direct: "Menstruatie betekent vaak minder energie. Plan er niet tegenin, plan ermee mee.",
      luchtig: "Bankdag? Helemaal passend bij deze fase. 😊",
    },
  },
  {
    emoji: "🧣",
    text: "Een kruik of warm bad kan verlichting geven bij krampen deze dagen.",
    category: "tip",
    phases: ["menstruatie"],
    styles: {
      liefdevol: "Gun jezelf wat warmte vandaag — een kruik of warm bad kan goed voelen bij krampen. 💛",
      humor: "Kruik erbij, deken erover: officieel menstruatie-uniform. 😄",
      spiritueel: "Warmte tegen je buik kan ook een gebaar van zorgzaamheid naar jezelf zijn — een kleine rite van zelfzorg. ✨",
      motiverend: "Een warme kruik kan je helpen om je dag toch fijn door te komen. 💪",
      informatief: "Warmte kan bij sommige vrouwen helpen om spierspanning rond krampen te verlichten.",
      rustig: "Een warme kruik, een dekentje, een rustig moment — dat mag vandaag genoeg zijn. 🌿",
      direct: "Last van krampen? Kruik erop, klaar.",
      luchtig: "Kruik: de MVP van menstruatiedagen. 😊",
    },
  },
  {
    emoji: "🌼",
    text: "Deze fase leent zich vaak goed voor nieuwe ideeën en plannen maken.",
    category: "weetje",
    phases: ["folliculair"],
    styles: {
      liefdevol: "Voel je je wat lichter deze dagen? Volg dat gevoel, het past bij jou. 💛",
      humor: "Opeens zin om de hele kast te reorganiseren? Klopt helemaal, dat is deze fase. 😄",
      spiritueel: "Deze fase voelt vaak als een nieuw begin — een mooi moment om intenties te zetten. ✨",
      motiverend: "Merk je meer energie? Mooi moment om dat nieuwe plan eindelijk op te pakken. 💪",
      informatief: "In de folliculaire fase stijgen oestrogeenspiegels vaak, wat bij sommige vrouwen samengaat met meer energie en motivatie.",
      rustig: "Als je merkt dat je hoofd wat helderder voelt, geniet daar rustig van. 🌿",
      direct: "Meer energie deze dagen? Gebruik het, voor iets dat jij belangrijk vindt.",
      luchtig: "Ineens weer zin in van alles? Typisch deze fase. 😊",
    },
  },
  {
    emoji: "🌟",
    text: "Rond de eisprong voelen sommige vrouwen zich socialer of zelfverzekerder.",
    category: "weetje",
    phases: ["ovulatie"],
    styles: {
      liefdevol: "Als je je vandaag sterk voelt, geniet er gerust van. 💛",
      humor: "Ineens overal zin in en iedereen aardig vinden? Dat is waarschijnlijk je eisprong aan het werk. 😄",
      spiritueel: "Dit kan een moment zijn waarop je je extra verbonden voelt — met jezelf en met anderen. ✨",
      motiverend: "Voelt dit als een piekmoment? Grijp het en doe waar je zin in hebt. 💪",
      informatief: "Rond de ovulatie pieken oestrogeen en LH, wat bij sommige vrouwen samengaat met meer zelfvertrouwen of energie.",
      rustig: "Ook een sterke dag mag je rustig aan doen — je hoeft niet alles eruit te persen. 🌿",
      direct: "Sterke dag? Mooi, benut hem.",
      luchtig: "Vandaag een 'ik kan alles'-dagje? Geniet ervan. 😊",
    },
  },
  {
    emoji: "🍂",
    text: "Sneller geïrriteerd of emotioneler dan anders? Dat kan samenhangen met deze fase van je cyclus.",
    category: "herkenbaar",
    phases: ["luteaal"],
    styles: {
      liefdevol: "Als je je vandaag sneller geraakt voelt: dat is niet 'te veel', dat is gewoon jouw lichaam nu. 💛",
      humor: "Alles opeens irritant, zelfs de manier waarop iemand ademt? Klinkt als de luteale fase. 😄",
      spiritueel: "Deze gevoeligheid kan ook een uitnodiging zijn om extra goed naar jezelf te luisteren. ✨",
      motiverend: "Merk je dat je sneller geraakt bent? Geef jezelf de ruimte, dat werkt beter dan ertegen vechten. 💪",
      informatief: "In de luteale fase dalen oestrogeen en stijgt daarna progesteron, wat bij sommige vrouwen samengaat met stemmingswisselingen.",
      rustig: "Voel je je prikkelbaarder dan normaal? Geef jezelf wat extra rust en ruimte. 🌿",
      direct: "Sneller geïrriteerd? Kan de fase zijn. Wees niet te streng voor jezelf.",
      luchtig: "Kort lontje vandaag? Je hormonen hebben vast een aandeel. 😊",
    },
  },
  {
    emoji: "🍫",
    text: "Trek in iets zoets deze dagen is heel normaal en geen teken van 'zwak zijn'.",
    category: "tip",
    phases: ["luteaal"],
    styles: {
      liefdevol: "Als je trek hebt in iets zoets, mag dat er gewoon zijn — geen schuldgevoel nodig. 💛",
      humor: "Chocolade opeens een basisbehoefte? Je hormonen knikken instemmend. 😄",
      spiritueel: "Luister naar wat je lichaam vraagt, zonder oordeel — het weet vaak wat het nodig heeft. ✨",
      motiverend: "Trek in iets zoets? Geniet ervan met aandacht, en ga daarna weer verder met je dag. 💪",
      informatief: "Trek in koolhydraten of zoet komt in de luteale fase vaker voor, mogelijk samenhangend met dalende serotoninespiegels.",
      rustig: "Als je trek hebt, mag je daar rustig gehoor aan geven. Geen strijd nodig. 🌿",
      direct: "Trek in zoet? Normaal in deze fase. Geen drama nodig.",
      luchtig: "Chocolade-radar aan? Helemaal volgens plan van je cyclus. 😊",
    },
  },
]

export const BUDDY_QUOTES: BuddyQuote[] = [...GENERAL_QUOTES, ...PHASE_QUOTES]

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
 * Picks today's quote, seeded by user + date so it's stable across a page's
 * re-renders/reloads but rotates daily and differs between people. Roughly
 * 1 in 4 days pulls from the (small) phase-matched pool when a phase is
 * known — enough to feel like the Buddy notices, not so much that every
 * period day gets the same "take it easy" message.
 *
 * When she has a Buddy-stijl preference, the pool is narrowed to only
 * entries that actually have a rewrite for one of her chosen styles — so a
 * styled pick always genuinely sounds like her style, never silently falls
 * back to the neutral phrasing. If narrowing would leave nothing (not
 * enough style coverage yet for that phase/day), it falls back to the full
 * neutral pool rather than showing nothing.
 */
export function getDailyBuddyQuote(
  seed: string,
  phase: CyclePhase | null,
  preferredStyles: BuddyStyle[] = [],
): BuddyQuote {
  const phaseMatches = phase ? PHASE_QUOTES.filter((q) => q.phases?.includes(phase)) : []
  const usePhaseQuote = phaseMatches.length > 0 && seededIndex(`${seed}-phase-gate`, 4) === 0
  const basePool = usePhaseQuote ? phaseMatches : GENERAL_QUOTES

  if (preferredStyles.length > 0) {
    const styledPool = basePool.filter((q) => q.styles && preferredStyles.some((s) => q.styles?.[s]))
    if (styledPool.length > 0) {
      const quote = styledPool[seededIndex(seed, styledPool.length)]
      const matchingStyles = preferredStyles.filter((s) => quote.styles?.[s])
      const style = matchingStyles[seededIndex(`${seed}-style-pick`, matchingStyles.length)]
      return { ...quote, text: quote.styles![style]! }
    }
  }

  return basePool[seededIndex(seed, basePool.length)]
}

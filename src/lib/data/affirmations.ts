/**
 * Positive affirmations for the optional "Mijn mentale rust" module. Static,
 * hand-curated content (like buddy-quotes.ts) — deliberately short and
 * grounded, never overdreven ("Ik ben perfect en alles is geweldig"), matching
 * the tone requested in the product brief: believable, human, small.
 */

export type AffirmationTheme =
  | "zelfvertrouwen"
  | "rust"
  | "loslaten"
  | "zelfcompassie"
  | "lichaam"
  | "verandering"
  | "grenzen"
  | "energie"
  | "vrouwelijkheid"
  | "ouder_worden"
  | "onzekerheid"
  | "moeilijke_dagen"

export interface Affirmation {
  id: string
  text: string
  theme: AffirmationTheme
}

export const AFFIRMATIONS: Affirmation[] = [
  // zelfvertrouwen
  { id: "zv-1", text: "Ik hoef vandaag niet alles tegelijk te kunnen.", theme: "zelfvertrouwen" },
  { id: "zv-2", text: "Ik doe wat ik kan met wat ik vandaag heb.", theme: "zelfvertrouwen" },
  { id: "zv-3", text: "Mijn waarde hangt niet af van hoe productief ik vandaag ben.", theme: "zelfvertrouwen" },

  // rust
  { id: "ru-1", text: "Ik mag vertragen zonder daar iets voor te hoeven verantwoorden.", theme: "rust" },
  { id: "ru-2", text: "Rust nemen is geen verspilde tijd.", theme: "rust" },
  { id: "ru-3", text: "Ik hoef nu even nergens heen.", theme: "rust" },

  // loslaten
  { id: "ll-1", text: "Niet elke gedachte hoeft mijn aandacht te krijgen.", theme: "loslaten" },
  { id: "ll-2", text: "Ik mag loslaten wat ik vandaag toch niet kan oplossen.", theme: "loslaten" },
  { id: "ll-3", text: "Ik hoef dit gevoel niet vast te houden om het serieus te nemen.", theme: "loslaten" },

  // zelfcompassie
  { id: "zc-1", text: "Ik mag mezelf dezelfde vriendelijkheid geven die ik een ander zou geven.", theme: "zelfcompassie" },
  { id: "zc-2", text: "Het is oké dat dit even niet lukt.", theme: "zelfcompassie" },
  { id: "zc-3", text: "Ik ben streng genoeg voor mezelf geweest — vandaag mag het zachter.", theme: "zelfcompassie" },

  // lichaam
  { id: "li-1", text: "Mijn lichaam werkt niet tegen mij, ook al voelt het soms zo.", theme: "lichaam" },
  { id: "li-2", text: "Ik mag naar mijn lichaam luisteren, ook als dat betekent dat ik iets aanpas.", theme: "lichaam" },
  { id: "li-3", text: "Hoe ik me vandaag lichamelijk voel, zegt niets over morgen.", theme: "lichaam" },

  // verandering
  { id: "ve-1", text: "Veranderen kost tijd, ook al zie ik het effect nog niet.", theme: "verandering" },
  { id: "ve-2", text: "Ik mag wennen aan een nieuwe fase, in mijn eigen tempo.", theme: "verandering" },
  { id: "ve-3", text: "Niet alles hoeft meteen te kloppen om toch goed te zijn.", theme: "verandering" },

  // grenzen
  { id: "gr-1", text: "Nee zeggen is ook voor mezelf zorgen.", theme: "grenzen" },
  { id: "gr-2", text: "Ik mag een grens stellen, ook als iemand dat niet fijn vindt.", theme: "grenzen" },
  { id: "gr-3", text: "Mijn grenzen zijn geen onvriendelijkheid, ze zijn zelfzorg.", theme: "grenzen" },

  // energie
  { id: "en-1", text: "Mijn energie schommelt, en dat is geen falen.", theme: "energie" },
  { id: "en-2", text: "Ik hoef vandaag niet op volle kracht te draaien.", theme: "energie" },
  { id: "en-3", text: "Een rustige dag is ook een goede dag.", theme: "energie" },

  // vrouwelijkheid
  { id: "vr-1", text: "Mijn lichaam verandert, en dat maakt het niet minder waardevol.", theme: "vrouwelijkheid" },
  { id: "vr-2", text: "Ik hoef niet aan één beeld van 'vrouw-zijn' te voldoen.", theme: "vrouwelijkheid" },
  { id: "vr-3", text: "Ik mag trots zijn op wat mijn lichaam allemaal draagt.", theme: "vrouwelijkheid" },

  // ouder_worden
  { id: "ow-1", text: "Ouder worden brengt verandering, en ook nieuwe inzichten.", theme: "ouder_worden" },
  { id: "ow-2", text: "Ik hoef niet vast te houden aan hoe het vroeger was.", theme: "ouder_worden" },
  { id: "ow-3", text: "Deze fase van mijn leven mag er ook gewoon zijn.", theme: "ouder_worden" },

  // onzekerheid
  { id: "on-1", text: "Onzeker zijn betekent niet dat ik het verkeerd doe.", theme: "onzekerheid" },
  { id: "on-2", text: "Ik hoef niet overal zeker van te zijn om toch verder te gaan.", theme: "onzekerheid" },
  { id: "on-3", text: "Twijfel hoort erbij, en zegt niets over mijn eigen waarde.", theme: "onzekerheid" },

  // moeilijke_dagen
  { id: "md-1", text: "Een moeilijke dag hoeft geen slechte week te worden.", theme: "moeilijke_dagen" },
  { id: "md-2", text: "Dit gevoel is er nu, maar het blijft niet altijd zo.", theme: "moeilijke_dagen" },
  { id: "md-3", text: "Ik hoef vandaag alleen maar door te komen, meer niet.", theme: "moeilijke_dagen" },
]

export function getAffirmationsByThemes(themes: string[]): Affirmation[] {
  if (!themes.length) return AFFIRMATIONS
  const filtered = AFFIRMATIONS.filter((a) => themes.includes(a.theme))
  return filtered.length ? filtered : AFFIRMATIONS
}

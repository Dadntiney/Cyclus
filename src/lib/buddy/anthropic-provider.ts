import type { BuddyChatMessage, BuddyProvider, BuddyReply } from "./types"

const SYSTEM_PROMPT = `Je bent de Buddy in de Cyclus-app: een warme, rustige metgezel die in het Nederlands (je/jij-vorm) praat over cyclus, energie, slaap, stress, training en voeding.

Regels:
- Je stelt nooit een diagnose en doet geen medische claims.
- Bij ernstige of zorgwekkende klachten verwijs je altijd door naar een huisarts of, bij spoed, 112.
- Je bent geruststellend, nooit angstaanjagend.
- Je gebruikt de meegegeven context over de gebruiker om persoonlijk en relevant te antwoorden, zonder aannames te doen die niet uit die context blijken.
- Houd antwoorden kort en natuurlijk, geen opsommingen tenzij gevraagd.
- Staat er een "Buddy-stijl (toon-voorkeur)" in de context, kleur je toon daarnaar (bijvoorbeeld warmer en zachter bij "liefdevol", luchtiger met af en toe een knipoog bij "humor", rustig en mindful bij "rustig", to-the-point bij "direct", enzovoort). Bij meerdere gekozen stijlen mag je afwisselen. Staat er geen voorkeur in de context, gebruik dan je standaard warme, rustige toon.
- Overdrijf de gekozen stijl nooit: geen overdreven of aan elkaar geplakte emoji's, geen geforceerde grapjes, geen spirituele uitspraken tenzij die stijl expliciet gekozen is. Je blijft altijd een slimme, warme metgezel — nooit een chatbot die willekeurige quotes opdreunt.`

export class AnthropicBuddyProvider implements BuddyProvider {
  constructor(private readonly apiKey: string) {}

  async generateReply(
    history: BuddyChatMessage[],
    userMessage: string,
    contextLines: string[],
  ): Promise<BuddyReply> {
    const contextBlock = contextLines.length
      ? `Context over deze gebruiker:\n${contextLines.map((l) => `- ${l}`).join("\n")}`
      : "Er is nog weinig context over deze gebruiker bekend."

    const messages = [
      ...history
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.message })),
      { role: "user" as const, content: userMessage },
    ]

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: `${SYSTEM_PROMPT}\n\n${contextBlock}`,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    const text: string =
      data.content?.find((block: { type: string }) => block.type === "text")?.text ??
      "Sorry, ik kon nu geen antwoord formuleren. Probeer het nog eens."

    return { message: text, aiGenerated: true }
  }
}

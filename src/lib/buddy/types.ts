export interface BuddyChatMessage {
  role: "user" | "assistant" | "system"
  message: string
}

export interface BuddyReply {
  message: string
  /**
   * True only when the reply came from a real, connected AI provider.
   * The UI and provider implementations must never set this to true for a
   * templated/rule-based fallback response — we don't pretend a scripted
   * reply is an AI-generated one.
   */
  aiGenerated: boolean
}

export interface BuddyProvider {
  generateReply(
    history: BuddyChatMessage[],
    userMessage: string,
    contextLines: string[],
  ): Promise<BuddyReply>
}

import type { BuddyProvider } from "./types"
import { RuleBasedBuddyProvider } from "./rule-based-provider"
import { AnthropicBuddyProvider } from "./anthropic-provider"

/** AI is only used when an API key exists AND the user gave Buddy-AI consent. */
export function getBuddyProvider(options?: { allowAi?: boolean }): BuddyProvider {
  const apiKey = process.env.BUDDY_AI_API_KEY
  if (apiKey && options?.allowAi) {
    return new AnthropicBuddyProvider(apiKey)
  }
  return new RuleBasedBuddyProvider()
}

export function isBuddyAiConfigured(): boolean {
  return Boolean(process.env.BUDDY_AI_API_KEY)
}

export type { BuddyChatMessage, BuddyReply, BuddyProvider } from "./types"

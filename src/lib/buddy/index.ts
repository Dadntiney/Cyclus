import type { BuddyProvider } from "./types"
import { RuleBasedBuddyProvider } from "./rule-based-provider"
import { AnthropicBuddyProvider } from "./anthropic-provider"

export function getBuddyProvider(): BuddyProvider {
  const apiKey = process.env.BUDDY_AI_API_KEY
  if (apiKey) {
    return new AnthropicBuddyProvider(apiKey)
  }
  return new RuleBasedBuddyProvider()
}

export type { BuddyChatMessage, BuddyReply, BuddyProvider } from "./types"

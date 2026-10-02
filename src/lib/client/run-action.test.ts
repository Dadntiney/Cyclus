import { describe, expect, it } from "vitest"
import { OFFLINE_ACTION_MESSAGE, runAction } from "@/lib/client/run-action"

describe("runAction", () => {
  it("passes results through", async () => {
    await expect(runAction(async () => ({ success: true }))).resolves.toEqual({ success: true })
  })

  it("turns a network failure into a friendly error", async () => {
    await expect(
      runAction(async () => {
        throw new TypeError("Failed to fetch")
      }),
    ).resolves.toEqual({ error: OFFLINE_ACTION_MESSAGE })
  })

  it("lets Next.js redirects through", async () => {
    const redirect = Object.assign(new Error("NEXT_REDIRECT"), { digest: "NEXT_REDIRECT;replace;/login;307;" })
    await expect(
      runAction(async () => {
        throw redirect
      }),
    ).rejects.toBe(redirect)
  })
})

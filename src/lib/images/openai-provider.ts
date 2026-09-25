import "server-only"

// One fixed style block appended to every prompt so all recipe photos read
// as a single, consistent editorial food-photography series — only the
// dish description changes per recipe.
const STYLE_SUFFIX = `
Professional editorial food photography, shot for a premium food magazine.
Photorealistic, soft natural studio lighting, gentle shadows, shallow depth
of field. Overhead-to-45-degree angle, centered composition, generous
negative space. Calm, elegant, minimal neutral backdrop (soft warm cream
and sage tones), a single simple plate or bowl, no busy props. Natural,
appetizing food textures — not artificial, not overly glossy or saturated.
No text, no logos, no watermarks, no people, no hands, no cutlery clutter,
no excessive decoration.
`.trim()

function buildPrompt(title: string, description: string | null, ingredients: string[]): string {
  const ingredientHint = ingredients.length
    ? ` Key ingredients visible: ${ingredients.slice(0, 6).join(", ")}.`
    : ""
  const descriptionHint = description ? ` ${description}` : ""
  return `A dish of "${title}".${descriptionHint}${ingredientHint}\n\n${STYLE_SUFFIX}`
}

export interface GeneratedImage {
  base64: string
  contentType: string
}

/**
 * Generates one recipe photo via the OpenAI Images API. Server-only —
 * the API key must never reach client code.
 */
export async function generateRecipeImage(
  title: string,
  description: string | null,
  ingredients: string[],
): Promise<GeneratedImage> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.")
  }

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: buildPrompt(title, description, ingredients),
      size: "1024x1024",
      quality: "high",
      n: 1,
    }),
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(`OpenAI image generation failed (${response.status}): ${detail.slice(0, 300)}`)
  }

  const data = await response.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) {
    throw new Error("OpenAI image generation returned no image data.")
  }

  return { base64: b64, contentType: "image/png" }
}

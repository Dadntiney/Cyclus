/**
 * Structure for a Kennis article body (plain text from the database):
 * paragraphs split by a blank line, "• " / "- " lines as a list, a line in
 * **bold** or a short line above text as a subheading, and one inline
 * list ("Veelvoorkomende signalen: opvliegers, nachtelijk zweten, …") as a
 * real list (WB-7). The words stay the same; only the shape changes.
 */

export type ArticleBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; label?: string; items: string[] }

const BULLET = /^[•\-*]\s+/
const BOLD_LINE = /^\*\*(.+?)\*\*$/
const SENTENCE_END = /[.!?:;]$/

/** A short line without closing punctuation, followed by more text: a subheading. */
function isShortHeading(line: string) {
  return line.length <= 60 && !SENTENCE_END.test(line) && !BULLET.test(line)
}

function headingText(text: string) {
  return text.replace(/:$/, "").trim()
}

/** "a, b (c, d), e" → ["a", "b (c, d)", "e"]; null when the parentheses don't add up. */
function splitOutsideParentheses(text: string): string[] | null {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === "(") depth++
    else if (char === ")") depth--
    if (depth < 0) return null
    if (char === "," && depth === 0) {
      parts.push(text.slice(start, i).trim())
      start = i + 1
    }
  }
  if (depth !== 0) return null
  parts.push(text.slice(start).trim())
  return parts
}

/**
 * "Label: a, b, c en d." → label + items, only when it clearly is a list:
 * a short label, at least three short items without punctuation.
 */
export function splitInlineList(sentence: string): { label: string; items: string[] } | null {
  const match = /^([A-ZÀ-Ý][^:,.!?]{1,40}):\s+(.+)\.$/.exec(sentence.trim())
  if (!match) return null
  const [, label, rest] = match
  if (label.split(/\s+/).length > 6) return null

  const parts = splitOutsideParentheses(rest)
  if (!parts) return null
  const last = parts.pop() ?? ""
  // The last comma part often joins two items: "brain fog of een ander gevoel".
  const tail = /^(.+?)\s+(?:en|of)\s+(.+)$/.exec(last)
  if (tail && parts.length) parts.push(tail[1], tail[2])
  else parts.push(last)

  const items = parts.map((item) => item.replace(/^(?:en|of)\s+/, "").trim()).filter(Boolean)
  if (items.length < 3) return null
  if (items.some((item) => item.length > 60 || /[.!?:;]/.test(item))) return null
  return { label: label.trim(), items }
}

/** A sentence inside a paragraph that is an inline list becomes a list; the sentences around it stay text. */
function paragraphBlocks(text: string): ArticleBlock[] {
  const sentences = text.split(/(?<=\.)\s+(?=[A-ZÀ-Ý])/)
  const lists = sentences.map(splitInlineList)
  if (lists.every((list) => list === null)) return [{ type: "paragraph", text }]

  const blocks: ArticleBlock[] = []
  let pending: string[] = []
  const flush = () => {
    if (pending.length) blocks.push({ type: "paragraph", text: pending.join(" ") })
    pending = []
  }
  sentences.forEach((sentence, i) => {
    const list = lists[i]
    if (!list) {
      pending.push(sentence)
      return
    }
    flush()
    blocks.push({ type: "list", label: list.label, items: list.items })
  })
  flush()
  return blocks
}

export function parseArticleBody(body: string): ArticleBlock[] {
  const blocks: ArticleBlock[] = []
  const chunks = body.replace(/\r\n?/g, "\n").split(/\n\s*\n/)

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)

    lines.forEach((line, i) => {
      const bold = BOLD_LINE.exec(line)
      if (bold) {
        blocks.push({ type: "heading", text: headingText(bold[1]) })
        return
      }
      if (BULLET.test(line)) {
        const item = line.replace(BULLET, "")
        const previous = blocks[blocks.length - 1]
        if (previous?.type === "list" && i > 0 && BULLET.test(lines[i - 1])) previous.items.push(item)
        else blocks.push({ type: "list", items: [item] })
        return
      }
      if (i < lines.length - 1 && isShortHeading(line)) {
        blocks.push({ type: "heading", text: line })
        return
      }
      blocks.push(...paragraphBlocks(line))
    })
  }

  return blocks
}

/** "**sterk**" inside a sentence → bold segments; the asterisks never show. */
export function inlineSegments(text: string): { text: string; strong: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter(Boolean)
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4
        ? { text: part.slice(2, -2), strong: true }
        : { text: part, strong: false },
    )
}

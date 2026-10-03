import { inlineSegments, parseArticleBody } from "./article-body"

function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineSegments(text).map((segment, i) =>
        segment.strong ? (
          <strong key={i} className="font-semibold">
            {segment.text}
          </strong>
        ) : (
          segment.text
        ),
      )}
    </>
  )
}

/** A Kennis article body with subheadings, paragraphs and lists (see article-body.ts). */
export function ArticleContent({ body }: { body: string }) {
  const blocks = parseArticleBody(body)
  return (
    <div className="flex flex-col gap-4 type-body-lg text-ink">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className="mt-2 type-card-title text-ink">
              <Inline text={block.text} />
            </h2>
          )
        }
        if (block.type === "list") {
          return (
            <div key={i}>
              {block.label && <p className="mb-2">{block.label}:</p>}
              <ul className="flex flex-col gap-1.5 pl-5 list-disc marker:text-sage">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            </div>
          )
        }
        return (
          <p key={i}>
            <Inline text={block.text} />
          </p>
        )
      })}
    </div>
  )
}

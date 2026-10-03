import Image from "next/image"
import { RecipeMedia } from "@/components/nutrition/recipe-media"
import { cn } from "@/lib/utils"

interface RecipeImageProps {
  title: string
  imageUrl: string | null
  /**
   * Alternative text. Defaults to the title; pass "" where the title sits
   * right next to the photo (recipe card, recipe hero), so a screen reader
   * doesn't hear it twice.
   */
  alt?: string
  className?: string
  iconClassName?: string
  sizes?: string
  priority?: boolean
}

/** Recipe photo when available, otherwise the illustrated placeholder. */
export function RecipeImage({
  title,
  imageUrl,
  alt,
  className,
  iconClassName,
  sizes,
  priority,
}: RecipeImageProps) {
  if (!imageUrl) {
    return <RecipeMedia title={title} className={className} iconClassName={iconClassName} />
  }

  return (
    <div className={cn("relative overflow-hidden bg-cream-soft", className)}>
      <Image
        src={imageUrl}
        alt={alt ?? title}
        fill
        sizes={sizes ?? "(min-width: 640px) 50vw, 100vw"}
        // Photos come from different sources/photographers; a shared,
        // subtle grade nudges them toward reading as one consistent set
        // instead of a visibly mismatched collage.
        className="object-cover [filter:saturate(0.94)_contrast(1.03)_brightness(1.01)]"
        priority={priority}
      />
    </div>
  )
}

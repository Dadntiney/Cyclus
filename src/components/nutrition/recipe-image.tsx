import Image from "next/image"
import { RecipeMedia } from "@/components/nutrition/recipe-media"
import { cn } from "@/lib/utils"

interface RecipeImageProps {
  title: string
  imageUrl: string | null
  className?: string
  iconClassName?: string
  sizes?: string
  priority?: boolean
}

/** AI-generated recipe photo when available, otherwise the illustrated placeholder. */
export function RecipeImage({
  title,
  imageUrl,
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
        alt={title}
        fill
        sizes={sizes ?? "(min-width: 640px) 50vw, 100vw"}
        className="object-cover"
        priority={priority}
      />
    </div>
  )
}

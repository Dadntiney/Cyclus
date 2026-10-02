import Image from "next/image"
import { WorkoutMedia } from "@/components/training/workout-media"
import { cn } from "@/lib/utils"

interface WorkoutImageProps {
  type: string
  title?: string
  imageUrl: string | null
  className?: string
  iconClassName?: string
  sizes?: string
  priority?: boolean
}

/**
 * Off until there is a curated photo set that fits the audience (women 30+,
 * calm, at home or outdoors). The current stock mix included gym photos of
 * men and alternated with illustrations, which the usertest flagged; the
 * illustration system alone reads as one consistent series.
 */
export const SHOW_WORKOUT_PHOTOS = false

/** Workout photo when enabled and available, otherwise the illustration. */
export function WorkoutImage({
  type,
  title,
  imageUrl,
  className,
  iconClassName,
  sizes,
  priority,
}: WorkoutImageProps) {
  if (!SHOW_WORKOUT_PHOTOS || !imageUrl) {
    return <WorkoutMedia type={type} className={className} iconClassName={iconClassName} />
  }

  return (
    <div className={cn("relative overflow-hidden bg-cream-soft", className)}>
      <Image
        src={imageUrl}
        alt={title ?? "Training"}
        fill
        sizes={sizes ?? "(min-width: 640px) 50vw, 100vw"}
        // Same shared grade as RecipeImage, so photos from different
        // sources still read as one consistent series.
        className="object-cover [filter:saturate(0.94)_contrast(1.03)_brightness(1.01)]"
        priority={priority}
      />
    </div>
  )
}

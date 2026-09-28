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

/** Workout photo when available, otherwise the illustrated placeholder. */
export function WorkoutImage({
  type,
  title,
  imageUrl,
  className,
  iconClassName,
  sizes,
  priority,
}: WorkoutImageProps) {
  if (!imageUrl) {
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

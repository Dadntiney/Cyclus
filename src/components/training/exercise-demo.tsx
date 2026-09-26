import Image from "next/image"
import { ExerciseMedia } from "@/components/training/exercise-media"
import { cn } from "@/lib/utils"

interface ExerciseDemoProps {
  name: string
  muscleGroup: string | null
  videoUrl: string | null
  imageUrl: string | null
  className?: string
  iconClassName?: string
}

/**
 * Visual explanation for one exercise: a short looping demo video when
 * available (muted/autoplay so it behaves like a GIF at a fraction of the
 * data size), otherwise a static photo, otherwise the illustrated
 * placeholder — so the app looks finished even for exercises that don't
 * have real media yet.
 */
export function ExerciseDemo({
  name,
  muscleGroup,
  videoUrl,
  imageUrl,
  className,
  iconClassName,
}: ExerciseDemoProps) {
  if (videoUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-cream-soft", className)}>
        <video
          src={videoUrl}
          poster={imageUrl ?? undefined}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`Demonstratie van ${name}`}
        />
      </div>
    )
  }

  if (imageUrl) {
    return (
      <div className={cn("relative overflow-hidden bg-cream-soft", className)}>
        <Image
          src={imageUrl}
          alt={`Uitvoering van ${name}`}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    )
  }

  return (
    <ExerciseMedia name={name} muscleGroup={muscleGroup} className={className} iconClassName={iconClassName} />
  )
}

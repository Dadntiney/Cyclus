import { Lightbulb, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { EmptyState } from "@/components/ui/empty-state"
import {
  MIN_CHECKINS_FOR_INSIGHTS,
  type PersonalInsight,
} from "@/lib/cycle/insights"

export function PersonalInsights({
  insights,
  checkinCount,
}: {
  insights: PersonalInsight[]
  checkinCount: number
}) {
  const needsMoreData = checkinCount < MIN_CHECKINS_FOR_INSIGHTS

  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-1">Persoonlijke inzichten</h2>
      <p className="text-sm text-ink-soft mb-3">
        Verbanden tussen je check-ins — geen diagnose, wel herkenning.
      </p>

      {needsMoreData ? (
        <Card>
          <EmptyState
            icon={<Sparkles className="h-6 w-6" />}
            title="Nog te weinig gegevens."
            description={`Vul nog ${MIN_CHECKINS_FOR_INSIGHTS - checkinCount} check-in${MIN_CHECKINS_FOR_INSIGHTS - checkinCount === 1 ? "" : "s"} in op Vandaag. Daarna kunnen we verbanden tonen.`}
          />
        </Card>
      ) : insights.length ? (
        <Card className="p-0 divide-y divide-line">
          {insights.map((insight) => (
            <div key={insight.id} className="flex gap-3 px-5 py-3.5">
              <Lightbulb
                className="h-4 w-4 shrink-0 text-sage-dark mt-0.5"
                strokeWidth={1.75}
              />
              <p className="text-sm text-ink">{insight.text}</p>
            </div>
          ))}
          <p className="px-5 py-3 text-xs text-ink-soft">
            Gebaseerd op je eigen check-ins. Patronen kunnen veranderen naarmate je meer
            bijhoudt.
          </p>
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={<Lightbulb className="h-6 w-6" />}
            title="Nog geen duidelijke verbanden."
            description="Blijf je check-ins invullen. Zodra er een helder patroon ontstaat, zie je het hier."
          />
        </Card>
      )}
    </div>
  )
}

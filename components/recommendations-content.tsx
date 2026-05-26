"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRecommendations, usePredictions } from "@/hooks/use-predictions"
import { Spinner } from "@/components/ui/spinner"
import { TrendingUp, Percent, Pause, CheckCircle2, AlertTriangle } from "lucide-react"
import { ReportGenerator } from "@/components/report-generator"
import { cn } from "@/lib/utils"

type FilterType = "all" | "increase_stock" | "promotion" | "maintain"

export function RecommendationsContent() {
  const { teams, isLoading: teamsLoading } = usePredictions()
  const { recommendations, isLoading: recsLoading, applyRecommendation, refresh } = useRecommendations()
  const [filter, setFilter] = useState<FilterType>("all")
  const [applying, setApplying] = useState<string | null>(null)

  const isLoading = teamsLoading || recsLoading

  if (isLoading || !recommendations || !teams) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const filteredRecs = filter === "all"
    ? recommendations
    : recommendations.filter((r: { action: string }) => r.action === filter)

  const increaseCount = recommendations.filter((r: { action: string }) => r.action === "increase_stock").length
  const promotionCount = recommendations.filter((r: { action: string }) => r.action === "promotion").length
  const maintainCount = recommendations.filter((r: { action: string }) => r.action === "maintain").length

  const handleApplyAction = async (recId: string, currentApplied: boolean) => {
    setApplying(recId)
    await applyRecommendation(recId, !currentApplied)
    await refresh()
    setApplying(null)
  }

  const getRecommendationIcon = (action: string) => {
    switch (action) {
      case "increase_stock":
        return <TrendingUp className="h-5 w-5 text-accent" />
      case "promotion":
        return <Percent className="h-5 w-5 text-orange-600" />
      default:
        return <Pause className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getRecommendationLabel = (action: string) => {
    switch (action) {
      case "increase_stock":
        return "Aumentar Stock"
      case "promotion":
        return "Poner en Promocion"
      default:
        return "Mantener Stock"
    }
  }

  const getRecommendationStyle = (action: string) => {
    switch (action) {
      case "increase_stock":
        return "border-accent/30 bg-accent/5"
      case "promotion":
        return "border-orange-200 bg-orange-50/50"
      default:
        return "border-muted bg-muted/30"
    }
  }

  const getTeamData = (teamId: string) => {
    return teams.find(t => t.id === teamId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Recomendaciones de Stock</h1>
          <p className="text-sm text-muted-foreground">
            Acciones sugeridas basadas en las probabilidades del modelo ML
          </p>
        </div>
        <ReportGenerator teams={teams} recommendations={recommendations} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filter === "increase_stock" && "ring-2 ring-accent"
          )}
          onClick={() => setFilter(filter === "increase_stock" ? "all" : "increase_stock")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{increaseCount}</p>
              <p className="text-sm text-muted-foreground">Aumentar Stock</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filter === "promotion" && "ring-2 ring-orange-500"
          )}
          onClick={() => setFilter(filter === "promotion" ? "all" : "promotion")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Percent className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{promotionCount}</p>
              <p className="text-sm text-muted-foreground">Poner en Promocion</p>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filter === "maintain" && "ring-2 ring-muted-foreground"
          )}
          onClick={() => setFilter(filter === "maintain" ? "all" : "maintain")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Pause className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{maintainCount}</p>
              <p className="text-sm text-muted-foreground">Mantener Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Indicator */}
      {filter !== "all" && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtrando por:</span>
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            {getRecommendationLabel(filter)}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setFilter("all")}>
            Ver todos
          </Button>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {filteredRecs.map((rec: { id: string; team_id: string; action: string; reason: string | null; applied: boolean; teams: { name: string; code: string } }) => {
          const teamData = getTeamData(rec.team_id)
          const isApplying = applying === rec.id

          return (
            <Card key={rec.id} className={cn("transition-all", getRecommendationStyle(rec.action))}>
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Team Info */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
                      {rec.teams?.code || '??'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{rec.teams?.name || 'Equipo'}</h3>
                      <p className="text-sm text-muted-foreground">
                        Prob. Cuartos: {Math.round((teamData?.prediction?.probability_quarterfinals ?? 0) * 100)}% | 
                        Stock actual: {teamData?.inventory?.current_stock ?? 0} unidades
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(rec.action)}
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {getRecommendationLabel(rec.action)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rec.action === "increase_stock" && "+50-100 unidades"}
                          {rec.action === "promotion" && "15-30% descuento"}
                          {rec.action === "maintain" && "Sin cambios"}
                        </p>
                      </div>
                    </div>

                    {rec.applied ? (
                      <Button
                        variant="outline"
                        className="border-accent bg-accent/10 text-accent hover:bg-accent/20"
                        onClick={() => handleApplyAction(rec.id, rec.applied)}
                        disabled={isApplying}
                      >
                        {isApplying ? (
                          <Spinner className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        Aplicado
                      </Button>
                    ) : (
                      <Button
                        variant={rec.action === "increase_stock" ? "default" : "outline"}
                        onClick={() => handleApplyAction(rec.id, rec.applied)}
                        disabled={isApplying}
                      >
                        {isApplying && <Spinner className="mr-2 h-4 w-4" />}
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {rec.reason && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-background/50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredRecs.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No hay recomendaciones en esta categoria.</p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePredictions } from "@/hooks/use-predictions"
import { Spinner } from "@/components/ui/spinner"
import { TrendingUp, Percent, Pause, CheckCircle2, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type FilterType = "all" | "increase_stock" | "promotion" | "hold"

export function RecommendationsContent() {
  const { predictions, isLoading } = usePredictions()
  const [filter, setFilter] = useState<FilterType>("all")
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set())

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const filteredPredictions = filter === "all"
    ? predictions
    : predictions.filter(p => p.recommendation === filter)

  const increaseCount = predictions.filter(p => p.recommendation === "increase_stock").length
  const promotionCount = predictions.filter(p => p.recommendation === "promotion").length
  const holdCount = predictions.filter(p => p.recommendation === "hold").length

  const handleApplyAction = (teamId: string) => {
    setAppliedActions(prev => new Set([...prev, teamId]))
  }

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case "increase_stock":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "promotion":
        return <Percent className="h-5 w-5 text-orange-600" />
      default:
        return <Pause className="h-5 w-5 text-gray-600" />
    }
  }

  const getRecommendationLabel = (rec: string) => {
    switch (rec) {
      case "increase_stock":
        return "Aumentar Stock"
      case "promotion":
        return "Poner en Promocion"
      default:
        return "Mantener Stock"
    }
  }

  const getRecommendationStyle = (rec: string) => {
    switch (rec) {
      case "increase_stock":
        return "border-green-200 bg-green-50/50"
      case "promotion":
        return "border-orange-200 bg-orange-50/50"
      default:
        return "border-gray-200 bg-gray-50/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Recomendaciones de Stock</h1>
        <p className="text-sm text-muted-foreground">
          Acciones sugeridas basadas en las probabilidades del modelo ML
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card
          className={cn(
            "cursor-pointer transition-all hover:shadow-md",
            filter === "increase_stock" && "ring-2 ring-green-500"
          )}
          onClick={() => setFilter(filter === "increase_stock" ? "all" : "increase_stock")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
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
            filter === "hold" && "ring-2 ring-gray-500"
          )}
          onClick={() => setFilter(filter === "hold" ? "all" : "hold")}
        >
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <Pause className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{holdCount}</p>
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
        {filteredPredictions.map((prediction) => {
          const isApplied = appliedActions.has(prediction.id)

          return (
            <Card key={prediction.id} className={cn("transition-all", getRecommendationStyle(prediction.recommendation))}>
              <CardContent className="py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Team Info */}
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{prediction.flag_emoji}</span>
                    <div>
                      <h3 className="font-semibold text-foreground">{prediction.team}</h3>
                      <p className="text-sm text-muted-foreground">
                        Prob. Cuartos: {Math.round(prediction.probability_advance_quarters * 100)}% | 
                        Stock actual: {prediction.current_stock} unidades
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getRecommendationIcon(prediction.recommendation)}
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {getRecommendationLabel(prediction.recommendation)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prediction.recommendation === "increase_stock" && "+50-100 unidades"}
                          {prediction.recommendation === "promotion" && "15-30% descuento"}
                          {prediction.recommendation === "hold" && "Sin cambios"}
                        </p>
                      </div>
                    </div>

                    {isApplied ? (
                      <div className="flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-700">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Aplicado</span>
                      </div>
                    ) : (
                      <Button
                        variant={prediction.recommendation === "increase_stock" ? "default" : "outline"}
                        onClick={() => handleApplyAction(prediction.id)}
                      >
                        Aplicar
                      </Button>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-background/50 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{prediction.recommendation_reason}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPredictions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No hay recomendaciones en esta categoria.</p>
        </div>
      )}
    </div>
  )
}

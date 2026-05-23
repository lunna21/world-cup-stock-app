"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePredictions } from "@/hooks/use-predictions"
import { Spinner } from "@/components/ui/spinner"
import { Search, ArrowUpDown, Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SortField = "team" | "probability_advance_quarters" | "probability_champion"
type SortOrder = "asc" | "desc"

export function PredictionsContent() {
  const { predictions, modelVersion, isLoading } = usePredictions()
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("probability_advance_quarters")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const filteredPredictions = predictions
    .filter(p => p.team.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortOrder === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal)
    })

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return "text-green-600 bg-green-50"
    if (prob >= 0.5) return "text-yellow-600 bg-yellow-50"
    return "text-orange-600 bg-orange-50"
  }

  const getProbabilityBarWidth = (prob: number) => `${prob * 100}%`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Predicciones del Modelo</h1>
        <p className="text-sm text-muted-foreground">
          Probabilidades generadas por ML para el avance de cada seleccion - Modelo {modelVersion}
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-5 w-5 text-blue-600" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">Criterio de Decision</p>
            <p className="text-blue-700">
              Las selecciones con probabilidad mayor al 50% de avanzar de cuartos de final se recomiendan para 
              <span className="font-semibold"> aumentar stock</span>. Las que tienen menos del 50% se consideran para 
              <span className="font-semibold"> promocion</span> cuando sean eliminadas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Search and Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar seleccion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={sortField === "probability_advance_quarters" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("probability_advance_quarters")}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Por Prob. Cuartos
          </Button>
          <Button
            variant={sortField === "probability_champion" ? "default" : "outline"}
            size="sm"
            onClick={() => handleSort("probability_champion")}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Por Prob. Campeon
          </Button>
        </div>
      </div>

      {/* Predictions Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredPredictions.map((prediction) => (
          <Card key={prediction.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{prediction.flag_emoji}</span>
                  <div>
                    <CardTitle className="text-base">{prediction.team}</CardTitle>
                    <span className="text-xs text-muted-foreground">Grupo {prediction.group}</span>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        prediction.probability_advance_quarters >= 0.5 
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      )}>
                        {prediction.probability_advance_quarters >= 0.5 ? "Avanza" : "En riesgo"}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Prediccion basada en el umbral del 50%</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Probability Bars */}
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Cuartos de Final</span>
                    <span className={cn("font-medium", getProbabilityColor(prediction.probability_advance_quarters))}>
                      {Math.round(prediction.probability_advance_quarters * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{ width: getProbabilityBarWidth(prediction.probability_advance_quarters) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Semifinales</span>
                    <span className="font-medium text-foreground">
                      {Math.round(prediction.probability_advance_semis * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{ width: getProbabilityBarWidth(prediction.probability_advance_semis) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Final</span>
                    <span className="font-medium text-foreground">
                      {Math.round(prediction.probability_advance_final * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-purple-500 transition-all"
                      style={{ width: getProbabilityBarWidth(prediction.probability_advance_final) }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="text-muted-foreground">Campeon</span>
                    <span className="font-medium text-foreground">
                      {Math.round(prediction.probability_champion * 100)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all"
                      style={{ width: getProbabilityBarWidth(prediction.probability_champion) }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPredictions.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No se encontraron selecciones con ese nombre.</p>
        </div>
      )}
    </div>
  )
}

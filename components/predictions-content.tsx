"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePredictions } from "@/hooks/use-predictions";
import { Spinner } from "@/components/ui/spinner";
import { Search, ArrowUpDown, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TeamWithDetails } from "@/lib/types";

type SortField = "name" | "probability_quarterfinals" | "probability_champion";
type SortOrder = "asc" | "desc";

export function PredictionsContent() {
  const { teams, modelVersion, isLoading } = usePredictions();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>(
    "probability_quarterfinals",
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  if (isLoading || !teams) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const getSortValue = (
    team: TeamWithDetails,
    field: SortField,
  ): number | string => {
    if (field === "name") return team.name;
    if (field === "probability_quarterfinals")
      return team.prediction?.probability_quarterfinals ?? 0;
    if (field === "probability_champion")
      return team.prediction?.probability_champion ?? 0;
    return 0;
  };

  const filteredTeams = teams
    .filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = getSortValue(a, sortField);
      const bVal = getSortValue(b, sortField);
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortOrder === "asc"
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const getProbabilityColor = (prob: number) => {
    if (prob >= 0.7) return "text-green-600 bg-green-50";
    if (prob >= 0.5) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  const getProbabilityBarWidth = (prob: number) => `${prob * 100}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Predicciones del Modelo
        </h1>
        <p className="text-sm text-muted-foreground">
          Probabilidades generadas por ML para el avance de cada seleccion -
          Modelo {modelVersion}
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="mt-0.5 h-5 w-5 text-primary" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Criterio de Decision</p>
            <p className="text-muted-foreground">
              Las selecciones con probabilidad mayor al 50% de avanzar de
              cuartos de final se recomiendan para
              <span className="font-semibold text-accent"> aumentar stock</span>
              . Las que tienen menos del 50% se consideran para
              <span className="font-semibold text-orange-600">
                {" "}
                promoción
              </span>{" "}
              cuando sean eliminadas.
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
            variant={
              sortField === "probability_quarterfinals" ? "default" : "outline"
            }
            size="sm"
            onClick={() => handleSort("probability_quarterfinals")}
          >
            <ArrowUpDown className="mr-2 h-4 w-4" />
            Por Prob. Cuartos
          </Button>
          <Button
            variant={
              sortField === "probability_champion" ? "default" : "outline"
            }
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
        {filteredTeams.map((team) => (
          <Card key={team.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg font-bold text-muted-foreground">
                    {team.code}
                  </div>
                  <div>
                    <CardTitle className="text-base">{team.name}</CardTitle>
                    <span className="text-xs text-muted-foreground">
                      {team.confederation}
                    </span>
                  </div>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div
                        className={cn(
                          "rounded-full px-2 py-1 text-xs font-medium",
                          (team.prediction?.probability_quarterfinals ?? 0) >=
                            0.5
                            ? "bg-accent/20 text-accent"
                            : "bg-orange-100 text-orange-700",
                        )}
                      >
                        {(team.prediction?.probability_quarterfinals ?? 0) >=
                        0.5
                          ? "Avanza"
                          : "En riesgo"}
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
              {team.prediction ? (
                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Cuartos de Final
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          getProbabilityColor(
                            team.prediction.probability_quarterfinals,
                          ),
                        )}
                      >
                        {Math.round(
                          team.prediction.probability_quarterfinals * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-accent transition-all"
                        style={{
                          width: getProbabilityBarWidth(
                            team.prediction.probability_quarterfinals,
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Semifinales</span>
                      <span className="font-medium text-foreground">
                        {Math.round(
                          team.prediction.probability_semifinals * 100,
                        )}
                        %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: getProbabilityBarWidth(
                            team.prediction.probability_semifinals,
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Final</span>
                      <span className="font-medium text-foreground">
                        {Math.round(team.prediction.probability_final * 100)}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-chart-4 transition-all"
                        style={{
                          width: getProbabilityBarWidth(
                            team.prediction.probability_final,
                          ),
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-muted-foreground">Campeon</span>
                      <span className="font-medium text-foreground">
                        {Math.round(team.prediction.probability_champion * 100)}
                        %
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-chart-3 transition-all"
                        style={{
                          width: getProbabilityBarWidth(
                            team.prediction.probability_champion,
                          ),
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin predicciones disponibles
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No se encontraron selecciones con ese nombre.
          </p>
        </div>
      )}
    </div>
  );
}

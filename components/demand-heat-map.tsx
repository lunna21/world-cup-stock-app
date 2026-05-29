"use client"

import { useMemo, useState } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps"
import { teamToCountryCode } from "@/lib/country-codes"
import type { TeamWithPrediction } from "@/lib/types"

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

type Round = "quarterfinals" | "semifinals" | "final" | "champion"

interface DemandHeatMapProps {
  teams: TeamWithPrediction[]
}

// Función para obtener el color basado en la probabilidad y urgencia
function getHeatColor(probability: number, hasTeam: boolean): string {
  if (!hasTeam) return "var(--muted)"
  
  // Escala de urgencia: mayor probabilidad = mayor demanda = más urgente reabastecer
  if (probability >= 0.8) return "#dc2626" // Rojo - Urgencia crítica
  if (probability >= 0.6) return "#ea580c" // Naranja - Urgencia alta
  if (probability >= 0.4) return "#eab308" // Amarillo - Urgencia media
  if (probability >= 0.2) return "#22c55e" // Verde - Urgencia baja
  return "#3b82f6" // Azul - Sin urgencia (promoción)
}

// Mapeo de ISO numéricos a códigos ISO alfa-3
const numericToAlpha3: Record<string, string> = {
  "032": "ARG", "076": "BRA", "250": "FRA", "826": "GBR", "276": "DEU",
  "724": "ESP", "620": "PRT", "528": "NLD", "380": "ITA", "056": "BEL",
  "858": "URY", "170": "COL", "484": "MEX", "840": "USA", "124": "CAN",
  "392": "JPN", "410": "KOR", "036": "AUS", "504": "MAR", "686": "SEN",
}

export function DemandHeatMap({ teams }: DemandHeatMapProps) {
  const [selectedRound, setSelectedRound] = useState<Round>("quarterfinals")
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  const rounds: { key: Round; label: string }[] = [
    { key: "quarterfinals", label: "Cuartos" },
    { key: "semifinals", label: "Semifinales" },
    { key: "final", label: "Final" },
    { key: "champion", label: "Campeón" },
  ]

  // Crear mapa de ISO a datos del equipo
  const teamDataByIso = useMemo(() => {
    const map = new Map<string, TeamWithPrediction>()
    teams.forEach((team) => {
      const isoCode = teamToCountryCode[team.code]
      if (isoCode) {
        map.set(isoCode, team)
      }
    })
    return map
  }, [teams])

  const getProbability = (team: TeamWithPrediction, round: Round): number => {
    switch (round) {
      case "quarterfinals":
        return team.prediction?.probability_quarterfinals ?? 0
      case "semifinals":
        return team.prediction?.probability_semifinals ?? 0
      case "final":
        return team.prediction?.probability_final ?? 0
      case "champion":
        return team.prediction?.probability_champion ?? 0
      default:
        return 0
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Mapa de Demanda Proyectada
          </h3>
          <p className="text-sm text-muted-foreground">
            Urgencia de reabastecimiento por selección
          </p>
        </div>
        <div className="flex gap-2">
          {rounds.map((round) => (
            <button
              key={round.key}
              onClick={() => setSelectedRound(round.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                selectedRound === round.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {round.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <ComposableMap
          projectionConfig={{
            scale: 147,
            center: [0, 20],
          }}
          className="h-[400px] w-full"
        >
          <ZoomableGroup>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const isoNumeric = geo.id
                  const isoAlpha = numericToAlpha3[isoNumeric]
                  const team = isoAlpha ? teamDataByIso.get(isoAlpha) : undefined
                  const probability = team
                    ? getProbability(team, selectedRound)
                    : 0
                  const hasTeam = !!team

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getHeatColor(probability, hasTeam)}
                      stroke="var(--border)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: {
                          outline: "none",
                          fill: hasTeam ? "#1e40af" : "var(--muted)",
                          cursor: hasTeam ? "pointer" : "default",
                        },
                        pressed: { outline: "none" },
                      }}
                      onMouseEnter={(evt) => {
                        if (team) {
                          setTooltipContent(
                            `${team.name}: ${(probability * 100).toFixed(0)}% - Stock: ${team.inventory?.current_stock ?? 0}`
                          )
                          setTooltipPosition({
                            x: evt.clientX,
                            y: evt.clientY,
                          })
                        }
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("")
                      }}
                    />
                  )
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {tooltipContent && (
          <div
            className="pointer-events-none fixed z-50 rounded-lg bg-foreground px-3 py-2 text-sm text-background shadow-lg"
            style={{
              left: tooltipPosition.x + 10,
              top: tooltipPosition.y - 30,
            }}
          >
            {tooltipContent}
          </div>
        )}
      </div>

      {/* Leyenda */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#dc2626]" />
          <span className="text-muted-foreground">Crítica ({">"}80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#ea580c]" />
          <span className="text-muted-foreground">Alta (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#eab308]" />
          <span className="text-muted-foreground">Media (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#22c55e]" />
          <span className="text-muted-foreground">Baja (20-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-[#3b82f6]" />
          <span className="text-muted-foreground">Promoción ({"<"}20%)</span>
        </div>
      </div>
    </div>
  )
}

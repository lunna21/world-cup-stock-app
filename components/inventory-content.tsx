"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePredictions, useInventory } from "@/hooks/use-predictions"
import { Spinner } from "@/components/ui/spinner"
import { Search, Shirt, TrendingUp, Percent, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeamWithDetails } from "@/lib/types"

export function InventoryContent() {
  const { teams, isLoading: teamsLoading } = usePredictions()
  const { updateStock, isLoading: invLoading } = useInventory()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)

  const isLoading = teamsLoading || invLoading

  if (isLoading || !teams) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const filteredTeams = teams.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleEditStart = (team: TeamWithDetails) => {
    setEditingId(team.id)
    setEditValue((team.inventory?.current_stock ?? 0).toString())
  }

  const handleEditSave = async (teamId: string) => {
    const newValue = parseInt(editValue, 10)
    if (!isNaN(newValue) && newValue >= 0) {
      setSaving(true)
      await updateStock(teamId, newValue)
      setSaving(false)
    }
    setEditingId(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const totalStock = teams.reduce((sum, t) => sum + (t.inventory?.current_stock ?? 0), 0)
  const avgStock = teams.length > 0 ? Math.round(totalStock / teams.length) : 0

  const getStockStatus = (team: TeamWithDetails) => {
    const stock = team.inventory?.current_stock ?? 0
    const status = team.inventory?.status ?? 'normal'

    if (status === 'out_of_stock') return { label: "Sin stock", color: "text-red-600 bg-red-50" }
    if (status === 'low') return { label: "Stock bajo", color: "text-orange-600 bg-orange-50" }
    if (status === 'overstocked') return { label: "Exceso", color: "text-yellow-600 bg-yellow-50" }
    
    if (team.recommendation?.action === "increase_stock") {
      if (stock < 100) return { label: "Stock bajo", color: "text-red-600 bg-red-50" }
      if (stock < 200) return { label: "Stock medio", color: "text-yellow-600 bg-yellow-50" }
      return { label: "Stock alto", color: "text-accent bg-accent/10" }
    }
    
    return { label: "Normal", color: "text-muted-foreground bg-muted" }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventario de Camisetas</h1>
        <p className="text-sm text-muted-foreground">
          Gestiona el stock de camisetas por seleccion del Mundial 2026
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shirt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStock.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Stock Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgStock}</p>
              <p className="text-sm text-muted-foreground">Promedio por Seleccion</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-chart-4/20">
              <Percent className="h-6 w-6 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{teams.length}</p>
              <p className="text-sm text-muted-foreground">Selecciones en Catalogo</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar seleccion..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalle de Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">Seleccion</th>
                  <th className="pb-3 font-medium">Confederacion</th>
                  <th className="pb-3 font-medium">Prob. Cuartos</th>
                  <th className="pb-3 font-medium">Stock Actual</th>
                  <th className="pb-3 font-medium">Precio</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Recomendacion</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTeams.map((team) => {
                  const stockStatus = getStockStatus(team)
                  const currentStock = team.inventory?.current_stock ?? 0
                  const isEditing = editingId === team.id

                  return (
                    <tr key={team.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                            {team.code}
                          </div>
                          <span className="font-medium text-foreground">{team.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{team.confederation || '-'}</td>
                      <td className="py-3">
                        <span className={cn(
                          "font-medium",
                          (team.prediction?.probability_quarterfinals ?? 0) >= 0.5 ? "text-accent" : "text-orange-600"
                        )}>
                          {Math.round((team.prediction?.probability_quarterfinals ?? 0) * 100)}%
                        </span>
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="h-8 w-24"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-foreground">{currentStock}</span>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        ${team.inventory?.unit_price?.toFixed(2) ?? '0.00'}
                      </td>
                      <td className="py-3">
                        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", stockStatus.color)}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {team.recommendation?.action === "increase_stock" && (
                            <>
                              <TrendingUp className="h-4 w-4 text-accent" />
                              <span className="text-accent">Aumentar</span>
                            </>
                          )}
                          {team.recommendation?.action === "promotion" && (
                            <>
                              <Percent className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-600">Promocion</span>
                            </>
                          )}
                          {team.recommendation?.action === "maintain" && (
                            <span className="text-muted-foreground">Mantener</span>
                          )}
                          {!team.recommendation && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSave(team.id)}
                              disabled={saving}
                            >
                              {saving ? <Spinner className="h-4 w-4" /> : <Check className="h-4 w-4 text-accent" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStart(team)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredTeams.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No se encontraron selecciones.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { usePredictions } from "@/hooks/use-predictions"
import { Spinner } from "@/components/ui/spinner"
import { Search, Shirt, TrendingUp, Percent, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TeamPrediction } from "@/lib/types"

export function InventoryContent() {
  const { predictions, isLoading } = usePredictions()
  const [search, setSearch] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [localStock, setLocalStock] = useState<Record<string, number>>({})

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const filteredPredictions = predictions.filter(p =>
    p.team.toLowerCase().includes(search.toLowerCase())
  )

  const getStock = (prediction: TeamPrediction) => {
    return localStock[prediction.id] ?? prediction.current_stock
  }

  const handleEditStart = (prediction: TeamPrediction) => {
    setEditingId(prediction.id)
    setEditValue(getStock(prediction).toString())
  }

  const handleEditSave = (id: string) => {
    const newValue = parseInt(editValue, 10)
    if (!isNaN(newValue) && newValue >= 0) {
      setLocalStock(prev => ({ ...prev, [id]: newValue }))
    }
    setEditingId(null)
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditValue("")
  }

  const totalStock = predictions.reduce((sum, p) => sum + getStock(p), 0)
  const avgStock = Math.round(totalStock / predictions.length)

  const getStockStatus = (prediction: TeamPrediction) => {
    const stock = getStock(prediction)
    if (prediction.recommendation === "increase_stock") {
      if (stock < 300) return { label: "Stock bajo", color: "text-red-600 bg-red-50" }
      if (stock < 500) return { label: "Stock medio", color: "text-yellow-600 bg-yellow-50" }
      return { label: "Stock alto", color: "text-green-600 bg-green-50" }
    }
    if (prediction.recommendation === "promotion") {
      if (stock > 200) return { label: "Exceso", color: "text-orange-600 bg-orange-50" }
      return { label: "Adecuado", color: "text-green-600 bg-green-50" }
    }
    return { label: "Normal", color: "text-gray-600 bg-gray-50" }
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
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Shirt className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalStock.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Stock Total</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{avgStock}</p>
              <p className="text-sm text-muted-foreground">Promedio por Seleccion</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Percent className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{predictions.length}</p>
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
                  <th className="pb-3 font-medium">Grupo</th>
                  <th className="pb-3 font-medium">Prob. Cuartos</th>
                  <th className="pb-3 font-medium">Stock Actual</th>
                  <th className="pb-3 font-medium">Estado</th>
                  <th className="pb-3 font-medium">Recomendacion</th>
                  <th className="pb-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPredictions.map((prediction) => {
                  const stockStatus = getStockStatus(prediction)
                  const currentStock = getStock(prediction)
                  const isEditing = editingId === prediction.id

                  return (
                    <tr key={prediction.id} className="text-sm">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{prediction.flag_emoji}</span>
                          <span className="font-medium text-foreground">{prediction.team}</span>
                        </div>
                      </td>
                      <td className="py-3 text-muted-foreground">{prediction.group}</td>
                      <td className="py-3">
                        <span className={cn(
                          "font-medium",
                          prediction.probability_advance_quarters >= 0.5 ? "text-green-600" : "text-orange-600"
                        )}>
                          {Math.round(prediction.probability_advance_quarters * 100)}%
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
                      <td className="py-3">
                        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", stockStatus.color)}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1">
                          {prediction.recommendation === "increase_stock" && (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600">Aumentar</span>
                            </>
                          )}
                          {prediction.recommendation === "promotion" && (
                            <>
                              <Percent className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-600">Promocion</span>
                            </>
                          )}
                          {prediction.recommendation === "hold" && (
                            <span className="text-gray-600">Mantener</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSave(prediction.id)}
                            >
                              <Check className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleEditCancel}
                            >
                              <X className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStart(prediction)}
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

          {filteredPredictions.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No se encontraron selecciones.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

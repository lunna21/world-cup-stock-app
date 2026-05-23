"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePredictions } from "@/hooks/use-predictions"
import { TrendingUp, TrendingDown, Package, Percent, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts"

export function DashboardContent() {
  const { teams, lastUpdated, isLoading, refresh } = usePredictions()

  if (isLoading || !teams) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  const increaseStock = teams.filter(t => t.recommendation?.action === "increase_stock")
  const promotion = teams.filter(t => t.recommendation?.action === "promotion")
  const maintain = teams.filter(t => t.recommendation?.action === "maintain")

  const totalStock = teams.reduce((sum, t) => sum + (t.inventory?.current_stock ?? 0), 0)
  const avgProbability = teams.length > 0 
    ? teams.reduce((sum, t) => sum + (t.prediction?.probability_quarterfinals ?? 0), 0) / teams.length
    : 0

  const topTeams = [...teams]
    .filter(t => t.prediction)
    .sort((a, b) => (b.prediction?.probability_quarterfinals ?? 0) - (a.prediction?.probability_quarterfinals ?? 0))
    .slice(0, 8)
    .map(t => ({
      name: t.name,
      probability: Math.round((t.prediction?.probability_quarterfinals ?? 0) * 100),
      code: t.code
    }))

  const recommendationData = [
    { name: "Aumentar Stock", value: increaseStock.length, color: "#22c55e" },
    { name: "Promocion", value: promotion.length, color: "#f97316" },
    { name: "Mantener", value: maintain.length, color: "#6b7280" }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Resumen de predicciones y recomendaciones para el Mundial 2026
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refresh()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar datos
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aumentar Stock
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{increaseStock.length}</div>
            <p className="text-xs text-muted-foreground">
              selecciones con alta probabilidad
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En Promocion
            </CardTitle>
            <Percent className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{promotion.length}</div>
            <p className="text-xs text-muted-foreground">
              selecciones para descuento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Total
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalStock.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              camisetas en inventario
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prob. Promedio
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{Math.round(avgProbability * 100)}%</div>
            <p className="text-xs text-muted-foreground">
              de avanzar de cuartos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Teams Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top 8 - Probabilidad de Avanzar de Cuartos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topTeams} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, "Probabilidad"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                    {topTeams.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.probability >= 70 ? "#22c55e" : entry.probability >= 50 ? "#eab308" : "#f97316"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribucion de Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {recommendationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {recommendationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-center text-xs text-muted-foreground">
          Ultima actualizacion: {new Date(lastUpdated).toLocaleString("es-ES")}
        </p>
      )}
    </div>
  )
}

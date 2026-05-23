export interface TeamPrediction {
  id: string
  team: string
  country_code: string
  flag_emoji: string
  group: string
  probability_advance_quarters: number
  probability_advance_semis: number
  probability_advance_final: number
  probability_champion: number
  current_stock: number
  recommendation: "increase_stock" | "promotion" | "hold"
  recommendation_reason: string
}

export interface PredictionResponse {
  predictions: TeamPrediction[]
  last_updated: string
  model_version: string
}

export interface StockAction {
  team_id: string
  action: "increase_stock" | "promotion" | "hold"
  quantity_change?: number
  discount_percentage?: number
}

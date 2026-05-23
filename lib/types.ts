// Database types
export interface Team {
  id: string
  name: string
  code: string
  flag_url: string | null
  confederation: string | null
  created_at: string
}

export interface Prediction {
  id: string
  team_id: string
  probability_quarterfinals: number
  probability_semifinals: number
  probability_final: number
  probability_champion: number
  model_version: string
  predicted_at: string
  created_at: string
  updated_at: string
}

export interface Inventory {
  id: string
  team_id: string
  current_stock: number
  min_stock: number
  max_stock: number
  unit_price: number
  status: 'normal' | 'low' | 'out_of_stock' | 'overstocked'
  created_at: string
  updated_at: string
}

export interface Recommendation {
  id: string
  team_id: string
  prediction_id: string | null
  action: 'increase_stock' | 'promotion' | 'maintain'
  reason: string | null
  priority: number
  applied: boolean
  applied_at: string | null
  created_at: string
}

export interface ActionHistory {
  id: string
  recommendation_id: string | null
  team_id: string
  action_type: string
  previous_stock: number | null
  new_stock: number | null
  notes: string | null
  created_at: string
}

// Combined types for API responses
export interface TeamWithDetails {
  id: string
  name: string
  code: string
  flag_url: string | null
  confederation: string | null
  prediction: {
    probability_quarterfinals: number
    probability_semifinals: number
    probability_final: number
    probability_champion: number
    model_version: string
    predicted_at: string
  } | null
  inventory: {
    current_stock: number
    min_stock: number
    max_stock: number
    unit_price: number
    status: string
  } | null
  recommendation: {
    id: string
    action: 'increase_stock' | 'promotion' | 'maintain'
    reason: string | null
    priority: number
    applied: boolean
  } | null
}

export interface PredictionResponse {
  teams: TeamWithDetails[]
  last_updated: string
  model_version: string
}

export interface StockAction {
  team_id: string
  action: 'increase_stock' | 'promotion' | 'maintain'
  quantity_change?: number
  discount_percentage?: number
}

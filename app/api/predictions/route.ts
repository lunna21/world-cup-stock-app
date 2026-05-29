import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { PredictionResponse, TeamWithDetails } from "@/lib/types"

const DEFAULT_API_URL = "https://world-cup-stock-api-qqes.onrender.com/predictions"

export async function GET() {
  const supabase = await createClient()

  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      code,
      flag_url,
      confederation,
      predictions (
        probability_quarterfinals,
        probability_semifinals,
        probability_final,
        probability_champion,
        model_version,
        predicted_at
      ),
      inventory (
        current_stock,
        min_stock,
        max_stock,
        unit_price,
        status
      ),
      recommendations (
        id,
        action,
        reason,
        priority,
        applied
      )
    `)
    .order('name')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const teamsWithDetails: TeamWithDetails[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    code: team.code,
    flag_url: team.flag_url,
    confederation: team.confederation,
    prediction: team.predictions?.[0] ? {
      probability_quarterfinals: Number(team.predictions[0].probability_quarterfinals),
      probability_semifinals: Number(team.predictions[0].probability_semifinals),
      probability_final: Number(team.predictions[0].probability_final),
      probability_champion: Number(team.predictions[0].probability_champion),
      model_version: team.predictions[0].model_version,
      predicted_at: team.predictions[0].predicted_at
    } : null,
    inventory: team.inventory?.[0] ? {
      current_stock: team.inventory[0].current_stock,
      min_stock: team.inventory[0].min_stock,
      max_stock: team.inventory[0].max_stock,
      unit_price: Number(team.inventory[0].unit_price),
      status: team.inventory[0].status
    } : null,
    recommendation: team.recommendations?.[0] ? {
      id: team.recommendations[0].id,
      action: team.recommendations[0].action,
      reason: team.recommendations[0].reason,
      priority: team.recommendations[0].priority,
      applied: team.recommendations[0].applied
    } : null
  }))

  const response: PredictionResponse = {
    teams: teamsWithDetails,
    last_updated: new Date().toISOString(),
    model_version: "v2.3.1-worldcup2026"
  }

    if (!res.ok) {
      throw new Error(`Remote API error: ${res.status}`)
    }

    const data = (await res.json()) as PredictionResponse
    return NextResponse.json(data)
  } catch {
    const fallback: PredictionResponse = {
      predictions: mockPredictions,
      last_updated: new Date().toISOString(),
      model_version: "fallback-mock"
    }

    return NextResponse.json(fallback)
  }
}

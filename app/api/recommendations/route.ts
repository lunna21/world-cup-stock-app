import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('recommendations')
    .select(`
      *,
      teams (
        id,
        name,
        code,
        confederation
      ),
      predictions (
        probability_quarterfinals,
        probability_semifinals,
        probability_final,
        probability_champion
      )
    `)
    .order('priority', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ recommendations: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { recommendation_id, applied } = body

  const { data: recommendation, error: fetchError } = await supabase
    .from('recommendations')
    .select('*, teams(name)')
    .eq('id', recommendation_id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const { data, error } = await supabase
    .from('recommendations')
    .update({ 
      applied,
      applied_at: applied ? new Date().toISOString() : null
    })
    .eq('id', recommendation_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log action history
  await supabase.from('action_history').insert({
    recommendation_id,
    team_id: recommendation.team_id,
    action_type: applied ? 'recommendation_applied' : 'recommendation_reverted',
    notes: `Recomendación "${recommendation.action}" ${applied ? 'aplicada' : 'revertida'} para ${recommendation.teams?.name}`
  })

  return NextResponse.json({ recommendation: data })
}

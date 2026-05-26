import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      teams (
        id,
        name,
        code,
        confederation
      )
    `)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inventory: data })
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { team_id, current_stock, status } = body

  const { data: inventory, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('team_id', team_id)
    .single()

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const newStatus = current_stock === 0 
    ? 'out_of_stock' 
    : current_stock <= inventory.min_stock 
      ? 'low' 
      : current_stock > inventory.max_stock 
        ? 'overstocked' 
        : status || 'normal'

  const { data, error } = await supabase
    .from('inventory')
    .update({ 
      current_stock, 
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('team_id', team_id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log action history
  await supabase.from('action_history').insert({
    team_id,
    action_type: 'stock_update',
    previous_stock: inventory.current_stock,
    new_stock: current_stock,
    notes: `Stock actualizado de ${inventory.current_stock} a ${current_stock}`
  })

  return NextResponse.json({ inventory: data })
}

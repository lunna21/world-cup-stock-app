import { NextResponse } from "next/server"
import { mockPredictions } from "@/lib/mock-data"
import type { PredictionResponse } from "@/lib/types"

const DEFAULT_API_URL = "https://world-cup-stock-api-qqes.onrender.com/predictions"

export async function GET() {
  const apiUrl = process.env.EXTERNAL_PREDICTIONS_URL ?? DEFAULT_API_URL

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
      cache: "no-store"
    })

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

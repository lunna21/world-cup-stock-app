import { NextResponse } from "next/server"
import { mockPredictions } from "@/lib/mock-data"
import type { PredictionResponse } from "@/lib/types"

export async function GET() {
  // Simulates response from ML model API
  const response: PredictionResponse = {
    predictions: mockPredictions,
    last_updated: new Date().toISOString(),
    model_version: "v2.3.1-worldcup2026"
  }

  return NextResponse.json(response)
}

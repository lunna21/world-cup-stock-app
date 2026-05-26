"use client"

import useSWR from "swr"
import type { PredictionResponse } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function usePredictions() {
  const { data, error, isLoading, mutate } = useSWR<PredictionResponse>(
    "/api/predictions",
    fetcher,
    {
      refreshInterval: 60000,
      revalidateOnFocus: true
    }
  )

  return {
    teams: data?.teams ?? [],
    lastUpdated: data?.last_updated,
    modelVersion: data?.model_version,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

export function useInventory() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/inventory",
    fetcher,
    { revalidateOnFocus: true }
  )

  const updateStock = async (team_id: string, current_stock: number) => {
    await fetch("/api/inventory", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ team_id, current_stock })
    })
    mutate()
  }

  return {
    inventory: data?.inventory ?? [],
    isLoading,
    isError: error,
    updateStock,
    refresh: mutate
  }
}

export function useRecommendations() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/recommendations",
    fetcher,
    { revalidateOnFocus: true }
  )

  const applyRecommendation = async (recommendation_id: string, applied: boolean) => {
    await fetch("/api/recommendations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendation_id, applied })
    })
    mutate()
  }

  return {
    recommendations: data?.recommendations ?? [],
    isLoading,
    isError: error,
    applyRecommendation,
    refresh: mutate
  }
}

export function useActionHistory() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/history",
    fetcher,
    { revalidateOnFocus: true }
  )

  return {
    history: data?.history ?? [],
    isLoading,
    isError: error,
    refresh: mutate
  }
}

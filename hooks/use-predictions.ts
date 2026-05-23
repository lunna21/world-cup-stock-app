"use client"

import useSWR from "swr"
import type { PredictionResponse } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function usePredictions() {
  const { data, error, isLoading, mutate } = useSWR<PredictionResponse>(
    "/api/predictions",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true
    }
  )

  return {
    predictions: data?.predictions ?? [],
    lastUpdated: data?.last_updated,
    modelVersion: data?.model_version,
    isLoading,
    isError: error,
    refresh: mutate
  }
}

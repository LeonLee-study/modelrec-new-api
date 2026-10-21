/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useCallback, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPricing } from '@/features/pricing/api'
import { FILTER_ALL } from '../constants'
import {
  extractProviderOptions,
  transformPricingData,
} from '../lib/transform'
import type {
  CategoryKey,
  FilterGroupKey,
  FilterOption,
  PriceListFilterState,
} from '../types'

const INITIAL_FILTERS: PriceListFilterState = {
  provider: FILTER_ALL,
  model_type: FILTER_ALL,
}

export function usePriceListData() {
  const [filters, setFilters] = useState<PriceListFilterState>(INITIAL_FILTERS)
  const [search, setSearch] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['pricing'],
    queryFn: getPricing,
    staleTime: 5 * 60 * 1000,
  })

  const models = data?.data ?? []
  const vendors = data?.vendors ?? []
  const vendorCount = data?.vendor_count ?? 0
  const modelCount = data?.model_count ?? 0

  const allCategoryData = useMemo(
    () => transformPricingData(models, vendors),
    [models, vendors]
  )

  const providerOptions: FilterOption[] = useMemo(
    () => extractProviderOptions(models, vendors),
    [models, vendors]
  )

  const { categoryData, resultCount } = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    const filtered: Record<CategoryKey, Record<string, unknown>[]> = {
      text_generation: [],
      multi_model: [],
      image_generation: [],
      image_recognition: [],
      video_generation: [],
      video_recognition: [],
      voice_generation: [],
      voice_recognition: [],
      world_model: [],
      vector: [],
    }

    let count = 0
    for (const [catKey, rows] of Object.entries(allCategoryData)) {
      for (const row of rows) {
        if (
          filters.provider !== FILTER_ALL &&
          row.provider !== filters.provider
        )
          continue
        if (
          filters.model_type !== FILTER_ALL &&
          catKey !== filters.model_type
        )
          continue
        if (keyword) {
          const name = String(row.model_name ?? '').toLowerCase()
          if (!name.includes(keyword)) continue
        }
        filtered[catKey as CategoryKey].push(row)
        count++
      }
    }

    return { categoryData: filtered, resultCount: count }
  }, [allCategoryData, filters, search])

  const handleGroupChange = useCallback(
    (group: FilterGroupKey) => (value: string) => {
      setFilters((prev) => ({ ...prev, [group]: value }))
    },
    []
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
  }, [])

  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
    setSearch('')
  }, [])

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.provider !== FILTER_ALL ||
    filters.model_type !== FILTER_ALL

  return {
    categoryData,
    resultCount,
    providerOptions,
    vendorCount,
    modelCount,
    filters,
    search,
    hasActiveFilters,
    isLoading,
    error,
    handleGroupChange,
    handleSearchChange,
    handleClearFilters,
    refetch,
  }
}

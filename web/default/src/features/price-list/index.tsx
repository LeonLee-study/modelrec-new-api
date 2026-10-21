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
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import {
  PriceListContent,
  PriceListFilterPanel,
  PriceListHero,
} from './components'
import { CATEGORIES, FILTER_ALL } from './constants'
import type { CategoryKey, FilterGroupKey, PriceListFilterState } from './types'

const INITIAL_FILTER_STATE: PriceListFilterState = {
  provider: FILTER_ALL,
  model_type: FILTER_ALL,
}

/**
 * Flat list of all model rows across categories. Each row carries a
 * `categoryKey` so it can be distributed into the right table after
 * filtering. Currently empty — the pricing-table API will populate this.
 */
const SOURCE_DATA: (Record<string, unknown> & { categoryKey: CategoryKey })[] =
  []

/** Empty category map used as the base for useMemo distribution. */
const EMPTY_CATEGORY_DATA: Record<CategoryKey, Record<string, unknown>[]> = {
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

export function PriceList() {
  const [filters, setFilters] =
    useState<PriceListFilterState>(INITIAL_FILTER_STATE)
  const [search, setSearch] = useState('')

  // Filter handlers are initialized with the correct shape; actual data-row
  // filtering is a no-op until the pricing-table API lands and exposes the
  // model list this state drives.
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
    setFilters(INITIAL_FILTER_STATE)
    setSearch('')
  }, [])

  const hasActiveFilters =
    search.trim().length > 0 ||
    filters.provider !== FILTER_ALL ||
    filters.model_type !== FILTER_ALL

  // Filter source data by provider + model_type + keyword, then distribute
  // into per-category buckets. Both steps are no-ops while SOURCE_DATA is
  // empty; once the pricing-table API populates it the pipeline activates
  // without further changes.
  const { categoryData, resultCount } = useMemo(() => {
    const keyword = search.trim().toLowerCase()

    const filtered = SOURCE_DATA.filter((row) => {
      if (
        filters.provider !== FILTER_ALL &&
        row.provider !== filters.provider
      ) {
        return false
      }
      if (
        filters.model_type !== FILTER_ALL &&
        row.categoryKey !== filters.model_type
      ) {
        return false
      }
      if (keyword) {
        const name = String(row.model_name ?? '').toLowerCase()
        if (!name.includes(keyword)) return false
      }
      return true
    })

    const grouped: Record<CategoryKey, Record<string, unknown>[]> = {
      ...EMPTY_CATEGORY_DATA,
    }
    for (const cat of CATEGORIES) {
      grouped[cat.key] = []
    }
    for (const row of filtered) {
      const { categoryKey, ...rest } = row
      grouped[categoryKey].push(rest)
    }

    return { categoryData: grouped, resultCount: filtered.length }
  }, [filters.provider, filters.model_type, search])

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition>
        <PriceListHero />

        {/* 主内容分区底板 */}
        <div className='w-full px-4 pt-8 pb-16'>
          <PriceListFilterPanel
            state={filters}
            search={search}
            resultCount={resultCount}
            onGroupChange={(group, value) => handleGroupChange(group)(value)}
            onSearchChange={handleSearchChange}
          />
          <PriceListContent
            search={search}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            categoryData={categoryData}
          />
        </div>
      </PageTransition>
    </PublicLayout>
  )
}

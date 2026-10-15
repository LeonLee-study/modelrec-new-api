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
import { useCallback, useState } from 'react'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import {
  PriceListContent,
  PriceListFilterPanel,
  PriceListHero,
} from './components'
import { FILTER_ALL } from './constants'
import type { FilterGroupKey, PriceListFilterState } from './types'

const INITIAL_FILTER_STATE: PriceListFilterState = {
  billing: FILTER_ALL,
  provider: FILTER_ALL,
  model_type: FILTER_ALL,
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
    filters.billing !== FILTER_ALL ||
    filters.provider !== FILTER_ALL ||
    filters.model_type !== FILTER_ALL

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition>
        <PriceListHero />

        {/* 主内容分区底板 */}
        <div className='w-full px-4 pt-8 pb-16'>
          <PriceListFilterPanel
            state={filters}
            search={search}
            resultCount={0}
            onGroupChange={(group, value) => handleGroupChange(group)(value)}
            onSearchChange={handleSearchChange}
          />
          <PriceListContent
            search={search}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </PageTransition>
    </PublicLayout>
  )
}

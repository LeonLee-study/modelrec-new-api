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
import { useMemo } from 'react'
import { PublicLayout } from '@/components/layout'
import { PageTransition } from '@/components/page-transition'
import {
  PriceListContent,
  PriceListFilterPanel,
  PriceListHero,
  PriceListNote,
} from './components'
import { FILTER_ALL, FILTER_GROUPS } from './constants'
import { usePriceListData } from './hooks/use-price-list-data'
import type { FilterGroupConfig } from './types'

export function PriceList() {
  const {
    categoryData,
    resultCount,
    providerOptions,
    vendorCount,
    modelCount,
    filters,
    search,
    hasActiveFilters,
    handleGroupChange,
    handleSearchChange,
    handleClearFilters,
  } = usePriceListData()

  const filterGroups: FilterGroupConfig[] = useMemo(() => {
    return FILTER_GROUPS.map((g) => {
      if (g.key === 'provider') {
        return {
          ...g,
          options: [
            { value: FILTER_ALL, labelKey: 'All' },
            ...providerOptions,
          ],
        }
      }
      return g
    })
  }, [providerOptions])

  return (
    <PublicLayout showMainContainer={false}>
      <PageTransition>
        <PriceListHero vendorCount={vendorCount} modelCount={modelCount} />

        <div className='w-full px-4 pt-8 pb-16'>
          <PriceListFilterPanel
            state={filters}
            search={search}
            resultCount={resultCount}
            filterGroups={filterGroups}
            onGroupChange={(group, value) => handleGroupChange(group)(value)}
            onSearchChange={handleSearchChange}
          />
          <PriceListContent
            search={search}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            categoryData={categoryData}
          />
          <PriceListNote />
        </div>
      </PageTransition>
    </PublicLayout>
  )
}

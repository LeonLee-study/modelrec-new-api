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
import { EmptyState } from '@/features/pricing/components/empty-state'
import { CATEGORIES } from '../constants'
import { PriceListCategorySection } from './price-list-category-section'
import type { CategoryKey } from '../types'

export type PriceListContentProps = {
  search: string
  hasActiveFilters: boolean
  onClearFilters: () => void
}

/**
 * Placeholder data map — every category starts with an empty array.
 * Replace with API-driven data once the pricing-table endpoint lands.
 */
const PLACEHOLDER_CATEGORY_DATA: Record<CategoryKey, Record<string, unknown>[]> = {
  text_generation: [],
  multi_modal: [],
  image_generation: [],
  video_generation: [],
  voice: [],
  substrate: [],
}

/**
 * Main content area beneath the filter panel. Renders six category sections
 * (text generation, multimodal, image, video, voice, substrate) each backed
 * by a pricing table. When all categories are empty *and* the user has active
 * filters, the shared EmptyState is shown instead.
 */
export function PriceListContent(props: PriceListContentProps) {
  const allEmpty = CATEGORIES.every(
    (cat) => PLACEHOLDER_CATEGORY_DATA[cat.key].length === 0
  )

  if (allEmpty && props.hasActiveFilters) {
    return (
      <div className='mx-auto max-w-6xl'>
        <EmptyState
          searchQuery={props.search}
          hasActiveFilters={props.hasActiveFilters}
          onClearFilters={props.onClearFilters}
        />
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl'>
      {CATEGORIES.map((cat) => (
        <PriceListCategorySection
          key={cat.key}
          config={cat}
          data={PLACEHOLDER_CATEGORY_DATA[cat.key]}
        />
      ))}
    </div>
  )
}

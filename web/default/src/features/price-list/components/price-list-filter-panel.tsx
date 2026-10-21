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
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { cn } from '@/lib/utils'
import { FILTER_SCHEME_CLASSES } from '../constants'
import type {
  FilterGroupConfig,
  FilterGroupKey,
  PriceListFilterState,
} from '../types'

export type PriceListFilterPanelProps = {
  state: PriceListFilterState
  search: string
  resultCount: number
  filterGroups: FilterGroupConfig[]
  onGroupChange: (group: FilterGroupKey, value: string) => void
  onSearchChange: (value: string) => void
}

/**
 * Horizontal filter panel sitting above the main content area: a search row
 * (input + result count) followed by one chip row per filter group. Chip
 * options are sourced from `FILTER_GROUPS`; only the "All" entry is present
 * until the pricing-table API populates each group.
 */
export function PriceListFilterPanel(props: PriceListFilterPanelProps) {
  const { t } = useTranslation()

  return (
    <div className='sf-page-gradient mb-10 rounded-2xl p-5 md:p-6'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:gap-5'>
        <div className='relative flex-1'>
          <Search className='text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2' />
          <input
            type='text'
            value={props.search}
            onChange={(e) => props.onSearchChange(e.target.value)}
            placeholder={t('priceList.filter.searchPlaceholder')}
            className='h-11 w-full rounded-[10px] border border-[#e7e0d3] bg-white pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF8A00]/25 md:h-12'
          />
        </div>
        <div className='text-muted-foreground shrink-0 text-sm md:text-right'>
          {t('priceList.filter.resultCount', { count: props.resultCount })}
        </div>
      </div>

      {props.filterGroups.map((group) => (
        <FilterGroupRow
          key={group.key}
          group={group}
          value={props.state[group.key]}
          onChange={(value) => props.onGroupChange(group.key, value)}
        />
      ))}
    </div>
  )
}

type FilterGroupRowProps = {
  group: FilterGroupConfig
  value: string
  onChange: (value: string) => void
}

function FilterGroupRow(props: FilterGroupRowProps) {
  const { t } = useTranslation()
  const scheme = FILTER_SCHEME_CLASSES[props.group.scheme]

  return (
    <div className='mt-3 flex flex-col gap-4 sm:flex-row sm:items-start'>
      <span className='text-muted-foreground shrink-0 w-16 pt-1.5 text-sm'>
        {t(props.group.labelKey)}
      </span>
      <ToggleGroup
        value={[props.value]}
        onValueChange={(next) => {
          // base-ui's ToggleGroup fires the whole array on every click; the
          // newly-selected value is the one that differs from the current
          // selection. Clicking the already-active chip produces an empty
          // array (deselection attempt) — ignored so the group always keeps
          // a selection.
          const picked = next.find((v) => v !== props.value) ?? next[0]
          if (picked) props.onChange(picked)
        }}
        className='flex w-full flex-wrap gap-2'
      >
        {props.group.options.map((opt) => {
          const isActive = props.value === opt.value
          return (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className={cn(
                '!rounded-full border px-4 py-1.5 text-sm transition-colors',
                isActive ? scheme.active : scheme.inactive
              )}
            >
              {t(opt.labelKey)}
            </ToggleGroupItem>
          )
        })}
      </ToggleGroup>
    </div>
  )
}

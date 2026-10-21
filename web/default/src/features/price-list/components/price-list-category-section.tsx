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
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { CategoryConfig } from '../constants'
import type {
  TokenPricingRow,
  UnitPricingRow,
  VectorRow,
  WorldModelRow,
} from '../types'

type SortDirection = 'asc' | 'desc'

// ----------------------------------------------------------------------------
// Column definition
// ----------------------------------------------------------------------------

type ColDef<T> = {
  id: string
  headerKey: string
  /** Tailwind class for the header cell (width, alignment). */
  headerClassName?: string
  /** Tailwind class for the body cell. */
  cellClassName?: string
  render: (row: T) => ReactNode
  sortable?: boolean
  sortKey?: string
}

const NAME_COL = {
  id: 'model_name',
  headerKey: 'priceList.table.modelName',
  headerClassName: 'w-[24%] min-w-[200px]',
  cellClassName: 'font-bold whitespace-nowrap',
} as const

const PROVIDER_COL = {
  id: 'provider',
  headerKey: 'priceList.table.provider',
  headerClassName: 'w-[15%] min-w-[120px]',
  cellClassName: 'text-muted-foreground whitespace-nowrap',
} as const

const USD_CELL_CLASS =
  'text-muted-foreground text-xs whitespace-nowrap text-right'
const SD_CELL_CLASS = 'whitespace-nowrap text-right'

/** Suidian price cell: bold orange number + muted unit suffix. */
function sdCell(value: number, unit: string): ReactNode {
  return (
    <>
      <span className='text-primary text-base font-bold'>{value}</span>{' '}
      <span className='text-muted-foreground text-xs font-normal'>{unit}</span>
    </>
  )
}

// ----------------------------------------------------------------------------
// Per-category column definitions
// ----------------------------------------------------------------------------

/** Token-based pricing — input/output USD + SD per 1M tokens. */
const tokenCols: ColDef<TokenPricingRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'in_pr_SD',
    headerKey: 'priceList.table.inPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.in_pr_SD, '燧点/1M'),
    sortable: true,
    sortKey: 'in_pr_SD',
  },
  {
    id: 'out_pr_SD',
    headerKey: 'priceList.table.outPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.out_pr_SD, '燧点/1M'),
    sortable: true,
    sortKey: 'out_pr_SD',
  },
  {
    id: 'in_pr_USD',
    headerKey: 'priceList.table.inPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.in_pr_USD}/1M`,
    sortable: true,
    sortKey: 'in_pr_USD',
  },
  {
    id: 'out_pr_USD',
    headerKey: 'priceList.table.outPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.out_pr_USD}/1M`,
    sortable: true,
    sortKey: 'out_pr_USD',
  },
]

/** 图片生成 — 按张计价 (image_generate). */
const imageGenCols: ColDef<UnitPricingRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'unit_pr_SD',
    headerKey: 'priceList.table.pcPrSuidian',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.unit_pr_SD, '燧点/张'),
    sortable: true,
    sortKey: 'unit_pr_SD',
  },
  {
    id: 'unit_pr_USD',
    headerKey: 'priceList.table.pcPrUSD',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.unit_pr_USD}/张`,
    sortable: true,
    sortKey: 'unit_pr_USD',
  },
]

/** 视频生成 — 按次/按秒单价 (video_generate). */
const videoGenCols: ColDef<UnitPricingRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'unit_pr_SD',
    headerKey: 'priceList.table.sPrSuidian',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.unit_pr_SD, '燧点'),
    sortable: true,
    sortKey: 'unit_pr_SD',
  },
  {
    id: 'unit_pr_USD',
    headerKey: 'priceList.table.sPrUSD',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.unit_pr_USD}`,
    sortable: true,
    sortKey: 'unit_pr_USD',
  },
]

/** 视频识别 / 语音识别 — unit pricing (video_recognize, speech_recognize). */
const unitPerSecondCols: ColDef<UnitPricingRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'unit_pr_SD',
    headerKey: 'priceList.table.sPrSuidian',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.unit_pr_SD, '燧点/s'),
    sortable: true,
    sortKey: 'unit_pr_SD',
  },
  {
    id: 'unit_pr_USD',
    headerKey: 'priceList.table.sPrUSD',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.unit_pr_USD}/s`,
    sortable: true,
    sortKey: 'unit_pr_USD',
  },
]

/** 世界模型 — 输入按次、输出按秒。 */
const worldModelCols: ColDef<WorldModelRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 't_in_pr_SD',
    headerKey: 'priceList.table.tInPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.t_in_pr_SD, '燧点/次'),
    sortable: true,
    sortKey: 't_in_pr_SD',
  },
  {
    id: 's_out_pr_SD',
    headerKey: 'priceList.table.sOutPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.s_out_pr_SD, '燧点/s'),
    sortable: true,
    sortKey: 's_out_pr_SD',
  },
  {
    id: 't_in_pr_USD',
    headerKey: 'priceList.table.tInPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.t_in_pr_USD}/次`,
    sortable: true,
    sortKey: 't_in_pr_USD',
  },
  {
    id: 's_out_pr_USD',
    headerKey: 'priceList.table.sOutPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.s_out_pr_USD}/s`,
    sortable: true,
    sortKey: 's_out_pr_USD',
  },
]

/** 向量与检索 — 文本输入与向量输入双价。 */
const vectorCols: ColDef<VectorRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'in_pr_SD',
    headerKey: 'priceList.table.textInPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.in_pr_SD, '燧点/1M'),
    sortable: true,
    sortKey: 'in_pr_SD',
  },
  {
    id: 'vec_in_pr_SD',
    headerKey: 'priceList.table.vecInPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.vec_in_pr_SD, '燧点/1M'),
    sortable: true,
    sortKey: 'vec_in_pr_SD',
  },
  {
    id: 'in_pr_USD',
    headerKey: 'priceList.table.textInPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.in_pr_USD}/1M`,
    sortable: true,
    sortKey: 'in_pr_USD',
  },
  {
    id: 'vec_in_pr_USD',
    headerKey: 'priceList.table.vecInPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.vec_in_pr_USD}/1M`,
    sortable: true,
    sortKey: 'vec_in_pr_USD',
  },
]

type AnyCols = ColDef<Record<string, unknown>>[]

const COLUMNS_MAP: Record<CategoryConfig['key'], AnyCols> = {
  text_generation: tokenCols as unknown as AnyCols,
  multi_model: tokenCols as unknown as AnyCols,
  image_generation: imageGenCols as unknown as AnyCols,
  image_recognition: tokenCols as unknown as AnyCols,
  video_generation: videoGenCols as unknown as AnyCols,
  video_recognition: unitPerSecondCols as unknown as AnyCols,
  voice_generation: tokenCols as unknown as AnyCols,
  voice_recognition: unitPerSecondCols as unknown as AnyCols,
  world_model: worldModelCols as unknown as AnyCols,
  vector: vectorCols as unknown as AnyCols,
}

// ----------------------------------------------------------------------------
// Generic table renderer
// ----------------------------------------------------------------------------

type PricingTableProps = {
  columns: AnyCols
  data: Record<string, unknown>[]
  emptyLabel: string
}

function SortIcon({ direction }: { direction: SortDirection | null }) {
  return (
    <img
      src='/l-sort.svg'
      alt=''
      className={cn(
        'inline-block size-4 shrink-0 transition-all',
        direction === 'desc' && 'rotate-180',
        direction ? 'opacity-100' : 'opacity-50'
      )}
    />
  )
}

function PricingTable({ columns, data, emptyLabel }: PricingTableProps) {
  const [sortCol, setSortCol] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<SortDirection | null>(null)

  const handleSort = (col: { sortable?: boolean; sortKey?: string }) => {
    if (!col.sortable || !col.sortKey) return
    if (sortCol !== col.sortKey) {
      setSortCol(col.sortKey)
      setSortDir('asc')
    } else if (sortDir === 'asc') {
      setSortDir('desc')
    } else {
      setSortDir('asc')
    }
  }

  const sortedData = useMemo(() => {
    if (!sortCol || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = Number(a[sortCol] ?? 0)
      const bv = Number(b[sortCol] ?? 0)
      return sortDir === 'asc' ? av - bv : bv - av
    })
  }, [data, sortCol, sortDir])

  return (
    <div className='bg-card overflow-hidden rounded-2xl border border-gray-100 shadow-sm'>
      <div className='max-h-[calc(10*3.5rem+3.5rem)] overflow-y-auto'>
        <table className='w-full text-left'>
          <thead className='sticky top-0 z-10'>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'bg-[#FF8A00] py-4 px-6 text-sm font-semibold whitespace-nowrap text-white',
                    col.sortable && 'cursor-pointer select-none',
                    col.headerClassName
                  )}
                  onClick={
                    col.sortable ? () => handleSort(col) : undefined
                  }
                >
                  <span className='inline-flex items-center gap-1.5'>
                    <TableHeaderLabel k={col.headerKey} />
                    {col.sortable && (
                      <SortIcon
                        direction={
                          sortCol === col.sortKey ? sortDir : null
                        }
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 text-sm'>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='text-muted-foreground h-24 text-center text-sm'
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className='even:bg-[#fafafa] hover:bg-[#fff7ed] transition-colors'
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={cn('py-4 px-6 text-sm', col.cellClassName)}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Tiny helper so we can call `t()` inside the render path. */
function TableHeaderLabel({ k }: { k: string }) {
  const { t } = useTranslation()
  return <>{t(k)}</>
}

// ----------------------------------------------------------------------------
// Public component
// ----------------------------------------------------------------------------

export type PriceListCategorySectionProps = {
  config: CategoryConfig
  data: Record<string, unknown>[]
}

/**
 * One category section: heading (emoji + label + English subtitle) followed by
 * a pricing table whose columns are determined by `config.key`.
 */
export function PriceListCategorySection({
  config,
  data,
}: PriceListCategorySectionProps) {
  const { t } = useTranslation()
  const columns = COLUMNS_MAP[config.key]

  if (data.length === 0) return null

  return (
    <section className='mb-14 last:mb-0'>
      {/* Section heading */}
      <div className='mb-5 flex items-center gap-3'>
        <div className='flex size-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF8A00]'>
          <span className='text-xl'>{config.emoji}</span>
        </div>
        <div>
          <h2 className='text-foreground text-xl font-bold'>
            {t(config.labelKey)}
          </h2>
          <p className='text-muted-foreground text-xs tracking-wider uppercase'>
            {t(config.subtitleKey)}
          </p>
        </div>
      </div>

      <PricingTable
        columns={columns}
        data={data}
        emptyLabel={t('priceList.table.noData')}
      />
    </section>
  )
}

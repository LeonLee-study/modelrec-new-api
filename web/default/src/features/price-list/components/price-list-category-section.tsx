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
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { CategoryConfig } from '../constants'
import type {
  ImageRow,
  PerSecondRow,
  TextGenerationRow,
  VectorRow,
  VoiceGenerationRow,
  WorldModelRow,
} from '../types'

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

/** 文本 / 多模态 — token 输入输出双价。 */
const textGenCols: ColDef<TextGenerationRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'in_pr_USD',
    headerKey: 'priceList.table.inPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.in_pr_USD}/1M`,
  },
  {
    id: 'out_pr_USD',
    headerKey: 'priceList.table.outPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.out_pr_USD}/1M`,
  },
  {
    id: 'in_pr_SD',
    headerKey: 'priceList.table.inPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.in_pr_SD, '燧点/1M'),
  },
  {
    id: 'out_pr_SD',
    headerKey: 'priceList.table.outPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.out_pr_SD, '燧点/1M'),
  },
]

/** 图片生成 / 图片识别 — 按张计价。 */
const imageCols: ColDef<ImageRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'pc_pr_USD',
    headerKey: 'priceList.table.pcPrUSD',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.pc_pr_USD}/张`,
  },
  {
    id: 'pc_pr_SD',
    headerKey: 'priceList.table.pcPrSuidian',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.pc_pr_SD, '燧点/张'),
  },
]

/** 视频生成 / 视频识别 / 语音识别 — 按秒计价。 */
const perSecondCols: ColDef<PerSecondRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 's_pr_USD',
    headerKey: 'priceList.table.sPrUSD',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.s_pr_USD}/s`,
  },
  {
    id: 's_pr_SD',
    headerKey: 'priceList.table.sPrSuidian',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.s_pr_SD, '燧点/s'),
  },
]

/** 语音合成 — 按万字计价。 */
const voiceGenCols: ColDef<VoiceGenerationRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'w_pr_USD',
    headerKey: 'priceList.table.wPrUSD',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.w_pr_USD}/万字`,
  },
  {
    id: 'w_pr_SD',
    headerKey: 'priceList.table.wPrSuidian',
    headerClassName: 'w-[30%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.w_pr_SD, '燧点/万字'),
  },
]

/** 世界模型 — 输入按次、输出按秒。 */
const worldModelCols: ColDef<WorldModelRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 't_in_pr_USD',
    headerKey: 'priceList.table.tInPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.t_in_pr_USD}/次`,
  },
  {
    id: 't_in_pr_SD',
    headerKey: 'priceList.table.tInPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.t_in_pr_SD, '燧点/次'),
  },
  {
    id: 's_out_pr_USD',
    headerKey: 'priceList.table.sOutPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.s_out_pr_USD}/s`,
  },
  {
    id: 's_out_pr_SD',
    headerKey: 'priceList.table.sOutPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.s_out_pr_SD, '燧点/s'),
  },
]

/** 向量与检索 — 文本输入与向量输入双价。 */
const vectorCols: ColDef<VectorRow>[] = [
  { ...NAME_COL, render: (r) => r.model_name },
  { ...PROVIDER_COL, render: (r) => r.provider },
  {
    id: 'in_pr_USD',
    headerKey: 'priceList.table.textInPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.in_pr_USD}/1M`,
  },
  {
    id: 'in_pr_SD',
    headerKey: 'priceList.table.textInPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.in_pr_SD, '燧点/1M'),
  },
  {
    id: 'vec_in_pr_USD',
    headerKey: 'priceList.table.vecInPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: USD_CELL_CLASS,
    render: (r) => `$${r.vec_in_pr_USD}/1M`,
  },
  {
    id: 'vec_in_pr_SD',
    headerKey: 'priceList.table.vecInPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: SD_CELL_CLASS,
    render: (r) => sdCell(r.vec_in_pr_SD, '燧点/1M'),
  },
]

type AnyCols = ColDef<Record<string, unknown>>[]

const COLUMNS_MAP: Record<CategoryConfig['key'], AnyCols> = {
  text_generation: textGenCols as unknown as AnyCols,
  multi_model: textGenCols as unknown as AnyCols,
  image_generation: imageCols as unknown as AnyCols,
  image_recognition: imageCols as unknown as AnyCols,
  video_generation: perSecondCols as unknown as AnyCols,
  video_recognition: perSecondCols as unknown as AnyCols,
  voice_generation: voiceGenCols as unknown as AnyCols,
  voice_recognition: perSecondCols as unknown as AnyCols,
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

function PricingTable({ columns, data, emptyLabel }: PricingTableProps) {
  return (
    <div className='bg-card overflow-hidden rounded-2xl border border-gray-100 shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left'>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={cn(
                    'bg-[#FF8A00] py-4 px-6 text-sm font-semibold whitespace-nowrap text-white',
                    col.headerClassName
                  )}
                >
                  <TableHeaderLabel k={col.headerKey} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100 text-sm'>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className='text-muted-foreground h-24 text-center text-sm'
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
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

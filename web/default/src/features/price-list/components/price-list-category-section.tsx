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
  ImageGenerationRow,
  SubstrateRow,
  TextGenerationRow,
  VideoGenerationRow,
  VoiceRow,
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

// ----------------------------------------------------------------------------
// Per-category column definitions
// ----------------------------------------------------------------------------

const textGenCols: ColDef<TextGenerationRow>[] = [
  {
    id: 'model_name',
    headerKey: 'priceList.table.modelName',
    headerClassName: 'w-[24%] min-w-[200px]',
    cellClassName: 'font-bold whitespace-nowrap',
    render: (r) => r.model_name,
  },
  {
    id: 'provider',
    headerKey: 'priceList.table.provider',
    headerClassName: 'w-[15%] min-w-[120px]',
    cellClassName: 'text-muted-foreground whitespace-nowrap',
    render: (r) => r.provider,
  },
  {
    id: 'in_pr_USD',
    headerKey: 'priceList.table.inPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => `$${r.in_pr_USD}/1M`,
  },
  {
    id: 'out_pr_USD',
    headerKey: 'priceList.table.outPrUSD',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => `$${r.out_pr_USD}/1M`,
  },
  {
    id: 'in_pr_suidian',
    headerKey: 'priceList.table.inPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: 'whitespace-nowrap text-right',
    render: (r) => (
      <>
        <span className='text-primary text-base font-bold'>
          {r.in_pr_suidian}
        </span>{' '}
        <span className='text-muted-foreground text-xs font-normal'>
          燧点/1M
        </span>
      </>
    ),
  },
  {
    id: 'out_pr_suidian',
    headerKey: 'priceList.table.outPrSuidian',
    headerClassName: 'w-[15.25%] min-w-[132px]',
    cellClassName: 'whitespace-nowrap text-right',
    render: (r) => (
      <>
        <span className='text-primary text-base font-bold'>
          {r.out_pr_suidian}
        </span>{' '}
        <span className='text-muted-foreground text-xs font-normal'>
          燧点/1M
        </span>
      </>
    ),
  },
]

const imageGenCols: ColDef<ImageGenerationRow>[] = [
  {
    id: 'model_name',
    headerKey: 'priceList.table.modelName',
    headerClassName: 'w-[24%] min-w-[200px]',
    cellClassName: 'font-bold whitespace-nowrap',
    render: (r) => r.model_name,
  },
  {
    id: 'provider',
    headerKey: 'priceList.table.provider',
    headerClassName: 'w-[15%] min-w-[120px]',
    cellClassName: 'text-muted-foreground whitespace-nowrap',
    render: (r) => r.provider,
  },
  {
    id: 'p_pr_USD',
    headerKey: 'priceList.table.pPrUSD',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => `$${r.p_pr_USD}/张`,
  },
  {
    id: 'p_pr_suidian',
    headerKey: 'priceList.table.pPrSuidian',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'whitespace-nowrap text-right',
    render: (r) => (
      <>
        <span className='text-primary text-base font-bold'>
          {r.p_pr_suidian}
        </span>{' '}
        <span className='text-muted-foreground text-xs font-normal'>
          燧点/张
        </span>
      </>
    ),
  },
  {
    id: 'res_ratio',
    headerKey: 'priceList.table.resolution',
    headerClassName: 'w-[20%] min-w-[120px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => r.res_ratio,
  },
]

const videoGenCols: ColDef<VideoGenerationRow>[] = [
  {
    id: 'model_name',
    headerKey: 'priceList.table.modelName',
    headerClassName: 'w-[24%] min-w-[200px]',
    cellClassName: 'font-bold whitespace-nowrap',
    render: (r) => r.model_name,
  },
  {
    id: 'provider',
    headerKey: 'priceList.table.provider',
    headerClassName: 'w-[15%] min-w-[120px]',
    cellClassName: 'text-muted-foreground whitespace-nowrap',
    render: (r) => r.provider,
  },
  {
    id: 's_pr_USD',
    headerKey: 'priceList.table.sPrUSD',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => `$${r.s_pr_USD}/秒`,
  },
  {
    id: 's_pr_suidian',
    headerKey: 'priceList.table.sPrSuidian',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'whitespace-nowrap text-right',
    render: (r) => (
      <>
        <span className='text-primary text-base font-bold'>
          {r.s_pr_suidian}
        </span>{' '}
        <span className='text-muted-foreground text-xs font-normal'>
          燧点/秒
        </span>
      </>
    ),
  },
  {
    id: 'res_ratio',
    headerKey: 'priceList.table.resolution',
    headerClassName: 'w-[20%] min-w-[120px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => r.res_ratio,
  },
]

const voiceCols: ColDef<VoiceRow>[] = [
  {
    id: 'model_name',
    headerKey: 'priceList.table.modelName',
    headerClassName: 'w-[24%] min-w-[200px]',
    cellClassName: 'font-bold whitespace-nowrap',
    render: (r) => r.model_name,
  },
  {
    id: 'provider',
    headerKey: 'priceList.table.provider',
    headerClassName: 'w-[15%] min-w-[120px]',
    cellClassName: 'text-muted-foreground whitespace-nowrap',
    render: (r) => r.provider,
  },
  {
    id: 'ttw_pr_USD',
    headerKey: 'priceList.table.ttwPrUSD',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => `$${r.ttw_pr_USD}/万字`,
  },
  {
    id: 'ttw_pr_suidian',
    headerKey: 'priceList.table.ttwPrSuidian',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'whitespace-nowrap text-right',
    render: (r) => (
      <>
        <span className='text-primary text-base font-bold'>
          {r.ttw_pr_suidian}
        </span>{' '}
        <span className='text-muted-foreground text-xs font-normal'>
          燧点/万字
        </span>
      </>
    ),
  },
  {
    id: 'ch_type',
    headerKey: 'priceList.table.chType',
    headerClassName: 'w-[20%] min-w-[120px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => r.ch_type,
  },
]

const substrateCols: ColDef<SubstrateRow>[] = [
  {
    id: 'model_name',
    headerKey: 'priceList.table.modelName',
    headerClassName: 'w-[24%] min-w-[200px]',
    cellClassName: 'font-bold whitespace-nowrap',
    render: (r) => r.model_name,
  },
  {
    id: 'provider',
    headerKey: 'priceList.table.provider',
    headerClassName: 'w-[15%] min-w-[120px]',
    cellClassName: 'text-muted-foreground whitespace-nowrap',
    render: (r) => r.provider,
  },
  {
    id: 'pr_USD',
    headerKey: 'priceList.table.prUSD',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => `$${r.pr_USD}/1M`,
  },
  {
    id: 'pr_suidian',
    headerKey: 'priceList.table.prSuidian',
    headerClassName: 'w-[20%] min-w-[132px]',
    cellClassName: 'whitespace-nowrap text-right',
    render: (r) => (
      <>
        <span className='text-primary text-base font-bold'>
          {r.pr_suidian}
        </span>{' '}
        <span className='text-muted-foreground text-xs font-normal'>
          燧点/1M
        </span>
      </>
    ),
  },
  {
    id: 'dimen',
    headerKey: 'priceList.table.dimension',
    headerClassName: 'w-[20%] min-w-[120px]',
    cellClassName: 'text-muted-foreground text-xs whitespace-nowrap text-right',
    render: (r) => String(r.dimen),
  },
]

// text_generation and multi_modal share the same column shape.
const COLUMNS_MAP: Record<
  CategoryConfig['key'],
  ColDef<Record<string, unknown>>[]
> = {
  text_generation: textGenCols as unknown as ColDef<Record<string, unknown>>[],
  multi_modal: textGenCols as unknown as ColDef<Record<string, unknown>>[],
  image_generation:
    imageGenCols as unknown as ColDef<Record<string, unknown>>[],
  video_generation:
    videoGenCols as unknown as ColDef<Record<string, unknown>>[],
  voice: voiceCols as unknown as ColDef<Record<string, unknown>>[],
  substrate: substrateCols as unknown as ColDef<Record<string, unknown>>[],
}

// ----------------------------------------------------------------------------
// Generic table renderer
// ----------------------------------------------------------------------------

type PricingTableProps = {
  columns: ColDef<Record<string, unknown>>[]
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
                  {col.headerKey.includes('.') ? (
                    <TableHeaderLabel k={col.headerKey} />
                  ) : (
                    col.headerKey
                  )}
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

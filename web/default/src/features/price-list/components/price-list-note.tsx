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
import { useTranslation } from 'react-i18next'
import { PLACEHOLDER_RULE_VALUES } from '../constants'

/**
 * Bottom pricing explanation note. Mirrors the reference design: a compact
 * bordered card with three labelled paragraphs explaining the recharge rate,
 * internal benchmark, and settlement formula.
 *
 * Dynamic values are sourced from PLACEHOLDER_RULE_VALUES (same as the
 * former hero cards) until a backend endpoint provides them.
 */
export function PriceListNote() {
  const { t, i18n } = useTranslation()
  const values = PLACEHOLDER_RULE_VALUES

  const fmt = useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }),
    [i18n.language]
  )

  return (
    <div className='mt-14 max-w-4xl px-4 pb-16'>
      <div className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left dark:border-gray-700 dark:bg-gray-900'>
        <p className='text-xs leading-relaxed font-medium text-gray-600 dark:text-gray-300'>
          {t('priceList.note.title')}
        </p>
        <p className='mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
          <span className='text-gray-600 dark:text-gray-300'>
            {t('priceList.note.rechargeLabel')}
          </span>
          {t('priceList.note.recharge', {
            pr_CNY: fmt.format(values.pr_CNY),
            pr_USD: fmt.format(values.pr_USD),
            cost_rate: fmt.format(values.cost_rate),
          })}
        </p>
        <p className='mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
          <span className='text-gray-600 dark:text-gray-300'>
            {t('priceList.note.benchmarkLabel')}
          </span>
          {t('priceList.note.benchmark', {
            std_USD: fmt.format(values.std_USD),
            suidian_token: fmt.format(values.suidian_token),
          })}
        </p>
        <p className='mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400'>
          <span className='text-gray-600 dark:text-gray-300'>
            {t('priceList.note.settlementLabel')}
          </span>
          {t('priceList.note.settlement', {
            pr_USD: fmt.format(values.pr_USD),
          })}
        </p>
      </div>
    </div>
  )
}

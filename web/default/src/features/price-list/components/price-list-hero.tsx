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
import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSystemConfig } from '@/hooks/use-system-config'
import { cn } from '@/lib/utils'
import { PLACEHOLDER_RULE_VALUES, PLACEHOLDER_STATS } from '../constants'

type RuleCardProps = {
  badge: string
  label: string
  note: string
  accentText: string
  accentBorder: string
  children: ReactNode
}

/**
 * Shared shell for the three pricing-rule cards: accent top border, uppercase
 * badge + label row, a caller-supplied value area, and a footnote.
 */
function RuleCard(props: RuleCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-2xl border-t-4 p-8 shadow-sm md:p-9',
        props.accentBorder
      )}
    >
      <p className='text-muted-foreground/70 text-xs tracking-wider uppercase'>
        <span className={cn('font-semibold', props.accentText)}>
          {props.badge}
        </span>
        {' · '}
        {props.label}
      </p>
      {props.children}
      <p className='text-muted-foreground/85 mt-4 text-sm leading-relaxed'>
        {props.note}
      </p>
    </div>
  )
}

/**
 * Hero strip for the price list page: headline, subtitle and the three
 * pricing-rule cards. Carries no background of its own so it sits flush with
 * the page-level background provided by PublicLayout.
 */
export function PriceListHero() {
  const { t, i18n } = useTranslation()
  const { systemName } = useSystemConfig()
  const values = PLACEHOLDER_RULE_VALUES
  const stats = PLACEHOLDER_STATS

  const numberFormat = useMemo(
    () => new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 }),
    [i18n.language]
  )

  return (
    <section className='w-full px-4 py-12 md:py-14'>
      <div className='mx-auto max-w-6xl'>
        <h1 className='text-foreground text-center text-2xl leading-tight font-extrabold md:text-4xl'>
          {t('priceList.hero.titlePrefix')}
          <span className='text-primary'>
            {t('priceList.hero.titleHighlight')}
          </span>
          {t('priceList.hero.titleSuffix')}
        </h1>
        <p className='text-muted-foreground mx-auto mt-4 max-w-3xl text-center text-sm leading-relaxed md:text-base'>
          {t('priceList.hero.subtitle', {
            systemName,
            sup_num: numberFormat.format(stats.sup_num),
            mod_num: numberFormat.format(stats.mod_num),
          })}
        </p>

        <div className='mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-6 text-left md:grid-cols-3 md:gap-7'>
          {/* RULE 01 — 充值汇率。双行值，数字不着色（与参考稿一致）。 */}
          <RuleCard
            badge={t('priceList.rules.badge', { number: '01' })}
            label={t('priceList.rules.rule1.label')}
            note={t('priceList.rules.rule1.note', {
              cost_rate: numberFormat.format(values.cost_rate),
            })}
            accentText='text-primary'
            accentBorder='border-t-primary'
          >
            <div className='mt-5 flex items-center gap-4'>
              <div className='text-foreground flex flex-col text-2xl leading-snug font-bold'>
                <span>
                  {t('priceList.rules.rule1.cny', {
                    value: numberFormat.format(values.pr_CNY),
                  })}
                </span>
                <span>
                  {t('priceList.rules.rule1.usd', {
                    value: numberFormat.format(values.pr_USD),
                  })}
                </span>
              </div>
              <span aria-hidden className='bg-border self-stretch w-px' />
            </div>
          </RuleCard>

          {/* RULE 02 — 内部基准价格。数字部分着绿色。 */}
          <RuleCard
            badge={t('priceList.rules.badge', { number: '02' })}
            label={t('priceList.rules.rule2.label')}
            note={t('priceList.rules.rule2.note')}
            accentText='text-[#007B43] dark:text-[#35a16f]'
            accentBorder='border-t-[#007B43] dark:border-t-[#35a16f]'
          >
            <p className='text-foreground mt-5 text-2xl font-bold'>
              {t('priceList.rules.rule2.prefix')}{' '}
              <span className='text-[#007B43] dark:text-[#35a16f]'>
                ${numberFormat.format(values.std_USD)}
              </span>{' '}
              {t('priceList.rules.rule2.suffix')}
            </p>
          </RuleCard>

          {/* RULE 03 — 平台定价。数字部分着金褐色。 */}
          <RuleCard
            badge={t('priceList.rules.badge', { number: '03' })}
            label={t('priceList.rules.rule3.label', { systemName })}
            note={t('priceList.rules.rule3.note', {
              pr_USD: numberFormat.format(values.pr_USD),
            })}
            accentText='text-[#b8860b] dark:text-[#d4a537]'
            accentBorder='border-t-[#b8860b] dark:border-t-[#d4a537]'
          >
            <p className='text-foreground mt-5 text-2xl font-bold'>
              {t('priceList.rules.rule3.prefix')}{' '}
              <span className='text-[#b8860b] dark:text-[#d4a537]'>
                {numberFormat.format(values.suidian_token)}
              </span>{' '}
              {t('priceList.rules.rule3.suffix')}
            </p>
          </RuleCard>
        </div>
      </div>
    </section>
  )
}

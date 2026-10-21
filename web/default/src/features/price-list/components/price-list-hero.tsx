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
import { useSystemConfig } from '@/hooks/use-system-config'

type PriceListHeroProps = {
  vendorCount: number
  modelCount: number
}

/**
 * Hero strip for the price list page: headline and subtitle only.
 * Carries no background of its own so it sits flush with the page-level
 * background provided by PublicLayout.
 */
export function PriceListHero({ vendorCount, modelCount }: PriceListHeroProps) {
  const { t, i18n } = useTranslation()
  const { systemName } = useSystemConfig()

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
            sup_num: numberFormat.format(vendorCount),
            mod_num: numberFormat.format(modelCount),
          })}
        </p>
      </div>
    </section>
  )
}

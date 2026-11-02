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

import { useStatus } from '@/hooks/use-status'

interface Stat {
  value: string
  label: string
  accent: boolean
}

function toCountDisplay(count: unknown, fallback: string): string {
  if (typeof count !== 'number' && typeof count !== 'string') return fallback
  const n = Math.trunc(Number(count))
  if (!Number.isFinite(n) || n < 0) return fallback
  if (n < 10) return String(n)
  return `${Math.floor(n / 10) * 10}+`
}

export function Stats() {
  const { t } = useTranslation()
  const { status } = useStatus()

  const stats: Stat[] = [
    {
      value: toCountDisplay(status?.home_model_count, '400+'),
      label: 'Models',
      accent: true,
    },
    {
      value: toCountDisplay(status?.home_provider_count, '60+'),
      label: 'Providers',
      accent: false,
    },
    // TODO: Restore after these values are backed by verified production data.
    // { value: '8M+', label: 'Global Users', accent: false },
    // { value: '100T', label: 'Monthly Tokens', accent: true },
  ]

  return (
    <dl className='mt-12 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-4'>
      {stats.map((stat) => (
        <div key={stat.label}>
          <dd
            className={
              stat.accent
                ? 'text-3xl font-extrabold tracking-tight text-[#ff8700] md:text-4xl'
                : 'dark:text-foreground text-3xl font-extrabold tracking-tight text-[#111827] md:text-4xl'
            }
          >
            {stat.value}
          </dd>
          <dt className='text-muted-foreground mt-1 text-sm'>
            {t(stat.label)}
          </dt>
        </div>
      ))}
    </dl>
  )
}

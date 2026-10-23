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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import { AgreementModal } from './agreement-modal'

interface LegalConsentProps {
  checked: boolean
  onCheckedChange: (nextValue: boolean) => void
  className?: string
  variant?: 'card' | 'inline'
}

export function LegalConsent({
  checked,
  onCheckedChange,
  className,
  variant = 'card',
}: LegalConsentProps) {
  const { t } = useTranslation()
  const [agreementModal, setAgreementModal] = useState<
    'user-agreement' | 'privacy-policy' | null
  >(null)

  const handleChange = (value: boolean) => {
    onCheckedChange(value === true)
  }

  return (
    <>
      <div
        className={cn(
          'flex items-start gap-3',
          variant === 'card'
            ? 'border-border/60 bg-muted/40 rounded-md border p-3'
            : 'px-0.5 py-1',
          className
        )}
      >
        <Checkbox
          id='legal-consent'
          checked={checked}
          onCheckedChange={handleChange}
          className='mt-1'
        />
        <Label
          htmlFor='legal-consent'
          className='text-muted-foreground items-start gap-1 text-left text-[15px] leading-relaxed font-normal'
        >
          <span>
            {t('I have read and agree to the')}{' '}
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setAgreementModal('user-agreement')
              }}
              className='text-primary hover:underline'
            >
              {t('User Agreement')}
            </button>
            {' '}{t('and the')}{' '}
            <button
              type='button'
              onClick={(e) => {
                e.stopPropagation()
                setAgreementModal('privacy-policy')
              }}
              className='text-primary hover:underline'
            >
              {t('Privacy Policy')}
            </button>
            .
          </span>
        </Label>
      </div>

      <AgreementModal
        open={agreementModal === 'user-agreement'}
        onOpenChange={(open) => {
          if (!open) setAgreementModal(null)
        }}
        src='/agreements/user-agreement.md'
      />
      <AgreementModal
        open={agreementModal === 'privacy-policy'}
        onOpenChange={(open) => {
          if (!open) setAgreementModal(null)
        }}
        src='/agreements/privacy-policy.md'
      />
    </>
  )
}

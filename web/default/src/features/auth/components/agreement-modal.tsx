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
import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Markdown } from '@/components/ui/markdown'

const DialogRoot = Dialog.Root

interface AgreementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
}

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ''
}

function stripTitleLine(markdown: string): string {
  return markdown.replace(/^#\s+.+\n*/, '')
}

export function AgreementModal({
  open,
  onOpenChange,
  src,
}: AgreementModalProps) {
  const { t } = useTranslation()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!open) return
    fetch(src)
      .then((res) => (res.ok ? res.text() : ''))
      .then((text) => {
        setTitle(extractTitle(text))
        setContent(stripTitleLine(text))
      })
      .catch(() => {
        setContent('')
        setTitle('')
      })
  }, [open, src])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/50' />
      <Dialog.Portal>
        <Dialog.Popup className='fixed top-1/2 left-1/2 z-50 flex h-[80vh] w-[60vw] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-black/5 bg-white shadow-xl outline-none dark:border-white/10 dark:bg-[#20231f]'>
          <div className='flex shrink-0 items-start justify-between px-8 pt-6 pb-4'>
            <div>
              <h2 className='text-lg font-semibold text-foreground'>
                {title}
              </h2>
              <p className='text-muted-foreground mt-1 text-sm'>
                {t('Please read the following terms carefully')}
              </p>
            </div>
            <Dialog.Close
              type='button'
              className='text-muted-foreground hover:text-foreground rounded-lg p-1.5 transition-colors'
              aria-label={t('Close')}
            >
              <X className='h-5 w-5' />
            </Dialog.Close>
          </div>

          <div className='flex justify-center px-8 pb-4 flex-1 min-h-0'>
            <div className='w-[90%] flex-1 min-h-0 overflow-y-auto rounded-xl bg-[#f7f9f7] p-6 dark:bg-white/5'>
              <Markdown className='prose prose-sm dark:prose-invert max-w-none'>
                {content}
              </Markdown>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </DialogRoot>
  )
}

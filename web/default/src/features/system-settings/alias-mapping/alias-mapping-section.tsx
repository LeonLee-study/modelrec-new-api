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
import { useEffect, useState } from 'react'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Edit, Trash2, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { StaticDataTable } from '@/components/data-table'
import { Dialog } from '@/components/dialog'
import { SettingsSwitchField } from '../components/settings-form-layout'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'
import type { AliasMappingRule } from './types'

type AliasMappingSectionProps = {
  enabled: boolean
  data: string
}

const aliasMappingSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(100, 'Label must be less than 100 characters'),
  mappingGroup: z
    .string()
    .min(1, 'Mapping group is required')
    .max(5000, 'Mapping group must be less than 5000 characters'),
})

type AliasMappingFormValues = z.infer<typeof aliasMappingSchema>

const ALIAS_MAPPING_FORM_ID = 'alias-mapping-form'

export function AliasMappingSection({
  enabled,
  data,
}: AliasMappingSectionProps) {
  const { t } = useTranslation()
  const updateOption = useUpdateOption()
  const [rules, setRules] = useState<AliasMappingRule[]>([])
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [hasChanges, setHasChanges] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingRule, setEditingRule] = useState<AliasMappingRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'batch'>('single')

  const form = useForm<AliasMappingFormValues>({
    resolver: zodResolver(aliasMappingSchema),
    defaultValues: {
      label: '',
      mappingGroup: '',
    },
  })

  useEffect(() => {
    try {
      const parsed = JSON.parse(data || '[]')
      if (Array.isArray(parsed)) {
        setRules(
          parsed.map((item, idx) => ({
            ...item,
            id: item.id || idx + 1,
          }))
        )
      }
    } catch {
      setRules([])
    }
  }, [data])

  useEffect(() => {
    setIsEnabled(enabled)
  }, [enabled])

  const handleToggleEnabled = async (checked: boolean) => {
    try {
      await updateOption.mutateAsync({
        key: 'alias_mapping_setting.enabled',
        value: checked,
      })
      setIsEnabled(checked)
      toast.success(t('Setting saved'))
    } catch {
      toast.error(t('Failed to update setting'))
    }
  }

  const handleAdd = () => {
    setEditingRule(null)
    form.reset({
      label: '',
      mappingGroup: '',
    })
    setShowDialog(true)
  }

  const handleEdit = (rule: AliasMappingRule) => {
    setEditingRule(rule)
    form.reset({
      label: rule.label,
      mappingGroup: rule.mappingGroup,
    })
    setShowDialog(true)
  }

  const handleDelete = (rule: AliasMappingRule) => {
    setEditingRule(rule)
    setDeleteTarget('single')
    setShowDeleteDialog(true)
  }

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) {
      toast.error(t('Please select items to delete'))
      return
    }
    setDeleteTarget('batch')
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (deleteTarget === 'single' && editingRule) {
      setRules((prev) => prev.filter((item) => item.id !== editingRule.id))
      setHasChanges(true)
      toast.success(
        t('Alias mapping deleted. Click "Save Settings" to apply.')
      )
    } else if (deleteTarget === 'batch') {
      setRules((prev) =>
        prev.filter((item) => !selectedIds.includes(item.id))
      )
      setSelectedIds([])
      setHasChanges(true)
      toast.success(
        t(
          '{{count}} alias mappings deleted. Click "Save Settings" to apply.',
          {
            count: selectedIds.length,
          }
        )
      )
    }
    setShowDeleteDialog(false)
    setEditingRule(null)
  }

  const handleSubmitForm = (values: AliasMappingFormValues) => {
    if (editingRule) {
      setRules((prev) =>
        prev.map((item) =>
          item.id === editingRule.id ? { ...item, ...values } : item
        )
      )
      toast.success(
        t('Alias mapping updated. Click "Save Settings" to apply.')
      )
    } else {
      const newId = Math.max(...rules.map((item) => item.id), 0) + 1
      setRules((prev) => [...prev, { id: newId, ...values }])
      toast.success(
        t('Alias mapping added. Click "Save Settings" to apply.')
      )
    }
    setHasChanges(true)
    setShowDialog(false)
  }

  const handleSaveAll = async () => {
    try {
      await updateOption.mutateAsync({
        key: 'alias_mapping_setting.data',
        value: JSON.stringify(rules),
      })
      setHasChanges(false)
      toast.success(t('Alias mappings saved successfully'))
    } catch {
      toast.error(t('Failed to save alias mappings'))
    }
  }

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? rules.map((item) => item.id) : [])
  }

  const toggleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    )
  }

  return (
    <SettingsSection title={t('Alias Mapping')}>
      <div className='space-y-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Button onClick={handleAdd} size='sm'>
              <Plus className='mr-2 h-4 w-4' />
              {t('Add Alias Mapping')}
            </Button>
            <Button
              onClick={handleBatchDelete}
              size='sm'
              variant='destructive'
              disabled={selectedIds.length === 0}
            >
              <Trash2 className='mr-2 h-4 w-4' />
              {t('Delete (')}
              {selectedIds.length})
            </Button>
            <Button
              onClick={handleSaveAll}
              size='sm'
              variant='secondary'
              disabled={!hasChanges || updateOption.isPending}
            >
              <Save className='mr-2 h-4 w-4' />
              {updateOption.isPending ? t('Saving...') : t('Save Settings')}
            </Button>
          </div>
          <SettingsSwitchField
            checked={isEnabled}
            onCheckedChange={handleToggleEnabled}
            label={t('Enabled')}
            className='py-0'
          />
        </div>

        <StaticDataTable
          data={rules}
          getRowKey={(rule) => rule.id}
          emptyContent={t(
            'No alias mappings yet. Click "Add Alias Mapping" to create one.'
          )}
          columns={[
            {
              id: 'select',
              header: (
                <Checkbox
                  checked={
                    selectedIds.length === rules.length && rules.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              ),
              className: 'w-12',
              cell: (rule) => (
                <Checkbox
                  checked={selectedIds.includes(rule.id)}
                  onCheckedChange={(checked) =>
                    toggleSelectOne(rule.id, checked as boolean)
                  }
                />
              ),
            },
            {
              id: 'label',
              header: t('Label'),
              cellClassName: 'max-w-xs truncate font-medium',
              cell: (rule) => rule.label,
            },
            {
              id: 'mapping-group',
              header: t('Mapping Group'),
              cellClassName: 'text-muted-foreground max-w-md truncate',
              cell: (rule) => rule.mappingGroup,
            },
            {
              id: 'actions',
              header: t('Actions'),
              className: 'w-32',
              cell: (rule) => (
                <div className='flex gap-2'>
                  <Button
                    onClick={() => handleEdit(rule)}
                    size='sm'
                    variant='ghost'
                  >
                    <Edit className='h-4 w-4' />
                  </Button>
                  <Button
                    onClick={() => handleDelete(rule)}
                    size='sm'
                    variant='ghost'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      <Dialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={
          editingRule ? t('Edit Alias Mapping') : t('Add Alias Mapping')
        }
        description={t('Create or update alias mapping rules')}
        contentClassName='max-w-2xl'
        contentHeight='auto'
        bodyClassName='space-y-4'
        footer={
          <>
            <Button
              type='button'
              variant='outline'
              onClick={() => setShowDialog(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type='submit' form={ALIAS_MAPPING_FORM_ID}>
              {editingRule ? t('Update') : t('Add')}
            </Button>
          </>
        }
      >
        <Form {...form}>
          <form
            id={ALIAS_MAPPING_FORM_ID}
            onSubmit={form.handleSubmit(handleSubmitForm)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='label'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Label')}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t('Enter alias label')}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t('Maximum 100 characters')}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='mappingGroup'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Mapping Group')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t(
                        'Enter mapping group as JSON, e.g. {"model_a": "model_b"}'
                      )}
                      rows={16}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t(
                      'Maximum 5000 characters. JSON format for model alias mapping.'
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('Are you sure?')}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget === 'single'
                ? 'This alias mapping will be removed from the list.'
                : `${selectedIds.length} alias mappings will be removed from the list.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('Cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t('Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  )
}

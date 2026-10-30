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
import { useForm } from 'react-hook-form'
import { Plus, Edit, Trash2, Save, Eye, Minus } from 'lucide-react'
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { StaticDataTable } from '@/components/data-table'
import { Dialog } from '@/components/dialog'
import { SettingsSwitchField } from '../components/settings-form-layout'
import { SettingsSection } from '../components/settings-section'
import { useUpdateOption } from '../hooks/use-update-option'
import type { AliasMappingRule, MappingPair } from './types'

type AliasMappingSectionProps = {
  enabled: boolean
  data: string
}

type FormValues = { label: string }

const FORM_ID = 'alias-mapping-form'

type AliasMap = Record<string, Record<string, string>>

function objectToPairs(mappings: unknown): MappingPair[] {
  if (!mappings || typeof mappings !== 'object' || Array.isArray(mappings)) {
    return []
  }
  return Object.entries(mappings as Record<string, string>).map(
    ([original, alias]) => [original, alias] as MappingPair
  )
}

function parseAliasMap(raw: string): AliasMappingRule[] {
  let map: AliasMap = {}
  try {
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      map = parsed as AliasMap
    }
  } catch {
    map = {}
  }

  return Object.entries(map).map(([label, mappings], idx) => ({
    id: idx + 1,
    label,
    mappingGroup: objectToPairs(mappings),
  }))
}

function buildAliasMap(rules: AliasMappingRule[]): AliasMap {
  const map: AliasMap = {}
  for (const rule of rules) {
    const label = rule.label.trim()
    if (!label) continue
    const inner: Record<string, string> = {}
    for (const [original, alias] of rule.mappingGroup) {
      const originalName = original.trim()
      const aliasName = alias.trim()
      if (originalName !== '' && aliasName !== '') {
        inner[originalName] = aliasName
      }
    }
    map[label] = inner
  }
  return map
}

function formatMappingPreview(pairs: MappingPair[]): string {
  if (pairs.length === 0) return '-'
  const first = `"${pairs[0][0]}":"${pairs[0][1]}"`
  if (pairs.length === 1) return first
  return `${first}…`
}

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

  const [showFormDialog, setShowFormDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)

  const [editingRule, setEditingRule] = useState<AliasMappingRule | null>(null)
  const [viewingRule, setViewingRule] = useState<AliasMappingRule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'batch'>(
    'single'
  )

  const [pairs, setPairs] = useState<MappingPair[]>([])

  const form = useForm<FormValues>({ defaultValues: { label: '' } })

  useEffect(() => {
    setRules(parseAliasMap(data))
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

  const openAddDialog = () => {
    setEditingRule(null)
    form.reset({ label: '' })
    setPairs([['', '']])
    setShowFormDialog(true)
  }

  const openEditDialog = (rule: AliasMappingRule) => {
    setEditingRule(rule)
    form.reset({ label: rule.label })
    setPairs(
      rule.mappingGroup.length > 0
        ? rule.mappingGroup.map((p) => [...p] as MappingPair)
        : [['', '']]
    )
    setShowFormDialog(true)
  }

  const openViewDialog = (rule: AliasMappingRule) => {
    setViewingRule(rule)
    setShowViewDialog(true)
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
          { count: selectedIds.length }
        )
      )
    }
    setShowDeleteDialog(false)
    setEditingRule(null)
  }

  const addPairRow = () => {
    setPairs((prev) => [...prev, ['', '']])
  }

  const removePairRow = (index: number) => {
    setPairs((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePairValue = (
    index: number,
    slot: 0 | 1,
    value: string
  ) => {
    setPairs((prev) =>
      prev.map((pair, i) => {
        if (i !== index) return pair
        const next = [...pair] as MappingPair
        next[slot] = value
        return next
      })
    )
  }

  const handleSubmitForm = (values: FormValues) => {
    const label = values.label.trim()
    if (!label) {
      form.setError('label', { message: t('Label is required') })
      return
    }

    const cleanedPairs = pairs.filter(
      ([k, v]) => k.trim() !== '' && v.trim() !== ''
    )

    if (editingRule) {
      setRules((prev) =>
        prev.map((item) =>
          item.id === editingRule.id
            ? { ...item, label, mappingGroup: cleanedPairs }
            : item
        )
      )
      toast.success(
        t('Alias mapping updated. Click "Save Settings" to apply.')
      )
    } else {
      const newId = Math.max(...rules.map((item) => item.id), 0) + 1
      setRules((prev) => [
        ...prev,
        { id: newId, label, mappingGroup: cleanedPairs },
      ])
      toast.success(
        t('Alias mapping added. Click "Save Settings" to apply.')
      )
    }
    setHasChanges(true)
    setShowFormDialog(false)
  }

  const handleSaveAll = async () => {
    try {
      await updateOption.mutateAsync({
        key: 'ModelAliasMap',
        value: JSON.stringify(buildAliasMap(rules)),
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
            <Button onClick={openAddDialog} size='sm'>
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
              cellClassName: 'max-w-md',
              cell: (rule) => (
                <div className='flex items-center gap-2'>
                  <span className='text-muted-foreground truncate'>
                    {formatMappingPreview(rule.mappingGroup)}
                  </span>
                  {rule.mappingGroup.length > 0 && (
                    <Button
                      onClick={() => openViewDialog(rule)}
                      size='sm'
                      variant='outline'
                      className='shrink-0'
                    >
                      <Eye className='mr-1 h-3 w-3' />
                      {t('View')}
                    </Button>
                  )}
                </div>
              ),
            },
            {
              id: 'actions',
              header: t('Actions'),
              className: 'w-32',
              cell: (rule) => (
                <div className='flex gap-2'>
                  <Button
                    onClick={() => openEditDialog(rule)}
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
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        title={t('Mapping Group Details')}
        description={viewingRule?.label ?? ''}
        contentClassName='max-w-2xl'
        contentHeight='auto'
        bodyClassName='space-y-3'
        footer={
          <Button
            type='button'
            variant='outline'
            onClick={() => setShowViewDialog(false)}
          >
            {t('Close')}
          </Button>
        }
      >
        {viewingRule && (
          <div className='space-y-3'>
            <div>
              <span className='text-muted-foreground text-sm'>
                {t('Label')}:{' '}
              </span>
              <span className='text-sm font-medium'>
                {viewingRule.label}
              </span>
            </div>
            {viewingRule.mappingGroup.length > 0 ? (
              <div className='space-y-2'>
                {viewingRule.mappingGroup.map(([original, alias], idx) => (
                  <div
                    key={idx}
                    className='flex items-center gap-2'
                  >
                    <Input value={original} disabled className='flex-1' />
                    <span className='text-muted-foreground'>→</span>
                    <Input value={alias} disabled className='flex-1' />
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-muted-foreground text-sm'>
                {t('No mapping pairs')}
              </p>
            )}
          </div>
        )}
      </Dialog>

      <Dialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
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
              onClick={() => setShowFormDialog(false)}
            >
              {t('Cancel')}
            </Button>
            <Button type='submit' form={FORM_ID}>
              {editingRule ? t('Update') : t('Add')}
            </Button>
          </>
        }
      >
        <Form {...form}>
          <form
            id={FORM_ID}
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <FormLabel>{t('Mapping Group')}</FormLabel>
                <Button
                  type='button'
                  onClick={addPairRow}
                  size='sm'
                  variant='outline'
                >
                  <Plus className='mr-1 h-3 w-3' />
                  {t('Add mapping pair')}
                </Button>
              </div>
              <div className='space-y-2 rounded-md border p-3'>
                {pairs.length > 0 ? (
                  pairs.map(([original, alias], idx) => (
                    <div
                      key={idx}
                      className='flex items-center gap-2'
                    >
                      <Input
                        value={original}
                        onChange={(e) =>
                          updatePairValue(idx, 0, e.target.value)
                        }
                        placeholder={t('Original Name')}
                        className='flex-1'
                      />
                      <span className='text-muted-foreground'>→</span>
                      <Input
                        value={alias}
                        onChange={(e) =>
                          updatePairValue(idx, 1, e.target.value)
                        }
                        placeholder={t('Alias Name')}
                        className='flex-1'
                      />
                      <Button
                        type='button'
                        onClick={() => removePairRow(idx)}
                        size='sm'
                        variant='ghost'
                        className='shrink-0'
                      >
                        <Minus className='h-4 w-4' />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className='text-muted-foreground py-2 text-center text-sm'>
                    {t('No mapping pairs')}
                  </p>
                )}
              </div>
            </div>
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

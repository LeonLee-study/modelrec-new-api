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
import type { AliasMappingSettings } from './types'
import { createSectionRegistry } from '../utils/section-registry'
import { AliasMappingSection } from './alias-mapping-section'

const ALIAS_MAPPING_SECTIONS = [
  {
    id: 'alias-mapping',
    titleKey: 'Alias Mapping',
    build: (settings: AliasMappingSettings) => (
      <AliasMappingSection
        enabled={settings['alias_mapping_setting.enabled']}
        data={settings['alias_mapping_setting.data']}
      />
    ),
  },
] as const

export type AliasMappingSectionId =
  (typeof ALIAS_MAPPING_SECTIONS)[number]['id']

const aliasMappingRegistry = createSectionRegistry<
  AliasMappingSectionId,
  AliasMappingSettings
>({
  sections: ALIAS_MAPPING_SECTIONS,
  defaultSection: 'alias-mapping',
  basePath: '/system-settings/alias-mapping',
  urlStyle: 'path',
})

export const ALIAS_MAPPING_SECTION_IDS = aliasMappingRegistry.sectionIds
export const ALIAS_MAPPING_DEFAULT_SECTION = aliasMappingRegistry.defaultSection
export const getAliasMappingSectionNavItems =
  aliasMappingRegistry.getSectionNavItems
export const getAliasMappingSectionContent =
  aliasMappingRegistry.getSectionContent
export const getAliasMappingSectionMeta = aliasMappingRegistry.getSectionMeta

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
import type {
  CategoryKey,
  FilterGroupConfig,
  PriceListStats,
  PricingRuleValues,
} from './types'

// ----------------------------------------------------------------------------
// Price List Constants
// ----------------------------------------------------------------------------

/** Sentinel value for "no filter applied" across all filter groups. */
export const FILTER_ALL = 'all'

/**
 * Placeholder rule values mirroring the approved design mock.
 *
 * These numbers are the parts of the hero that must not stay hardcoded:
 * replace this constant with the pricing-rules API response when the endpoint
 * lands.
 */
export const PLACEHOLDER_RULE_VALUES: PricingRuleValues = {
  pr_CNY: 1000,
  pr_USD: 7000,
  std_USD: 2,
  suidian_token: 71.43,
  cost_rate: 7,
}

/** Placeholder scale figures for the hero subtitle. */
export const PLACEHOLDER_STATS: PriceListStats = {
  sup_num: 6,
  mod_num: 120,
}

/**
 * Active/inactive class pairs for the filter chip rows, keyed by scheme.
 * Orange = provider, green = model_type.
 */
export const FILTER_SCHEME_CLASSES = {
  orange: {
    active:
      '!border-transparent !bg-[#FF8A00] !text-white hover:!bg-[#E67600]',
    inactive:
      'border-[#e7e0d3] bg-white text-gray-700 hover:border-[#FF8A00] hover:text-[#FF8A00]',
  },
  green: {
    active:
      '!border-transparent !bg-[#007B43] !text-white hover:!bg-[#006536]',
    inactive:
      'border-[#e7e0d3] bg-white text-gray-700 hover:border-[#007B43] hover:text-[#007B43]',
  },
} as const

/**
 * Declarative config for the two filter rows (provider + model_type).
 * Each group starts with a single `All` chip; additional options will be
 * populated from the pricing table API once it lands.
 */
export const FILTER_GROUPS: FilterGroupConfig[] = [
  {
    key: 'provider',
    labelKey: 'priceList.filter.provider',
    scheme: 'orange',
    options: [{ value: FILTER_ALL, labelKey: 'All' }],
  },
  {
    key: 'model_type',
    labelKey: 'priceList.filter.modelType',
    scheme: 'green',
    options: [
      { value: FILTER_ALL, labelKey: 'All' },
      { value: 'text_generation', labelKey: 'priceList.category.textGeneration' },
      { value: 'multi_model', labelKey: 'priceList.category.multiModel' },
      { value: 'image_generation', labelKey: 'priceList.category.imageGeneration' },
      { value: 'image_recognition', labelKey: 'priceList.category.imageRecognition' },
      { value: 'video_generation', labelKey: 'priceList.category.videoGeneration' },
      { value: 'video_recognition', labelKey: 'priceList.category.videoRecognition' },
      { value: 'voice_generation', labelKey: 'priceList.category.voiceGeneration' },
      { value: 'voice_recognition', labelKey: 'priceList.category.voiceRecognition' },
      { value: 'world_model', labelKey: 'priceList.category.worldModel' },
      { value: 'vector', labelKey: 'priceList.category.vector' },
    ],
  },
]

// ----------------------------------------------------------------------------
// Category table metadata
// ----------------------------------------------------------------------------

/** Display metadata for one pricing-table category section. */
export type CategoryConfig = {
  key: CategoryKey
  /** i18n key for the category heading (e.g. "📝 文本生成"). */
  labelKey: string
  /** i18n key for the uppercase English subtitle. */
  subtitleKey: string
  /** Emoji rendered inside the icon container next to the heading. */
  emoji: string
}

/**
 * Ordered list of the ten category sections rendered in the main content
 * area. Column definitions and row types live in the category-section
 * component because each category has a distinct column shape.
 *
 * Row data for every category is currently an empty array; the pricing-table
 * API will populate them later.
 */
export const CATEGORIES: CategoryConfig[] = [
  {
    key: 'text_generation',
    labelKey: 'priceList.category.textGeneration',
    subtitleKey: 'priceList.category.textGenerationSub',
    emoji: '📝',
  },
  {
    key: 'multi_model',
    labelKey: 'priceList.category.multiModel',
    subtitleKey: 'priceList.category.multiModelSub',
    emoji: '🖼️',
  },
  {
    key: 'image_generation',
    labelKey: 'priceList.category.imageGeneration',
    subtitleKey: 'priceList.category.imageGenerationSub',
    emoji: '🎨',
  },
  {
    key: 'image_recognition',
    labelKey: 'priceList.category.imageRecognition',
    subtitleKey: 'priceList.category.imageRecognitionSub',
    emoji: '👁️',
  },
  {
    key: 'video_generation',
    labelKey: 'priceList.category.videoGeneration',
    subtitleKey: 'priceList.category.videoGenerationSub',
    emoji: '🎬',
  },
  {
    key: 'video_recognition',
    labelKey: 'priceList.category.videoRecognition',
    subtitleKey: 'priceList.category.videoRecognitionSub',
    emoji: '🎞️',
  },
  {
    key: 'voice_generation',
    labelKey: 'priceList.category.voiceGeneration',
    subtitleKey: 'priceList.category.voiceGenerationSub',
    emoji: '🔊',
  },
  {
    key: 'voice_recognition',
    labelKey: 'priceList.category.voiceRecognition',
    subtitleKey: 'priceList.category.voiceRecognitionSub',
    emoji: '🎙️',
  },
  {
    key: 'world_model',
    labelKey: 'priceList.category.worldModel',
    subtitleKey: 'priceList.category.worldModelSub',
    emoji: '🌍',
  },
  {
    key: 'vector',
    labelKey: 'priceList.category.vector',
    subtitleKey: 'priceList.category.vectorSub',
    emoji: '🧩',
  },
]

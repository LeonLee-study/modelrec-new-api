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
import type { PricingModel } from '@/features/pricing/types'
import type {
  CategoryKey,
  FilterOption,
  TokenPricingRow,
  UnitPricingRow,
  VectorRow,
  WorldModelRow,
} from '../types'

/** Backend pricing_kind → frontend CategoryKey. */
const PRICING_KIND_TO_CATEGORY: Record<string, CategoryKey> = {
  text: 'text_generation',
  multimodal: 'multi_model',
  image_generate: 'image_generation',
  image_recognize: 'image_recognition',
  video_generate: 'video_generation',
  video_recognize: 'video_recognition',
  speech_synthesis: 'voice_generation',
  speech_recognize: 'voice_recognition',
  world: 'world_model',
  vector: 'vector',
}

export function getCategoryKey(pricingKind: string): CategoryKey | null {
  return PRICING_KIND_TO_CATEGORY[pricingKind] ?? null
}

function buildVendorMap(
  vendors: { id: number; name: string }[]
): Map<number, string> {
  return new Map(vendors.map((v) => [v.id, v.name]))
}

/** Round to 3 decimal places (standard rounding at the 4th digit). */
function r3(v: number | null | undefined): number {
  return Math.round((v ?? 0) * 1000) / 1000
}

// ---------------------------------------------------------------------------
// Row builders — match API response field names exactly
// ---------------------------------------------------------------------------

/**
 * Token-based row: text, multimodal, image_recognize, speech_synthesis.
 * API fields: official_input_price_usd, official_output_price_usd,
 *             suidian_input_per_1m, suidian_output_per_1m.
 */
function toTokenRow(m: PricingModel, vendor: string): TokenPricingRow {
  return {
    model_name: m.model_name,
    provider: vendor,
    in_pr_USD: r3(m.official_input_price_usd),
    out_pr_USD: r3(m.official_output_price_usd),
    in_pr_SD: r3(m.suidian_input_per_1m),
    out_pr_SD: r3(m.suidian_output_per_1m),
  }
}

/**
 * Unit-based row: image_generate, video_generate, video_recognize,
 * speech_recognize.
 * API fields: official_unit_price_usd, suidian_unit_price.
 */
function toUnitRow(m: PricingModel, vendor: string): UnitPricingRow {
  return {
    model_name: m.model_name,
    provider: vendor,
    unit_pr_USD: r3(m.official_unit_price_usd),
    unit_pr_SD: r3(m.suidian_unit_price),
  }
}

/** World model: input per call, output per second. */
function toWorldRow(m: PricingModel, vendor: string): WorldModelRow {
  return {
    model_name: m.model_name,
    provider: vendor,
    t_in_pr_USD: r3(m.official_input_per_call_usd),
    t_in_pr_SD: r3(m.suidian_input_per_call),
    s_out_pr_USD: r3(m.official_output_per_second_usd),
    s_out_pr_SD: r3(m.suidian_output_per_second),
  }
}

/** Vector & retrieval: text input + vector input per 1M. */
function toVectorRow(m: PricingModel, vendor: string): VectorRow {
  return {
    model_name: m.model_name,
    provider: vendor,
    in_pr_USD: r3(m.official_text_input_price_usd),
    in_pr_SD: r3(m.suidian_text_input_per_1m),
    vec_in_pr_USD: r3(m.official_vector_input_price_usd),
    vec_in_pr_SD: r3(m.suidian_vector_input_per_1m),
  }
}

// ---------------------------------------------------------------------------
// Public transforms
// ---------------------------------------------------------------------------

type TransformedRow = {
  categoryKey: CategoryKey
  row: Record<string, unknown>
}

/** Transform a single API record into its category-specific row shape. */
export function transformPricingRow(
  m: PricingModel,
  vendorMap: Map<number, string>
): TransformedRow | null {
  const categoryKey = getCategoryKey(m.pricing_kind ?? '')
  if (!categoryKey) return null

  const vendor = m.vendor_id ? vendorMap.get(m.vendor_id) ?? '' : ''

  let row: Record<string, unknown>
  switch (categoryKey) {
    // Token-based (4 fields: input/output × USD/SD)
    case 'text_generation':
    case 'multi_model':
    case 'image_recognition':
    case 'voice_generation':
      row = toTokenRow(m, vendor)
      break

    // Unit-based (2 fields: unit × USD/SD)
    case 'image_generation':
    case 'video_generation':
    case 'video_recognition':
    case 'voice_recognition':
      row = toUnitRow(m, vendor)
      break

    // Special types
    case 'world_model':
      row = toWorldRow(m, vendor)
      break
    case 'vector':
      row = toVectorRow(m, vendor)
      break
  }

  return { categoryKey, row }
}

type CategoryGrouped = Record<CategoryKey, Record<string, unknown>[]>

function emptyGrouped(): CategoryGrouped {
  return {
    text_generation: [],
    multi_model: [],
    image_generation: [],
    image_recognition: [],
    video_generation: [],
    video_recognition: [],
    voice_generation: [],
    voice_recognition: [],
    world_model: [],
    vector: [],
  }
}

/** Transform the full API response into per-category row arrays. */
export function transformPricingData(
  models: PricingModel[],
  vendors: { id: number; name: string }[]
): CategoryGrouped {
  const vendorMap = buildVendorMap(vendors)
  const grouped = emptyGrouped()

  for (const m of models) {
    const result = transformPricingRow(m, vendorMap)
    if (result) {
      grouped[result.categoryKey].push(result.row)
    }
  }

  return grouped
}

/** Extract unique vendor names from the model list for filter chips. */
export function extractProviderOptions(
  models: PricingModel[],
  vendors: { id: number; name: string }[]
): FilterOption[] {
  const vendorMap = buildVendorMap(vendors)
  const seen = new Set<string>()
  const options: FilterOption[] = []

  for (const m of models) {
    if (!m.vendor_id) continue
    const name = vendorMap.get(m.vendor_id)
    if (name && !seen.has(name)) {
      seen.add(name)
      options.push({ value: name, labelKey: name })
    }
  }

  return options.sort((a, b) => a.value.localeCompare(b.value))
}

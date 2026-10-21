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
// ----------------------------------------------------------------------------
// Price list types
// ----------------------------------------------------------------------------

/**
 * Values displayed in the pricing-rule cards of the page hero.
 *
 * Currently sourced from `PLACEHOLDER_RULE_VALUES`; once the pricing-rules
 * endpoint exists this becomes its response shape, and the hero only needs a
 * different value source at its call site.
 */
export type PricingRuleValues = {
  /** 充值汇率：1 人民币可兑换的燧点数 */
  pr_CNY: number
  /** 充值汇率：1 美元可兑换的燧点数 */
  pr_USD: number
  /** 内部基准价：1M Token 对应的美元基准价 */
  std_USD: number
  /** 换算锚点：1 燧点对应的 Token 额度 */
  suidian_token: number
  /** 美元对人民币的固定折算汇率，用于 RULE 01 注解中的「1：N」 */
  cost_rate: number
}

/**
 * Scale figures rendered in the hero subtitle.
 *
 * Same placeholder arrangement as `PricingRuleValues`: sourced from
 * `PLACEHOLDER_STATS` until the pricing-rules endpoint exists.
 */
export type PriceListStats = {
  /** 已接入的供应商数量 */
  sup_num: number
  /** 已上架的模型数量 */
  mod_num: number
}

// ----------------------------------------------------------------------------
// Filter types
// ----------------------------------------------------------------------------

/** Filter groups shown as chip rows in the filter panel. */
export type FilterGroupKey = 'provider' | 'model_type'

/** Visual scheme for a filter chip row (matches the reference mock). */
export type FilterGroupScheme = 'orange' | 'green'

/**
 * One filter group's selected value. The sentinel `'all'` (see `FILTER_ALL`)
 * means the group is inactive.
 */
export type PriceListFilterState = Record<FilterGroupKey, string>

/** A single selectable option inside a filter chip row. */
export type FilterOption = {
  value: string
  /** i18n key used as the chip label. */
  labelKey: string
}

/** Declarative config for one filter chip row. */
export type FilterGroupConfig = {
  key: FilterGroupKey
  /** i18n key for the group's left-side label (e.g. "计费口径"). */
  labelKey: string
  scheme: FilterGroupScheme
  /**
   * Options rendered as chips. Initially a single `All` entry per group;
   * additional options will be appended from the pricing-table API once it
   * lands.
   */
  options: FilterOption[]
}

// ----------------------------------------------------------------------------
// Category table types
// ----------------------------------------------------------------------------

/** Keys for the ten pricing-table category sections. */
export type CategoryKey =
  | 'text_generation'
  | 'multi_model'
  | 'image_generation'
  | 'image_recognition'
  | 'video_generation'
  | 'video_recognition'
  | 'voice_generation'
  | 'voice_recognition'
  | 'world_model'
  | 'vector'

/**
 * Text generation / multimodal row — input and output prices listed
 * separately, both in USD and suidian (SD) per 1M tokens.
 */
export type TextGenerationRow = {
  model_name: string
  provider: string
  in_pr_USD: number
  out_pr_USD: number
  in_pr_SD: number
  out_pr_SD: number
}

/** Image generation / recognition row — per-image pricing. */
export type ImageRow = {
  model_name: string
  provider: string
  pc_pr_USD: number
  pc_pr_SD: number
}

/**
 * Video generation / recognition and voice recognition row — per-second
 * pricing.
 */
export type PerSecondRow = {
  model_name: string
  provider: string
  s_pr_USD: number
  s_pr_SD: number
}

/** Voice generation (TTS) row — per-10K-characters pricing. */
export type VoiceGenerationRow = {
  model_name: string
  provider: string
  w_pr_USD: number
  w_pr_SD: number
}

/** World model row — input billed per call, output billed per second. */
export type WorldModelRow = {
  model_name: string
  provider: string
  t_in_pr_USD: number
  t_in_pr_SD: number
  s_out_pr_USD: number
  s_out_pr_SD: number
}

/**
 * Vector & retrieval row — text input and vector input prices listed
 * separately, both in USD and suidian per 1M.
 */
export type VectorRow = {
  model_name: string
  provider: string
  in_pr_USD: number
  in_pr_SD: number
  vec_in_pr_USD: number
  vec_in_pr_SD: number
}

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

// ============================================================================
// Model Alias Map (ModelAliasMap option)
// ============================================================================

/**
 * Extract the top-level alias labels (for example "customer-a", "customer-b")
 * from the `ModelAliasMap` system option.
 *
 * The option value is a JSON string shaped like:
 *   { "<label>": { "<model>": "<alias>", ... }, ... }
 */
export function extractModelAliasMapKeys(
  options: Array<{ key: string; value: string }> | undefined
): string[] {
  if (!options) return []

  const entry = options.find((option) => option.key === 'ModelAliasMap')
  if (!entry) return []

  try {
    const parsed = JSON.parse(entry.value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.keys(parsed as Record<string, unknown>)
    }
  } catch {
    /* malformed JSON — treat as empty */
  }

  return []
}
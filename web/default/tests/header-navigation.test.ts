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
import { describe, expect, test } from 'bun:test'

import { parseHeaderNavModules as parseRuntimeHeaderNavModules } from '../src/lib/nav-modules'
import {
  HEADER_NAV_DEFAULT,
  parseHeaderNavModules as parseSettingsHeaderNavModules,
} from '../src/features/system-settings/maintenance/config'

describe('header navigation configuration', () => {
  test('enables Playground by default in runtime and settings parsers', () => {
    expect(parseRuntimeHeaderNavModules(undefined).playground).toBe(true)
    expect(parseSettingsHeaderNavModules(undefined).playground).toBe(true)
    expect(HEADER_NAV_DEFAULT.playground).toBe(true)
  })

  test('keeps a saved Playground visibility setting consistent', () => {
    const serialized = JSON.stringify({ playground: false })

    expect(parseRuntimeHeaderNavModules(serialized).playground).toBe(false)
    expect(parseSettingsHeaderNavModules(serialized).playground).toBe(false)
  })

  test('treats Price List as an access module with public defaults', () => {
    const publicAccess = { enabled: true, requireAuth: false }

    expect(parseRuntimeHeaderNavModules(undefined).price_list).toEqual(
      publicAccess
    )
    expect(parseSettingsHeaderNavModules(undefined).price_list).toEqual(
      publicAccess
    )
    expect(HEADER_NAV_DEFAULT.price_list).toEqual(publicAccess)
  })

  test('keeps a saved Price List access setting consistent', () => {
    const serialized = JSON.stringify({
      price_list: { enabled: false, requireAuth: true },
    })
    const savedAccess = { enabled: false, requireAuth: true }

    expect(parseRuntimeHeaderNavModules(serialized).price_list).toEqual(
      savedAccess
    )
    expect(parseSettingsHeaderNavModules(serialized).price_list).toEqual(
      savedAccess
    )
  })
})

package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestLegacyCurrencyPointsUpdates(t *testing.T) {
	t.Parallel()

	t.Run("migrates symbol and rate together", func(t *testing.T) {
		t.Parallel()
		updates := legacyCurrencyPointsUpdates("燧点", 7000)
		require.Equal(t, "积分", updates["general_setting.custom_currency_symbol"])
		require.Equal(t, "140", updates["general_setting.custom_currency_exchange_rate"])
	})

	t.Run("accepts alternate legacy symbol", func(t *testing.T) {
		t.Parallel()
		updates := legacyCurrencyPointsUpdates("遂点", 140)
		assert.Equal(t, "积分", updates["general_setting.custom_currency_symbol"])
		_, hasRate := updates["general_setting.custom_currency_exchange_rate"]
		assert.False(t, hasRate)
	})

	t.Run("skips when already on points", func(t *testing.T) {
		t.Parallel()
		updates := legacyCurrencyPointsUpdates("积分", 140)
		assert.Empty(t, updates)
	})

	t.Run("rate only when symbol already migrated", func(t *testing.T) {
		t.Parallel()
		updates := legacyCurrencyPointsUpdates("积分", 7000)
		require.Len(t, updates, 1)
		assert.Equal(t, "140", updates["general_setting.custom_currency_exchange_rate"])
	})
}

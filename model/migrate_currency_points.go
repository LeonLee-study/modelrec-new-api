package model

import (
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/operation_setting"
)

const (
	legacyCurrencySymbolSuidian    = "燧点"
	legacyCurrencySymbolSuidianAlt = "遂点"
	pointsCurrencySymbol           = "积分"
	// legacyCustomCurrencyPerUSD 为旧燧点展示汇率：1 USD = 7000 燧点。
	legacyCustomCurrencyPerUSD = 7000.0
)

// legacyCurrencyPointsUpdates 根据当前通用设置，生成燧点→积分的一次性配置更新。
// 规则与产品一致：1 积分 = 50 燧点，故展示汇率 7000 → PointsPerUSD(140)。
func legacyCurrencyPointsUpdates(symbol string, rate float64) map[string]string {
	updates := make(map[string]string)
	switch strings.TrimSpace(symbol) {
	case legacyCurrencySymbolSuidian, legacyCurrencySymbolSuidianAlt:
		updates["general_setting.custom_currency_symbol"] = pointsCurrencySymbol
	}
	if rate == legacyCustomCurrencyPerUSD {
		updates["general_setting.custom_currency_exchange_rate"] = strconv.FormatFloat(PointsPerUSD, 'f', -1, 64)
	}
	return updates
}

// MigrateLegacySuidianCurrencyOptions 将模型广场等 CUSTOM 额度展示从燧点口径刷新为积分口径。
// 幂等：仅在检测到旧符号/旧汇率时写入；已是积分口径则跳过。
func MigrateLegacySuidianCurrencyOptions() {
	gs := operation_setting.GetGeneralSetting()
	if gs == nil {
		return
	}
	updates := legacyCurrencyPointsUpdates(gs.CustomCurrencySymbol, gs.CustomCurrencyExchangeRate)
	if len(updates) == 0 {
		return
	}
	if err := UpdateOptionsBulk(updates); err != nil {
		common.SysError("failed to migrate legacy suidian currency options: " + err.Error())
		return
	}
	common.SysLog("migrated legacy suidian currency options to points (symbol/rate ÷50)")
}

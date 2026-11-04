package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParsePlazaPriceTextTokenIO(t *testing.T) {
	t.Parallel()

	// MiniMax-M2：输入 42 / 输出 168 积分/1M（对应原 2100/8400 燧点，同 USD）
	p, err := ParsePlazaPriceText("输入 积分42/1M · 输出 积分168/1M")
	require.NoError(t, err)
	require.False(t, p.UsePrice)
	assert.InDelta(t, 42.0/280.0, p.ModelRatio, 1e-9) // 42/140/2
	assert.InDelta(t, 4.0, p.CompletionRatio, 1e-9)
	assert.InDelta(t, 42.0, p.InputSuidian1M, 1e-9)
	assert.InDelta(t, 168.0, p.OutputSuidian1M, 1e-9)

	inputUSD, outputUSD := OfficialTokenPriceUSD(p.ModelRatio, p.CompletionRatio)
	assert.InDelta(t, 42.0/140.0, inputUSD, 1e-9)
	assert.InDelta(t, 168.0/140.0, outputUSD, 1e-9)
	assert.InDelta(t, 42.0, ToSuidianPrice(inputUSD), 1e-6)
	assert.InDelta(t, 168.0, ToSuidianPrice(outputUSD), 1e-6)
}

func TestParsePlazaPriceTextTokenIOLegacySuidian(t *testing.T) {
	t.Parallel()

	// 兼容历史「燧点」文案；数值须已按积分口径填写
	p, err := ParsePlazaPriceText("输入 燧点42/1M · 输出 燧点168/1M")
	require.NoError(t, err)
	assert.InDelta(t, 42.0/280.0, p.ModelRatio, 1e-9)
	assert.InDelta(t, 4.0, p.CompletionRatio, 1e-9)
}

func TestParsePlazaPriceTextPerRequest(t *testing.T) {
	t.Parallel()

	p, err := ParsePlazaPriceText("积分 14 / 请求")
	require.NoError(t, err)
	require.True(t, p.UsePrice)
	assert.InDelta(t, 14.0/140.0, p.ModelPriceUSD, 1e-9)
	assert.InDelta(t, 14.0, ToSuidianPrice(p.ModelPriceUSD), 1e-6)
}

func TestParsePlazaPriceTextZeroToken(t *testing.T) {
	t.Parallel()

	p, err := ParsePlazaPriceText("输入 积分0/1M · 输出 积分0/1M")
	require.NoError(t, err)
	assert.Equal(t, 0.0, p.ModelRatio)
	assert.Equal(t, 1.0, p.CompletionRatio)
}

func TestParsePlazaPriceTextUnrecognized(t *testing.T) {
	t.Parallel()

	_, err := ParsePlazaPriceText("免费")
	require.Error(t, err)
}

func TestApplyOfficialPricingFieldsSpeechTokenFallback(t *testing.T) {
	t.Parallel()

	// 原 99960 燧点/1M → 同 USD 下为 1999.2 积分，四舍五入展示 1999
	p := Pricing{
		CategoryL1:      "6. 语音",
		CategoryL2:      "语音合成",
		QuotaType:       0,
		ModelRatio:      99960.0 / 14000.0,
		CompletionRatio: 1,
	}
	ApplyOfficialPricingFields(&p)
	require.Equal(t, PricingKindSpeechSynthesis, p.PricingKind)
	require.NotNil(t, p.OfficialInputPriceUSD)
	require.NotNil(t, p.SuidianInputPer1M)
	assert.InDelta(t, 99960.0/7000.0, *p.OfficialInputPriceUSD, 1e-9)
	assert.InDelta(t, 1999.0, *p.SuidianInputPer1M, 1e-3)
	assert.Nil(t, p.OfficialUnitPriceUSD)
}

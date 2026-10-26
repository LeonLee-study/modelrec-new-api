package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestParsePlazaPriceTextTokenIO(t *testing.T) {
	t.Parallel()

	// MiniMax-M2：输入 2100 / 输出 8400 燧点/1M
	p, err := ParsePlazaPriceText("输入 燧点2,100/1M · 输出 燧点8,400/1M")
	require.NoError(t, err)
	require.False(t, p.UsePrice)
	assert.InDelta(t, 2100.0/14000.0, p.ModelRatio, 1e-9) // 2100/7000/2
	assert.InDelta(t, 4.0, p.CompletionRatio, 1e-9)
	assert.InDelta(t, 2100.0, p.InputSuidian1M, 1e-9)
	assert.InDelta(t, 8400.0, p.OutputSuidian1M, 1e-9)

	inputUSD, outputUSD := OfficialTokenPriceUSD(p.ModelRatio, p.CompletionRatio)
	assert.InDelta(t, 2100.0/7000.0, inputUSD, 1e-9)
	assert.InDelta(t, 8400.0/7000.0, outputUSD, 1e-9)
	assert.InDelta(t, 2100.0, ToSuidianPrice(inputUSD), 1e-6)
	assert.InDelta(t, 8400.0, ToSuidianPrice(outputUSD), 1e-6)
}

func TestParsePlazaPriceTextPerRequest(t *testing.T) {
	t.Parallel()

	p, err := ParsePlazaPriceText("燧点 63 / 请求")
	require.NoError(t, err)
	require.True(t, p.UsePrice)
	assert.InDelta(t, 63.0/7000.0, p.ModelPriceUSD, 1e-9)
	assert.InDelta(t, 63.0, ToSuidianPrice(p.ModelPriceUSD), 1e-6)
}

func TestParsePlazaPriceTextZeroToken(t *testing.T) {
	t.Parallel()

	p, err := ParsePlazaPriceText("输入 燧点0/1M · 输出 燧点0/1M")
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

	p := Pricing{
		CategoryL1:      "6. 语音",
		CategoryL2:      "语音合成",
		QuotaType:       0,
		ModelRatio:      99_960.0 / 14_000.0,
		CompletionRatio: 1,
	}
	ApplyOfficialPricingFields(&p)
	require.Equal(t, PricingKindSpeechSynthesis, p.PricingKind)
	require.NotNil(t, p.OfficialInputPriceUSD)
	require.NotNil(t, p.SuidianInputPer1M)
	assert.InDelta(t, 99_960.0/7000.0, *p.OfficialInputPriceUSD, 1e-9)
	assert.InDelta(t, 99_960.0, *p.SuidianInputPer1M, 1e-3)
	assert.Nil(t, p.OfficialUnitPriceUSD)
}

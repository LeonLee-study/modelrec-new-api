package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestResolvePricingKind(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		kind     string
		l1       string
		l2       string
		expected string
	}{
		{name: "explicit multimodal", kind: "multimodal", l1: "文本", expected: PricingKindMultimodal},
		{name: "legacy image", kind: "image", l1: "", expected: PricingKindImageGenerate},
		{name: "legacy language", kind: "language", l1: "", expected: PricingKindSpeechSynthesis},
		{name: "image recognize l2", kind: "", l1: "2. 图片", l2: "图片理解", expected: PricingKindImageRecognize},
		{name: "image generate l2", kind: "", l1: "2. 图片", l2: "图片生成", expected: PricingKindImageGenerate},
		{name: "video generate", kind: "", l1: "3. 视频", l2: "视频生成", expected: PricingKindVideoGenerate},
		{name: "video recognize", kind: "", l1: "3. 视频", l2: "视频识别", expected: PricingKindVideoRecognize},
		{name: "speech synthesis", kind: "", l1: "6. 语音", l2: "语音合成", expected: PricingKindSpeechSynthesis},
		{name: "speech recognize", kind: "", l1: "6. 语音", l2: "语音识别", expected: PricingKindSpeechRecognize},
		{name: "world", kind: "", l1: "世界模型", l2: "", expected: PricingKindWorld},
		{name: "vector", kind: "", l1: "向量与检索", l2: "", expected: PricingKindVector},
		{name: "vlm", kind: "", l1: "4. 多模态", l2: "视觉语言模型", expected: PricingKindMultimodal},
		{name: "text", kind: "", l1: "1. 文本", l2: "通用对话", expected: PricingKindText},
		{name: "default text", kind: "", l1: "", expected: PricingKindText},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			assert.Equal(t, tt.expected, ResolvePricingKind(tt.kind, tt.l1, tt.l2))
		})
	}
}

func TestOfficialTokenPriceAndSuidian(t *testing.T) {
	t.Parallel()

	inputUSD, outputUSD := OfficialTokenPriceUSD(1.0, 4.0)
	assert.InDelta(t, 2.0, inputUSD, 1e-9)
	assert.InDelta(t, 8.0, outputUSD, 1e-9)
	assert.InDelta(t, 14000.0, ToSuidianPrice(inputUSD), 1e-9)
	assert.InDelta(t, 56000.0, ToSuidianPrice(outputUSD), 1e-9)
}

func TestApplyOfficialPricingFieldsText(t *testing.T) {
	t.Parallel()

	p := Pricing{
		CategoryL1:      "文本对话",
		QuotaType:       0,
		ModelRatio:      0.5,
		CompletionRatio: 2,
	}
	ApplyOfficialPricingFields(&p)

	require.Equal(t, PricingKindText, p.PricingKind)
	require.NotNil(t, p.OfficialInputPriceUSD)
	require.NotNil(t, p.OfficialOutputPriceUSD)
	require.NotNil(t, p.SuidianInputPer1M)
	require.NotNil(t, p.SuidianOutputPer1M)
	assert.InDelta(t, 1.0, *p.OfficialInputPriceUSD, 1e-9)
	assert.InDelta(t, 2.0, *p.OfficialOutputPriceUSD, 1e-9)
	assert.InDelta(t, 7000.0, *p.SuidianInputPer1M, 1e-9)
	assert.InDelta(t, 14000.0, *p.SuidianOutputPer1M, 1e-9)
	assert.Nil(t, p.OfficialUnitPriceUSD)
}

func TestApplyOfficialPricingFieldsImageGenerate(t *testing.T) {
	t.Parallel()

	p := Pricing{
		CategoryL1: "2. 图片",
		CategoryL2: "图片生成",
		QuotaType:  1,
		ModelPrice: 0.04,
	}
	ApplyOfficialPricingFields(&p)

	require.Equal(t, PricingKindImageGenerate, p.PricingKind)
	require.NotNil(t, p.OfficialUnitPriceUSD)
	require.NotNil(t, p.SuidianUnitPrice)
	assert.InDelta(t, 0.04, *p.OfficialUnitPriceUSD, 1e-9)
	assert.InDelta(t, 280.0, *p.SuidianUnitPrice, 1e-9)
	assert.Nil(t, p.OfficialInputPriceUSD)
}

func TestApplyOfficialPricingFieldsImageRecognize(t *testing.T) {
	t.Parallel()

	p := Pricing{
		CategoryL1: "2. 图片",
		CategoryL2: "图片理解",
		QuotaType:  1,
		ModelPrice: 0.02,
	}
	ApplyOfficialPricingFields(&p)
	require.Equal(t, PricingKindImageRecognize, p.PricingKind)
	require.NotNil(t, p.OfficialUnitPriceUSD)
	assert.InDelta(t, 140.0, *p.SuidianUnitPrice, 1e-9)
}

func TestApplyOfficialPricingFieldsWorld(t *testing.T) {
	t.Parallel()

	p := Pricing{
		PricingKind: PricingKindWorld,
		QuotaType:   1,
		ModelPrice:  0.1,
	}
	ApplyOfficialPricingFields(&p)
	require.Equal(t, PricingKindWorld, p.PricingKind)
	require.NotNil(t, p.OfficialInputPerCallUSD)
	require.NotNil(t, p.SuidianInputPerCall)
	assert.InDelta(t, 0.1, *p.OfficialInputPerCallUSD, 1e-9)
	assert.InDelta(t, 700.0, *p.SuidianInputPerCall, 1e-9)
	assert.Nil(t, p.OfficialOutputPerSecondUSD)
}

func TestApplyOfficialPricingFieldsVector(t *testing.T) {
	t.Parallel()

	p := Pricing{
		PricingKind: PricingKindVector,
		QuotaType:   0,
		ModelRatio:  0.5,
	}
	ApplyOfficialPricingFields(&p)
	require.Equal(t, PricingKindVector, p.PricingKind)
	require.NotNil(t, p.OfficialTextInputPriceUSD)
	require.NotNil(t, p.SuidianTextInputPer1M)
	assert.InDelta(t, 1.0, *p.OfficialTextInputPriceUSD, 1e-9)
	assert.InDelta(t, 7000.0, *p.SuidianTextInputPer1M, 1e-9)
	assert.Nil(t, p.OfficialVectorInputPriceUSD)
}

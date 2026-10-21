package model

import (
	"math"
	"strings"
)

// 与定价页抬头规则一致：基准价 $2/1M Token；燧点价 = 官方价 × 7000
const (
	OfficialPriceBenchmarkUSD = 2.0
	SuidianMultiplier         = 7000.0
)

// 列表按类型返回不同价格字段（2026-10-16 前端最新 10 类）
const (
	PricingKindText            = "text"
	PricingKindMultimodal      = "multimodal"
	PricingKindImageGenerate   = "image_generate"
	PricingKindImageRecognize  = "image_recognize"
	PricingKindVideoGenerate   = "video_generate"
	PricingKindVideoRecognize  = "video_recognize"
	PricingKindSpeechSynthesis = "speech_synthesis"
	PricingKindSpeechRecognize = "speech_recognize"
	PricingKindWorld           = "world"
	PricingKindVector          = "vector"
)

func floatPtr(v float64) *float64 {
	return &v
}

func isKnownPricingKind(kind string) bool {
	switch kind {
	case PricingKindText, PricingKindMultimodal,
		PricingKindImageGenerate, PricingKindImageRecognize,
		PricingKindVideoGenerate, PricingKindVideoRecognize,
		PricingKindSpeechSynthesis, PricingKindSpeechRecognize,
		PricingKindWorld, PricingKindVector:
		return true
	default:
		return false
	}
}

// normalizeLegacyPricingKind 兼容旧 kind 取值。
func normalizeLegacyPricingKind(kind string) string {
	switch kind {
	case "image", "image_gen":
		return PricingKindImageGenerate
	case "video", "video_gen":
		return PricingKindVideoGenerate
	case "language", "tts":
		return PricingKindSpeechSynthesis
	case "asr":
		return PricingKindSpeechRecognize
	case "base":
		return PricingKindText
	default:
		return kind
	}
}

// ResolvePricingKind 优先用显式 pricing_kind；否则按一级/二级分类推断。
func ResolvePricingKind(pricingKind, categoryL1 string, categoryL2 ...string) string {
	kind := normalizeLegacyPricingKind(strings.TrimSpace(strings.ToLower(pricingKind)))
	if isKnownPricingKind(kind) {
		return kind
	}

	l2 := ""
	if len(categoryL2) > 0 {
		l2 = strings.TrimSpace(categoryL2[0])
	}
	if l2 != "" {
		switch {
		case strings.Contains(l2, "图片理解") || strings.Contains(l2, "图片识别"):
			return PricingKindImageRecognize
		case strings.Contains(l2, "图片生成"):
			return PricingKindImageGenerate
		case strings.Contains(l2, "视频识别"):
			return PricingKindVideoRecognize
		case strings.Contains(l2, "视频"):
			return PricingKindVideoGenerate
		case strings.Contains(l2, "语音识别"):
			return PricingKindSpeechRecognize
		case strings.Contains(l2, "语音合成") || strings.Contains(l2, "语音"):
			return PricingKindSpeechSynthesis
		case strings.Contains(l2, "世界模型"):
			return PricingKindWorld
		case strings.Contains(l2, "向量") || strings.Contains(l2, "检索"):
			return PricingKindVector
		case strings.Contains(l2, "视觉语言"):
			return PricingKindMultimodal
		}
	}

	l1 := strings.TrimSpace(categoryL1)
	switch {
	case strings.Contains(l1, "世界"):
		return PricingKindWorld
	case strings.Contains(l1, "向量") || strings.Contains(l1, "检索"):
		return PricingKindVector
	case strings.Contains(l1, "多模态"):
		return PricingKindMultimodal
	case strings.Contains(l1, "图片") || strings.Contains(l1, "图像"):
		// 未细分时默认图片生成；具体识别靠二级
		return PricingKindImageGenerate
	case strings.Contains(l1, "视频"):
		return PricingKindVideoGenerate
	case strings.Contains(l1, "语音"):
		return PricingKindSpeechSynthesis
	case strings.Contains(l1, "文本") || strings.Contains(l1, "对话") || strings.Contains(l1, "代码") || strings.Contains(l1, "专用工具"):
		return PricingKindText
	default:
		return PricingKindText
	}
}

// OfficialTokenPriceUSD 模型广场同源口径：官方输入价 = model_ratio × $2/1M（不含分组倍率）。
func OfficialTokenPriceUSD(modelRatio, completionRatio float64) (inputUSD, outputUSD float64) {
	inputUSD = modelRatio * OfficialPriceBenchmarkUSD
	outputUSD = inputUSD * completionRatio
	return inputUSD, outputUSD
}

func ToSuidianPrice(officialUSD float64) float64 {
	// 分类表燧点价为整数；四舍五入避免 63/7000×7000 浮点尾巴
	return math.Round(officialUSD * SuidianMultiplier)
}

func applyUnitPriceFromModelPrice(p *Pricing) {
	if p.QuotaType == 1 && p.ModelPrice > 0 {
		p.OfficialUnitPriceUSD = floatPtr(p.ModelPrice)
		p.SuidianUnitPrice = floatPtr(ToSuidianPrice(p.ModelPrice))
	}
}

func applyTokenInOutPrices(p *Pricing) {
	if p.QuotaType != 0 {
		return
	}
	inputUSD, outputUSD := OfficialTokenPriceUSD(p.ModelRatio, p.CompletionRatio)
	p.OfficialInputPriceUSD = floatPtr(inputUSD)
	p.OfficialOutputPriceUSD = floatPtr(outputUSD)
	p.SuidianInputPer1M = floatPtr(ToSuidianPrice(inputUSD))
	p.SuidianOutputPer1M = floatPtr(ToSuidianPrice(outputUSD))
}

// ApplyOfficialPricingFields 按类型写入官方价与燧点价（合表字段）。
func ApplyOfficialPricingFields(p *Pricing) {
	if p == nil {
		return
	}
	kind := ResolvePricingKind(p.PricingKind, p.CategoryL1, p.CategoryL2)
	p.PricingKind = kind

	switch kind {
	case PricingKindImageGenerate, PricingKindVideoGenerate:
		// 图片/视频生成：分类表多为「燧点 / 请求」→ ModelPrice
		applyUnitPriceFromModelPrice(p)
	case PricingKindImageRecognize, PricingKindVideoRecognize,
		PricingKindSpeechSynthesis, PricingKindSpeechRecognize:
		// 识别/语音：分类表常为 Token 入出价；有固定价用单价，否则回填 Token 官方/燧点价
		if p.QuotaType == 1 && p.ModelPrice > 0 {
			applyUnitPriceFromModelPrice(p)
		} else {
			applyTokenInOutPrices(p)
		}
	case PricingKindWorld:
		// 世界模型：输入按次、输出按秒；有按次价时填入价；输出按秒暂无独立广场字段时留空
		if p.QuotaType == 1 && p.ModelPrice > 0 {
			p.OfficialInputPerCallUSD = floatPtr(p.ModelPrice)
			p.SuidianInputPerCall = floatPtr(ToSuidianPrice(p.ModelPrice))
		}
	case PricingKindVector:
		// 向量与检索：文本输入按 Token 口径；向量输入价暂无独立倍率时留空
		if p.QuotaType == 0 {
			inputUSD, _ := OfficialTokenPriceUSD(p.ModelRatio, p.CompletionRatio)
			p.OfficialTextInputPriceUSD = floatPtr(inputUSD)
			p.SuidianTextInputPer1M = floatPtr(ToSuidianPrice(inputUSD))
		}
	default: // text / multimodal
		applyTokenInOutPrices(p)
	}
}

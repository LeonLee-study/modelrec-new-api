package model

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/setting/ratio_setting"
)

var (
	rePlazaTokenIO = regexp.MustCompile(
		`(?i)输入\s*燧点\s*([\d,]+(?:\.\d+)?)\s*/\s*1M\s*[·•.\s]*输出\s*燧点\s*([\d,]+(?:\.\d+)?)\s*/\s*1M`,
	)
	rePlazaPerRequest = regexp.MustCompile(`(?i)燧点\s*([\d,]+(?:\.\d+)?)\s*/\s*请求`)
)

// ParsedPlazaPrice 由分类表「模型价格」反解出的广场计费参数。
// Token 口径：官方 USD/1M = 燧点/7000，model_ratio = 官方 USD / $2。
// 按次口径：ModelPrice（USD）= 燧点/7000，列表官方单价同源。
type ParsedPlazaPrice struct {
	UsePrice         bool
	ModelRatio       float64
	CompletionRatio  float64
	ModelPriceUSD    float64
	InputSuidian1M   float64
	OutputSuidian1M  float64
	UnitSuidian      float64
}

// ModelPlazaPriceSyncResult 广场价格同步结果。
type ModelPlazaPriceSyncResult struct {
	Total      int
	TokenCount int
	PriceCount int
	Skipped    int
}

func parseSuidianNumber(raw string) (float64, error) {
	cleaned := strings.ReplaceAll(strings.TrimSpace(raw), ",", "")
	if cleaned == "" {
		return 0, fmt.Errorf("empty number")
	}
	return strconv.ParseFloat(cleaned, 64)
}

// ParsePlazaPriceText 解析分类表价格文案。
func ParsePlazaPriceText(priceText string) (*ParsedPlazaPrice, error) {
	text := strings.TrimSpace(priceText)
	if text == "" {
		return nil, fmt.Errorf("empty price")
	}

	if m := rePlazaTokenIO.FindStringSubmatch(text); len(m) == 3 {
		inSuidian, err := parseSuidianNumber(m[1])
		if err != nil {
			return nil, err
		}
		outSuidian, err := parseSuidianNumber(m[2])
		if err != nil {
			return nil, err
		}
		inputUSD := inSuidian / SuidianMultiplier
		modelRatio := inputUSD / OfficialPriceBenchmarkUSD
		completionRatio := 1.0
		if inSuidian > 0 {
			completionRatio = outSuidian / inSuidian
		}
		return &ParsedPlazaPrice{
			UsePrice:        false,
			ModelRatio:      modelRatio,
			CompletionRatio: completionRatio,
			InputSuidian1M:  inSuidian,
			OutputSuidian1M: outSuidian,
		}, nil
	}

	if m := rePlazaPerRequest.FindStringSubmatch(text); len(m) == 2 {
		unitSuidian, err := parseSuidianNumber(m[1])
		if err != nil {
			return nil, err
		}
		return &ParsedPlazaPrice{
			UsePrice:      true,
			ModelPriceUSD: unitSuidian / SuidianMultiplier,
			UnitSuidian:   unitSuidian,
		}, nil
	}

	return nil, fmt.Errorf("unrecognized price format: %s", text)
}

// SyncModelPlazaPrices 按分类表价格写入 ModelRatio / CompletionRatio / ModelPrice，
// 使 /api/pricing 官方价与分类表燧点价（÷7000）一致。
func SyncModelPlazaPrices(records []ModelCategoryRecord) (*ModelPlazaPriceSyncResult, error) {
	ratios := ratio_setting.GetModelRatioCopy()
	if ratios == nil {
		ratios = make(map[string]float64)
	}
	prices := ratio_setting.GetModelPriceCopy()
	if prices == nil {
		prices = make(map[string]float64)
	}
	completions := ratio_setting.GetCompletionRatioCopy()
	if completions == nil {
		completions = make(map[string]float64)
	}

	result := &ModelPlazaPriceSyncResult{Total: len(records)}
	for _, rec := range records {
		name := strings.TrimSpace(rec.ModelName)
		if name == "" {
			result.Skipped++
			continue
		}
		parsed, err := ParsePlazaPriceText(rec.Price)
		if err != nil {
			result.Skipped++
			continue
		}
		if parsed.UsePrice {
			prices[name] = parsed.ModelPriceUSD
			result.PriceCount++
			continue
		}
		ratios[name] = parsed.ModelRatio
		completions[name] = parsed.CompletionRatio
		delete(prices, name)
		result.TokenCount++
	}

	ratioJSON, err := common.Marshal(ratios)
	if err != nil {
		return nil, err
	}
	priceJSON, err := common.Marshal(prices)
	if err != nil {
		return nil, err
	}
	completionJSON, err := common.Marshal(completions)
	if err != nil {
		return nil, err
	}

	if err := UpdateOptionsBulk(map[string]string{
		"ModelRatio":      string(ratioJSON),
		"ModelPrice":      string(priceJSON),
		"CompletionRatio": string(completionJSON),
	}); err != nil {
		return nil, err
	}

	InvalidatePricingCache()
	return result, nil
}

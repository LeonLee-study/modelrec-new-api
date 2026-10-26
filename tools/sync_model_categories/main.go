// 按 LG-02 模型分类总表，将类别补录到 models 表，并把价格写入广场倍率/单价。
//
//	go run ./tools/sync_model_categories -file data/model_categories.json
package main

import (
	"encoding/csv"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting/ratio_setting"

	"github.com/joho/godotenv"
)

func main() {
	file := flag.String("file", "data/model_categories.json", "classification JSON or CSV from Feishu sheet")
	syncPrices := flag.Bool("prices", true, "also sync ModelRatio/CompletionRatio/ModelPrice from price column")
	flag.Parse()

	_ = godotenv.Load(".env")
	if err := model.InitDB(); err != nil {
		log.Fatalf("init db: %v", err)
	}
	ratio_setting.InitRatioSettings()
	model.InitOptionMap()

	records, err := loadCategoryRecords(*file)
	if err != nil {
		log.Fatalf("load %s: %v", *file, err)
	}

	result, err := model.SyncModelCategories(records)
	if err != nil {
		log.Fatalf("sync categories: %v", err)
	}
	fmt.Printf("categories ok: total=%d inserted=%d updated=%d skipped=%d\n",
		result.Total, result.Inserted, result.Updated, result.Skipped)

	if *syncPrices {
		priceResult, err := model.SyncModelPlazaPrices(records)
		if err != nil {
			log.Fatalf("sync prices: %v", err)
		}
		fmt.Printf("prices ok: total=%d token=%d unit=%d skipped=%d\n",
			priceResult.Total, priceResult.TokenCount, priceResult.PriceCount, priceResult.Skipped)
		model.RefreshPricing()
	}
}

func loadCategoryRecords(path string) ([]model.ModelCategoryRecord, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}
	lower := strings.ToLower(path)
	if strings.HasSuffix(lower, ".csv") {
		return recordsFromCSV(raw)
	}
	var records []model.ModelCategoryRecord
	if err := json.Unmarshal(raw, &records); err != nil {
		return nil, err
	}
	return records, nil
}

func recordsFromCSV(raw []byte) ([]model.ModelCategoryRecord, error) {
	r := csv.NewReader(strings.NewReader(string(raw)))
	r.LazyQuotes = true
	rows, err := r.ReadAll()
	if err != nil {
		return nil, err
	}
	if len(rows) < 2 {
		return nil, fmt.Errorf("csv has no data rows")
	}
	header := rows[0]
	idx := map[string]int{}
	for i, h := range header {
		idx[strings.TrimSpace(h)] = i
	}
	col := func(row []string, name string) string {
		i, ok := idx[name]
		if !ok || i >= len(row) {
			return ""
		}
		return strings.TrimSpace(row[i])
	}
	out := make([]model.ModelCategoryRecord, 0, len(rows)-1)
	for _, row := range rows[1:] {
		name := col(row, "模型名称")
		if name == "" {
			continue
		}
		out = append(out, model.ModelCategoryRecord{
			CategoryL1:  col(row, "一级分类树"),
			CategoryL2:  col(row, "二级分类树"),
			CategoryL3:  col(row, "三级分类树"),
			ModelName:   name,
			VendorName:  col(row, "供应商"),
			Description: col(row, "模型介绍"),
			Available:   col(row, "是否可用"),
			Price:       col(row, "模型价格"),
		})
	}
	return out, nil
}

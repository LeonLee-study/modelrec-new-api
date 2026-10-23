package model

import (
	"errors"
	"strings"

	"github.com/QuantumNous/new-api/common"

	"gorm.io/gorm"
)

// ModelCategoryRecord 来自模型分类总表的一条归类记录（LG-02）。
type ModelCategoryRecord struct {
	CategoryL1  string `json:"category_l1"`
	CategoryL2  string `json:"category_l2"`
	CategoryL3  string `json:"category_l3,omitempty"`
	ModelName   string `json:"model_name"`
	VendorName  string `json:"vendor_name,omitempty"`
	Description string `json:"description,omitempty"`
	Available   string `json:"available,omitempty"`
	// Price 分类表「模型价格」原文（燧点）；同步时反解为广场 ModelRatio/ModelPrice。
	Price string `json:"price,omitempty"`
}

// ModelCategorySyncResult 分类补录结果。
type ModelCategorySyncResult struct {
	Total    int
	Inserted int
	Updated  int
	Skipped  int
}

func modelStatusFromAvailable(available string) int {
	switch strings.TrimSpace(available) {
	case "是", "可用", "1", "true", "TRUE", "yes", "YES":
		return 1
	case "否", "不可用", "0", "false", "FALSE", "no", "NO":
		return 0
	default:
		// 分类表未标注时默认启用，避免补录后列表被整批隐藏
		return 1
	}
}

func ensureVendorIDByName(name string) (int, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return 0, nil
	}
	var v Vendor
	err := DB.Where("name = ?", name).First(&v).Error
	if err == nil {
		return v.Id, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return 0, err
	}
	v = Vendor{Name: name, Status: 1}
	if err := v.Insert(); err != nil {
		return 0, err
	}
	return v.Id, nil
}

func getModelByName(name string) (*Model, error) {
	var m Model
	err := DB.Where("model_name = ?", name).First(&m).Error
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func applyCategoryRecord(m *Model, rec ModelCategoryRecord, vendorID int) {
	m.CategoryL1 = strings.TrimSpace(rec.CategoryL1)
	m.CategoryL2 = strings.TrimSpace(rec.CategoryL2)
	m.PricingKind = ResolvePricingKind("", m.CategoryL1, m.CategoryL2)
	m.Status = modelStatusFromAvailable(rec.Available)
	if vendorID > 0 {
		m.VendorID = vendorID
	}
	if desc := strings.TrimSpace(rec.Description); desc != "" {
		m.Description = desc
	}
}

// SyncModelCategories 按分类表补录 models 的类别与展示元数据（存在则更新，不存在则创建）。
func SyncModelCategories(records []ModelCategoryRecord) (*ModelCategorySyncResult, error) {
	result := &ModelCategorySyncResult{Total: len(records)}
	if DB == nil {
		return result, errors.New("database not initialized")
	}

	for _, rec := range records {
		name := strings.TrimSpace(rec.ModelName)
		if name == "" {
			result.Skipped++
			continue
		}

		vendorID, err := ensureVendorIDByName(rec.VendorName)
		if err != nil {
			return result, err
		}

		existing, err := getModelByName(name)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return result, err
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			m := &Model{
				ModelName:    name,
				SyncOfficial: 1,
				NameRule:     0,
			}
			applyCategoryRecord(m, rec, vendorID)
			if err := m.Insert(); err != nil {
				return result, err
			}
			// Insert/Create 可能回写 default:1，补录字段需再写一次
			applyCategoryRecord(m, rec, vendorID)
			if err := m.Update(); err != nil {
				return result, err
			}
			result.Inserted++
			continue
		}

		applyCategoryRecord(existing, rec, vendorID)
		existing.UpdatedTime = common.GetTimestamp()
		if err := existing.Update(); err != nil {
			return result, err
		}
		result.Updated++
	}

	return result, nil
}

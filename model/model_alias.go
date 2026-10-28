package model

import (
	"fmt"
	"strings"

	"github.com/QuantumNous/new-api/common"
)

const OptionKeyModelAliasMap = "ModelAliasMap"

// ModelAliasMapJSON is tag -> (real model name -> display name).
type ModelAliasMapJSON map[string]map[string]string

func GetModelAliasMap() ModelAliasMapJSON {
	common.OptionMapRWMutex.RLock()
	raw := common.OptionMap[OptionKeyModelAliasMap]
	common.OptionMapRWMutex.RUnlock()
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	var aliasMap ModelAliasMapJSON
	if err := common.UnmarshalJsonStr(raw, &aliasMap); err != nil {
		common.SysError("failed to parse ModelAliasMap: " + err.Error())
		return nil
	}
	return aliasMap
}

func ValidateModelAliasMapJSON(raw string) error {
	if strings.TrimSpace(raw) == "" {
		return nil
	}
	var aliasMap ModelAliasMapJSON
	if err := common.UnmarshalJsonStr(raw, &aliasMap); err != nil {
		return fmt.Errorf("ModelAliasMap 格式无效，需要 JSON 对象")
	}
	return nil
}

// GetUserModelAliasMapping returns real->display for the user's tag.
// Empty tag or missing tag key means no rewrite.
func GetUserModelAliasMapping(userId int) map[string]string {
	if userId <= 0 {
		return nil
	}
	cache, err := GetUserCache(userId)
	if err != nil || cache == nil || strings.TrimSpace(cache.ModelAliasTag) == "" {
		return nil
	}
	aliasMap := GetModelAliasMap()
	if len(aliasMap) == 0 {
		return nil
	}
	mapping := aliasMap[cache.ModelAliasTag]
	if len(mapping) == 0 {
		return nil
	}
	return mapping
}

func ApplyModelAlias(mapping map[string]string, realName string) string {
	if len(mapping) == 0 || realName == "" {
		return realName
	}
	if display, ok := mapping[realName]; ok && display != "" {
		return display
	}
	return realName
}

// ResolveModelNameFilter turns a user-facing model filter into DB real names.
// forceEmpty means the filter should match nothing (aliased real name used as filter).
func ResolveModelNameFilter(mapping map[string]string, filter string) (names []string, forceEmpty bool) {
	if filter == "" {
		return nil, false
	}
	if len(mapping) == 0 || strings.Contains(filter, "%") {
		return []string{filter}, false
	}

	reverse := make(map[string][]string, len(mapping))
	aliasedReals := make(map[string]struct{}, len(mapping))
	for realName, display := range mapping {
		if display == "" {
			continue
		}
		aliasedReals[realName] = struct{}{}
		reverse[display] = append(reverse[display], realName)
	}

	if reals, ok := reverse[filter]; ok {
		return reals, false
	}
	if _, aliased := aliasedReals[filter]; aliased {
		return nil, true
	}
	return []string{filter}, false
}

func RewriteAndMergeQuotaData(rows []*QuotaData, mapping map[string]string) []*QuotaData {
	if len(mapping) == 0 || len(rows) == 0 {
		return rows
	}
	type mergeKey struct {
		UserID    int
		Username  string
		ModelName string
		CreatedAt int64
	}
	merged := make(map[mergeKey]*QuotaData, len(rows))
	order := make([]mergeKey, 0, len(rows))
	for _, row := range rows {
		if row == nil {
			continue
		}
		display := ApplyModelAlias(mapping, row.ModelName)
		key := mergeKey{
			UserID:    row.UserID,
			Username:  row.Username,
			ModelName: display,
			CreatedAt: row.CreatedAt,
		}
		if existing, ok := merged[key]; ok {
			existing.Count += row.Count
			existing.Quota += row.Quota
			existing.TokenUsed += row.TokenUsed
			continue
		}
		copied := *row
		copied.ModelName = display
		merged[key] = &copied
		order = append(order, key)
	}
	out := make([]*QuotaData, 0, len(order))
	for _, key := range order {
		out = append(out, merged[key])
	}
	return out
}

func RewriteAndMergeFlowQuotaData(rows []*FlowQuotaData, mapping map[string]string) []*FlowQuotaData {
	if len(mapping) == 0 || len(rows) == 0 {
		return rows
	}
	type mergeKey struct {
		UserID    int
		Username  string
		NodeName  string
		TokenID   int
		UseGroup  string
		ChannelID int
		ModelName string
	}
	merged := make(map[mergeKey]*FlowQuotaData, len(rows))
	order := make([]mergeKey, 0, len(rows))
	for _, row := range rows {
		if row == nil {
			continue
		}
		display := ApplyModelAlias(mapping, row.ModelName)
		key := mergeKey{
			UserID:    row.UserID,
			Username:  row.Username,
			NodeName:  row.NodeName,
			TokenID:   row.TokenID,
			UseGroup:  row.UseGroup,
			ChannelID: row.ChannelID,
			ModelName: display,
		}
		if existing, ok := merged[key]; ok {
			existing.Count += row.Count
			existing.Quota += row.Quota
			existing.TokenUsed += row.TokenUsed
			continue
		}
		copied := *row
		copied.ModelName = display
		merged[key] = &copied
		order = append(order, key)
	}
	out := make([]*FlowQuotaData, 0, len(order))
	for _, key := range order {
		out = append(out, merged[key])
	}
	return out
}

func RewriteLogModelNames(logs []*Log, mapping map[string]string) {
	if len(mapping) == 0 || len(logs) == 0 {
		return
	}
	for i := range logs {
		if logs[i] == nil {
			continue
		}
		logs[i].ModelName = ApplyModelAlias(mapping, logs[i].ModelName)
	}
}

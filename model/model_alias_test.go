package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestApplyModelAlias(t *testing.T) {
	mapping := map[string]string{
		"gpt-4o": "星河-Pro",
	}
	assert.Equal(t, "星河-Pro", ApplyModelAlias(mapping, "gpt-4o"))
	assert.Equal(t, "claude-3-5-sonnet", ApplyModelAlias(mapping, "claude-3-5-sonnet"))
	assert.Equal(t, "gpt-4o", ApplyModelAlias(nil, "gpt-4o"))
}

func TestResolveModelNameFilter(t *testing.T) {
	mapping := map[string]string{
		"gpt-4o":             "星河-Pro",
		"gpt-4o-mini":        "星河-Pro",
		"claude-3-5-sonnet":  "星河-Max",
	}

	t.Run("display name expands to all reals", func(t *testing.T) {
		names, forceEmpty := ResolveModelNameFilter(mapping, "星河-Pro")
		require.False(t, forceEmpty)
		assert.ElementsMatch(t, []string{"gpt-4o", "gpt-4o-mini"}, names)
	})

	t.Run("aliased real name no longer matches", func(t *testing.T) {
		names, forceEmpty := ResolveModelNameFilter(mapping, "gpt-4o")
		require.True(t, forceEmpty)
		assert.Nil(t, names)
	})

	t.Run("unmapped real name keeps exact filter", func(t *testing.T) {
		names, forceEmpty := ResolveModelNameFilter(mapping, "deepseek-v3")
		require.False(t, forceEmpty)
		assert.Equal(t, []string{"deepseek-v3"}, names)
	})

	t.Run("empty mapping keeps original filter", func(t *testing.T) {
		names, forceEmpty := ResolveModelNameFilter(nil, "gpt-4o")
		require.False(t, forceEmpty)
		assert.Equal(t, []string{"gpt-4o"}, names)
	})
}

func TestRewriteAndMergeQuotaData(t *testing.T) {
	mapping := map[string]string{
		"gpt-4o":      "星河-Pro",
		"gpt-4o-mini": "星河-Pro",
	}
	rows := []*QuotaData{
		{UserID: 1, Username: "u", ModelName: "gpt-4o", CreatedAt: 100, Count: 2, Quota: 10, TokenUsed: 20},
		{UserID: 1, Username: "u", ModelName: "gpt-4o-mini", CreatedAt: 100, Count: 3, Quota: 15, TokenUsed: 30},
		{UserID: 1, Username: "u", ModelName: "deepseek-v3", CreatedAt: 100, Count: 1, Quota: 5, TokenUsed: 8},
	}

	out := RewriteAndMergeQuotaData(rows, mapping)
	require.Len(t, out, 2)

	byName := map[string]*QuotaData{}
	for _, row := range out {
		byName[row.ModelName] = row
	}
	require.Contains(t, byName, "星河-Pro")
	require.Contains(t, byName, "deepseek-v3")
	assert.Equal(t, 5, byName["星河-Pro"].Count)
	assert.Equal(t, 25, byName["星河-Pro"].Quota)
	assert.Equal(t, 50, byName["星河-Pro"].TokenUsed)
	assert.Equal(t, 1, byName["deepseek-v3"].Count)
}

func TestValidateModelAliasMapJSON(t *testing.T) {
	require.NoError(t, ValidateModelAliasMapJSON(`{"customer-a":{"gpt-4o":"星河-Pro"}}`))
	require.NoError(t, ValidateModelAliasMapJSON(""))
	require.NoError(t, ValidateModelAliasMapJSON("{}"))
	require.Error(t, ValidateModelAliasMapJSON(`[]`))
	require.Error(t, ValidateModelAliasMapJSON(`{`))
}

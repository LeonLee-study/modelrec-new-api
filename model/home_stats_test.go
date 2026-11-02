package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestFormatHomeStatCount(t *testing.T) {
	tests := []struct {
		n    int
		want string
	}{
		{n: 0, want: "0"},
		{n: 6, want: "6"},
		{n: 9, want: "9"},
		{n: 10, want: "10"},
		{n: 11, want: "10+"},
		{n: 16, want: "10+"},
		{n: 99, want: "90+"},
		{n: 100, want: "100+"},
		{n: 162, want: "160+"},
		{n: -3, want: "0"},
	}
	for _, tt := range tests {
		assert.Equal(t, tt.want, FormatHomeStatCount(tt.n), "n=%d", tt.n)
	}
}

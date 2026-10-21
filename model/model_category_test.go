package model

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestResolvePricingKindFromClassificationSheet(t *testing.T) {
	tests := []struct {
		name string
		l1   string
		l2   string
		want string
	}{
		{name: "text chat", l1: "1. 文本", l2: "通用对话", want: PricingKindText},
		{name: "code", l1: "1. 文本", l2: "代码智能", want: PricingKindText},
		{name: "image understand", l1: "2. 图片", l2: "图片理解", want: PricingKindImageRecognize},
		{name: "image gen", l1: "2. 图片", l2: "图片生成", want: PricingKindImageGenerate},
		{name: "video", l1: "3. 视频", l2: "视频生成", want: PricingKindVideoGenerate},
		{name: "vlm", l1: "4. 多模态", l2: "视觉语言模型", want: PricingKindMultimodal},
		{name: "tts", l1: "6. 语音", l2: "语音合成", want: PricingKindSpeechSynthesis},
		{name: "translate", l1: "8. 专用工具模型", l2: "翻译模型", want: PricingKindText},
		{name: "extract", l1: "8. 专用工具模型", l2: "结构化抽取", want: PricingKindText},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, ResolvePricingKind("", tt.l1, tt.l2))
		})
	}
}

func TestModelStatusFromAvailable(t *testing.T) {
	assert.Equal(t, 1, modelStatusFromAvailable("是"))
	assert.Equal(t, 0, modelStatusFromAvailable("否"))
	assert.Equal(t, 1, modelStatusFromAvailable(""))
}

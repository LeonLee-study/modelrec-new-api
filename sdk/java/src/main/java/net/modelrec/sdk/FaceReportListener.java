package net.modelrec.sdk;

/**
 * 流式报告的增量回调。每次收到一段新文本时调用。
 */
@FunctionalInterface
public interface FaceReportListener {
    void onDelta(String text);
}

package net.modelrec.sdk;

/**
 * 颜值分析调用失败。异常信息只包含调用失败原因，不包含请求正文。
 */
public class FaceReportException extends RuntimeException {
    private final int statusCode;

    public FaceReportException(String message) {
        this(0, message, null);
    }

    public FaceReportException(String message, Throwable cause) {
        this(0, message, cause);
    }

    public FaceReportException(int statusCode, String message) {
        this(statusCode, message, null);
    }

    private FaceReportException(int statusCode, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    /**
     * HTTP 状态码。请求尚未发出或无法归类时为 0。
     */
    public int getStatusCode() {
        return statusCode;
    }
}

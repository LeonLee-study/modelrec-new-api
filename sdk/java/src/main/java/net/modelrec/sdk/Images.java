package net.modelrec.sdk;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

final class Images {
    private Images() {
    }

    static List<String> toWireUrls(List<String> images, ImageType type) {
        if (images == null || images.isEmpty()) {
            throw new FaceReportException("图片不能为空");
        }
        List<String> wireUrls = new ArrayList<String>(images.size());
        for (String image : images) {
            wireUrls.add(toWireUrl(image, type));
        }
        return wireUrls;
    }

    static String toWireUrl(String image, ImageType type) {
        if (image == null || image.trim().isEmpty()) {
            throw new FaceReportException("图片不能为空");
        }
        String value = image.trim();
        if (type == ImageType.URL) {
            return requireHttpUrl(value);
        }
        if (type == ImageType.BASE64) {
            if (isHttpUrl(value)) {
                throw new FaceReportException("当前按 Base64 传入，不能是图片地址");
            }
            return normalizeBase64(value);
        }
        if (isHttpUrl(value)) {
            return value;
        }
        return normalizeBase64(value);
    }

    private static String requireHttpUrl(String value) {
        if (!isHttpUrl(value)) {
            throw new FaceReportException("图片地址必须以 http:// 或 https:// 开头");
        }
        return value;
    }

    private static boolean isHttpUrl(String value) {
        return startsWithIgnoreCase(value, "https://") || startsWithIgnoreCase(value, "http://");
    }

    private static String normalizeBase64(String value) {
        if (startsWithIgnoreCase(value, "data:image/")) {
            int comma = value.indexOf(',');
            if (comma < 0) {
                throw new FaceReportException("图片 data URL 必须是 Base64 格式");
            }
            String header = value.substring(0, comma).toLowerCase(Locale.ROOT);
            if (!header.contains(";base64")) {
                throw new FaceReportException("图片 data URL 必须是 Base64 格式");
            }
            int mimeEnd = header.indexOf(';');
            String mime = header.substring("data:".length(), mimeEnd);
            String payload = padBase64(value.substring(comma + 1).replaceAll("\\s+", ""));
            return "data:" + mime + ";base64," + payload;
        }
        if (startsWithIgnoreCase(value, "data:")) {
            throw new FaceReportException("图片必须是 http(s) 地址，或图片 Base64");
        }
        String payload = padBase64(value.replaceAll("\\s+", ""));
        return "data:" + mimeOf(payload) + ";base64," + payload;
    }

    private static String padBase64(String value) {
        String normalized = value.replace('-', '+').replace('_', '/');
        if (normalized.isEmpty() || !normalized.matches("^[A-Za-z0-9+/]+={0,2}$")) {
            throw new FaceReportException("图片必须是 http(s) 地址，或图片 Base64");
        }
        int mod = normalized.length() % 4;
        if (mod == 1) {
            throw new FaceReportException("图片 Base64 长度不合法");
        }
        if (mod == 0) {
            return normalized;
        }
        return normalized + "===".substring(0, 4 - mod);
    }

    private static String mimeOf(String payload) {
        if (payload.startsWith("/9j/")) {
            return "image/jpeg";
        }
        if (payload.startsWith("iVBORw0KGgo")) {
            return "image/png";
        }
        if (payload.startsWith("R0lGOD")) {
            return "image/gif";
        }
        if (payload.startsWith("UklGR")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    private static boolean startsWithIgnoreCase(String value, String prefix) {
        return value.regionMatches(true, 0, prefix, 0, prefix.length());
    }
}

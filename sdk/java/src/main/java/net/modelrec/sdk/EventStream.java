package net.modelrec.sdk;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

final class EventStream {
    private static final int ERROR_BODY_LIMIT = 65536;
    private static final int ERROR_MESSAGE_LIMIT = 200;

    private EventStream() {
    }

    static String readLimited(InputStream input) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int read;
        while (out.size() < ERROR_BODY_LIMIT && (read = input.read(buffer, 0, Math.min(buffer.length, ERROR_BODY_LIMIT - out.size()))) != -1) {
            out.write(buffer, 0, read);
        }
        return new String(out.toByteArray(), StandardCharsets.UTF_8);
    }

    static String errorMessage(int status, String body) {
        String fallback = "请求失败，HTTP " + status;
        if (body == null || body.isEmpty()) {
            return fallback;
        }
        try {
            Map<String, Object> root = JsonValues.asMap(JsonValues.parse(body));
            if (root == null) {
                return fallback;
            }
            String message = messageOf(root.get("error"));
            if (message == null) {
                message = shortText(JsonValues.asText(root.get("message")));
            }
            return message == null ? fallback : message;
        } catch (RuntimeException ex) {
            return fallback;
        }
    }

    static String readSuccess(InputStream input, String contentType, FaceReportListener listener) throws IOException {
        if (contentType != null && contentType.toLowerCase().contains("text/event-stream")) {
            return readEvents(input, listener);
        }
        String body = readAll(input);
        String text = textOf(body);
        emit(listener, text);
        return text;
    }

    private static String readEvents(InputStream input, FaceReportListener listener) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(input, StandardCharsets.UTF_8));
        StringBuilder report = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            if (!line.startsWith("data:")) {
                continue;
            }
            String payload = line.substring(5);
            if (payload.startsWith(" ")) {
                payload = payload.substring(1);
            }
            payload = payload.trim();
            if (payload.isEmpty()) {
                continue;
            }
            if ("[DONE]".equals(payload)) {
                return report.toString();
            }
            String delta = textOf(payload);
            if (delta.isEmpty()) {
                continue;
            }
            report.append(delta);
            emit(listener, delta);
        }
        return report.toString();
    }

    private static String readAll(InputStream input) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int read;
        while ((read = input.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
        return new String(out.toByteArray(), StandardCharsets.UTF_8);
    }

    static String textOf(String payload) {
        Map<String, Object> root;
        try {
            root = JsonValues.asMap(JsonValues.parse(payload));
        } catch (RuntimeException ex) {
            throw new FaceReportException("流式响应无法解析");
        }
        if (root == null) {
            throw new FaceReportException("流式响应无法解析");
        }
        if (root.get("error") != null) {
            String errorMessage = messageOf(root.get("error"));
            throw new FaceReportException(errorMessage == null ? "请求失败" : errorMessage);
        }
        List<Object> choices = JsonValues.asList(root.get("choices"));
        if (choices == null) {
            return "";
        }
        StringBuilder text = new StringBuilder();
        for (Object choiceValue : choices) {
            Map<String, Object> choice = JsonValues.asMap(choiceValue);
            if (choice == null) {
                continue;
            }
            String content = contentOf(JsonValues.asMap(choice.get("delta")));
            if (content == null) {
                content = contentOf(JsonValues.asMap(choice.get("message")));
            }
            if (content != null) {
                text.append(content);
            }
        }
        return text.toString();
    }

    private static String contentOf(Map<String, Object> container) {
        if (container == null) {
            return null;
        }
        return JsonValues.asText(container.get("content"));
    }

    private static String messageOf(Object error) {
        if (error instanceof String) {
            return shortText((String) error);
        }
        Map<String, Object> errorObject = JsonValues.asMap(error);
        if (errorObject == null) {
            return null;
        }
        return shortText(JsonValues.asText(errorObject.get("message")));
    }

    private static String shortText(String message) {
        if (message == null || message.isEmpty() || message.length() > ERROR_MESSAGE_LIMIT) {
            return null;
        }
        return message;
    }

    private static void emit(FaceReportListener listener, String text) {
        if (listener != null && text != null && !text.isEmpty()) {
            listener.onDelta(text);
        }
    }
}

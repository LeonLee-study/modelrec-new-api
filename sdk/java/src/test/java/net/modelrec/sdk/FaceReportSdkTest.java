package net.modelrec.sdk;

import com.sun.net.httpserver.HttpServer;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.UncheckedIOException;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

public class FaceReportSdkTest {
    public static void main(String[] args) throws Exception {
        quoteRoundTrip();
        imageUrls();
        requestKeepsPromptInternal();
        streamAndErrors();
        System.out.println("ok");
    }

    private static void quoteRoundTrip() {
        String raw = "甲\n\"\\/\b";
        Object parsed = JsonValues.parse("[" + JsonValues.quote(raw) + "]");
        List<Object> values = JsonValues.asList(parsed);
        check(values != null && raw.equals(values.get(0)), "json roundtrip");
    }

    private static void imageUrls() {
        check("https://example.com/a.jpg?x=1".equals(Images.toWireUrl(" https://example.com/a.jpg?x=1 ", ImageType.URL)), "url");
        check("data:image/jpeg;base64,/9j/abc=".equals(Images.toWireUrl("/9j/abc", null)), "jpeg");
        check("data:image/png;base64,iVBORw0KGgo=".equals(Images.toWireUrl("iVBORw0KGgo", ImageType.BASE64)), "png");
        check("data:image/png;base64,iVBORw0KGgo=".equals(Images.toWireUrl("data:Image/PNG;base64,iVBORw0KGgo", null)), "data uri");
        check("data:image/gif;base64,R0lGODlh".equals(Images.toWireUrl("R0lG ODlh", null)), "whitespace");
        expectFail(() -> Images.toWireUrl("not a picture", ImageType.URL));
        expectFail(() -> Images.toWireUrl("https://example.com/a.jpg", ImageType.BASE64));
        expectFail(() -> Images.toWireUrl(" ", null));
        expectFail(() -> Images.toWireUrls(new ArrayList<String>(), null));
    }

    private static void requestKeepsPromptInternal() {
        String image = "https://cdn.example.com/photo.jpg";
        String json = WireTemplate.requestJson(Images.toWireUrls(Arrays.asList(image, "iVBORw0KGgo"), null));
        check(!json.contains("sk-secret"), "key absent");
        Map<String, Object> root = JsonValues.asMap(JsonValues.parse(json));
        check("qwen-vl-max".equals(root.get("model")), "model");
        check(Boolean.TRUE.equals(root.get("stream")), "stream");
        List<Object> messages = JsonValues.asList(root.get("messages"));
        check(messages.size() == 4, "messages");
        check(PromptDigest.SYSTEM.equals(sha256(contentText(messages.get(0)))), "system digest");
        check(PromptDigest.EXAMPLE_USER.equals(sha256(contentText(messages.get(1)))), "user digest");
        check(PromptDigest.EXAMPLE_ASSISTANT.equals(sha256(contentText(messages.get(2)))), "assistant digest");
        Map<String, Object> last = JsonValues.asMap(messages.get(3));
        List<Object> parts = JsonValues.asList(last.get("content"));
        check(parts.size() == 3, "parts");
        check(image.equals(imageUrl(parts.get(0))), "first image");
        check("data:image/png;base64,iVBORw0KGgo=".equals(imageUrl(parts.get(1))), "second image");
        Map<String, Object> textPart = JsonValues.asMap(parts.get(2));
        check("text".equals(textPart.get("type")), "text part");
        check(PromptDigest.TRIGGER.equals(sha256(JsonValues.asText(textPart.get("text")))), "trigger digest");
    }

    private static void streamAndErrors() throws Exception {
        AtomicReference<String> authorization = new AtomicReference<String>();
        AtomicReference<String> requestBody = new AtomicReference<String>();
        AtomicReference<byte[]> responseBody = new AtomicReference<byte[]>();
        AtomicReference<Integer> status = new AtomicReference<Integer>(200);
        AtomicReference<String> contentType = new AtomicReference<String>("text/event-stream");
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/chat/completions", exchange -> {
            authorization.set(exchange.getRequestHeaders().getFirst("Authorization"));
            requestBody.set(readBytes(exchange.getRequestBody()));
            byte[] body = responseBody.get();
            exchange.getResponseHeaders().add("Content-Type", contentType.get());
            exchange.sendResponseHeaders(status.get(), body.length);
            try (OutputStream out = exchange.getResponseBody()) {
                out.write(body);
            }
        });
        server.start();
        try {
            int port = server.getAddress().getPort();
            FaceReportClient client = new FaceReportClient("http://127.0.0.1:" + port + "/v1/chat/completions");
            responseBody.set(sse("data: {\"choices\":[{\"delta\":{\"content\":\"甲\"}}]}\n\n"
                    + "data: {\"choices\":[{\"delta\":{\"content\":\"乙\"}}]}\n\n"
                    + "data: [DONE]\n\n"));
            List<String> deltas = new ArrayList<String>();
            String report = client.analyze("Bearer sk-test", "https://example.com/a.jpg", ImageType.URL, deltas::add);
            check("甲乙".equals(report), "report");
            check(Arrays.asList("甲", "乙").equals(deltas), "deltas");
            check("Bearer sk-test".equals(authorization.get()), "authorization");
            check(requestBody.get().contains("https://example.com/a.jpg"), "sent image");
            check(!requestBody.get().contains("sk-test"), "key not in body");

            responseBody.set("{\"choices\":[{\"message\":{\"content\":\"完整报告\"}}]}".getBytes(StandardCharsets.UTF_8));
            contentType.set("application/json");
            check("完整报告".equals(client.analyze("sk-test", "/9j/abc")), "json report");

            status.set(500);
            responseBody.set(requestBody.get().getBytes(StandardCharsets.UTF_8));
            contentType.set("text/plain");
            expectMessage("请求失败，HTTP 500", () -> client.analyze("sk-test", "https://example.com/a.jpg"));

            status.set(401);
            responseBody.set("{\"error\":{\"message\":\"令牌无效\"}}".getBytes(StandardCharsets.UTF_8));
            contentType.set("application/json");
            FaceReportException unauthorized = expectFail(() -> client.analyze("sk-test", "https://example.com/a.jpg"));
            check(unauthorized.getStatusCode() == 401, "status");
            check("令牌无效".equals(unauthorized.getMessage()), "error message");

            status.set(200);
            contentType.set("text/event-stream");
            responseBody.set(sse("data: {\"error\":{\"message\":\"模型不可用\"}}\n\n"));
            expectMessage("模型不可用", () -> client.analyze("sk-test", "https://example.com/a.jpg"));

            expectMessage("apiKey 不能为空", () -> client.analyze(" ", "https://example.com/a.jpg"));
        } finally {
            server.stop(0);
        }
    }

    private static byte[] sse(String text) {
        return text.getBytes(StandardCharsets.UTF_8);
    }

    private static String readBytes(InputStream input) {
        try {
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            byte[] buffer = new byte[4096];
            int read;
            while ((read = input.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
            return new String(out.toByteArray(), StandardCharsets.UTF_8);
        } catch (IOException ex) {
            throw new UncheckedIOException(ex);
        }
    }

    private static String contentText(Object message) {
        return JsonValues.asText(JsonValues.asMap(message).get("content"));
    }

    private static String imageUrl(Object part) {
        Map<String, Object> partMap = JsonValues.asMap(part);
        return JsonValues.asText(JsonValues.asMap(partMap.get("image_url")).get("url"));
    }

    private static String sha256(String value) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder(hash.length * 2);
            for (byte b : hash) {
                out.append(String.format("%02x", b & 0xff));
            }
            return out.toString();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    private static FaceReportException expectFail(ThrowingRunnable action) {
        try {
            action.run();
        } catch (FaceReportException ex) {
            return ex;
        } catch (Exception ex) {
            throw new AssertionError(ex);
        }
        throw new AssertionError("expected failure");
    }

    private static void expectMessage(String message, ThrowingRunnable action) {
        FaceReportException ex = expectFail(action);
        check(message.equals(ex.getMessage()), "message " + ex.getMessage());
    }

    private static void check(boolean condition, String label) {
        if (!condition) {
            throw new AssertionError(label);
        }
    }

    private interface ThrowingRunnable {
        void run() throws Exception;
    }
}

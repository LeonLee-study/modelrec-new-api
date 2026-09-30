package net.modelrec.sdk;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * 面部颜值分析客户端。调用方传入访问令牌和图片，返回 Markdown 报告。
 */
public final class FaceReportClient {
    private static final String ENDPOINT = "https://modelrec.net/v1/chat/completions";
    private static final Duration REQUEST_TIMEOUT = Duration.ofMinutes(5);

    private final URI endpoint;
    private final HttpClient httpClient;

    public FaceReportClient() {
        this(ENDPOINT);
    }

    FaceReportClient(String endpoint) {
        if (endpoint == null || endpoint.trim().isEmpty()) {
            throw new FaceReportException("接口地址不能为空");
        }
        try {
            this.endpoint = URI.create(endpoint.trim());
        } catch (IllegalArgumentException ex) {
            throw new FaceReportException("接口地址不合法");
        }
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(20))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    public String analyze(String apiKey, String image) {
        return analyze(apiKey, Collections.singletonList(image), null, null);
    }

    public String analyze(String apiKey, String image, ImageType imageType) {
        return analyze(apiKey, Collections.singletonList(image), imageType, null);
    }

    public String analyze(String apiKey, String image, ImageType imageType, FaceReportListener listener) {
        return analyze(apiKey, Collections.singletonList(image), imageType, listener);
    }

    public String analyze(String apiKey, List<String> images) {
        return analyze(apiKey, images, null, null);
    }

    public String analyze(String apiKey, List<String> images, ImageType imageType) {
        return analyze(apiKey, images, imageType, null);
    }

    public String analyze(String apiKey, List<String> images, ImageType imageType, FaceReportListener listener) {
        String authorization = authorizationHeader(apiKey);
        List<String> wireUrls = Images.toWireUrls(images == null ? null : new ArrayList<String>(images), imageType);
        String body = WireTemplate.requestJson(wireUrls);
        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(REQUEST_TIMEOUT)
                .header("Authorization", authorization)
                .header("Content-Type", "application/json")
                .header("Accept", "text/event-stream")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();
        try {
            HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
            try (InputStream input = response.body()) {
                int status = response.statusCode();
                if (status / 100 != 2) {
                    String errorBody = EventStream.readLimited(input);
                    throw new FaceReportException(status, EventStream.errorMessage(status, errorBody));
                }
                String contentType = response.headers().firstValue("content-type").orElse("");
                return EventStream.readSuccess(input, contentType, listener);
            }
        } catch (FaceReportException ex) {
            throw ex;
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new FaceReportException("请求被中断", ex);
        } catch (IOException ex) {
            throw new FaceReportException("请求失败", ex);
        }
    }

    private static String authorizationHeader(String apiKey) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new FaceReportException("apiKey 不能为空");
        }
        String key = apiKey.trim();
        if (key.regionMatches(true, 0, "Bearer ", 0, 7)) {
            key = key.substring(7).trim();
        }
        if (key.isEmpty()) {
            throw new FaceReportException("apiKey 不能为空");
        }
        return "Bearer " + key;
    }
}

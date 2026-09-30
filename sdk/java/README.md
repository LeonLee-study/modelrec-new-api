# face-report-sdk

面部颜值分析 Java 客户端。调用方式见 [调用说明](调用说明.md)。

方法返回完整报告，也可以在生成过程中接收文本片段。

要求 Java 11 及以上。无第三方依赖。

```java
FaceReportClient client = new FaceReportClient();

// 图片地址
String report = client.analyze("sk-你的令牌", "https://example.com/photo.jpg", ImageType.URL);

// 图片 Base64，可以带 data:image/jpeg;base64, 前缀
String reportFromBase64 = client.analyze("sk-你的令牌", base64, ImageType.BASE64);

// 边生成边接收增量文本
client.analyze("sk-你的令牌", "https://example.com/photo.jpg", ImageType.URL, System.out::print);
```

多张图片按传入顺序对应图1、图2。不传 `ImageType` 时，以 `http://` 或 `https://` 开头的字符串按地址处理，其余按 Base64 处理。

打包后的 jar 会混淆内部实现，公开类名和方法保持不变：

```bash
mvn -q -f sdk/java/pom.xml package
```

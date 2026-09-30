package net.modelrec.sdk;

/**
 * 图片参数的传入方式。
 */
public enum ImageType {
    /** http 或 https 图片地址。 */
    URL,
    /** 图片 Base64，可以带 data:image/...;base64, 前缀。 */
    BASE64
}

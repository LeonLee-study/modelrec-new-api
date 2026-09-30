-target 11
-dontusemixedcaseclassnames
-keeppackagenames net.modelrec.sdk
-keepattributes Exceptions,Signature,InnerClasses,EnclosingMethod
-optimizationpasses 2

-keep public class net.modelrec.sdk.FaceReportClient {
    public <init>();
    public java.lang.String analyze(java.lang.String, java.lang.String);
    public java.lang.String analyze(java.lang.String, java.lang.String, net.modelrec.sdk.ImageType);
    public java.lang.String analyze(java.lang.String, java.lang.String, net.modelrec.sdk.ImageType, net.modelrec.sdk.FaceReportListener);
    public java.lang.String analyze(java.lang.String, java.util.List);
    public java.lang.String analyze(java.lang.String, java.util.List, net.modelrec.sdk.ImageType);
    public java.lang.String analyze(java.lang.String, java.util.List, net.modelrec.sdk.ImageType, net.modelrec.sdk.FaceReportListener);
}

-keepclassmembers class net.modelrec.sdk.FaceReportClient {
    FaceReportClient(java.lang.String);
}

-keep public enum net.modelrec.sdk.ImageType {
    public static **[] values();
    public static ** valueOf(java.lang.String);
    public static ** URL;
    public static ** BASE64;
}

-keep public interface net.modelrec.sdk.FaceReportListener {
    public void onDelta(java.lang.String);
}

-keep public class net.modelrec.sdk.FaceReportException {
    public <init>(java.lang.String);
    public <init>(java.lang.String, java.lang.Throwable);
    public <init>(int, java.lang.String);
    public int getStatusCode();
}

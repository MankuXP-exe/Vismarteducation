# Vi Smart ProGuard / R8 Rules

# Keep Capacitor
-keep class com.getcapacitor.** { *; }
-keep class com.google.firebase.** { *; }

# Keep our app classes
-keep class com.vismart.app.** { *; }
-keep class com.vismart.app.services.** { *; }

# Keep WebView JS interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep Gson/Serialization
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes EnclosingMethod

# Keep Firebase
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Keep OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# Keep HLS.js bridge
-keep class com.vismart.app.ViSmartChromeClient { *; }

# Remove logging in release
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int d(...);
    public static int i(...);
}

# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /Users/awood/Library/Android/sdk/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

##### ALL
# Keep onEvent methods so GreenRobot EventBus can find them
-keepclassmembers class * { public void onEvent*(...); }

-keep enum org.greenrobot.eventbus.ThreadMode { *; }

##### MISNAP API
-keep class com.miteksystems.misnap.params.*
-keepclassmembers class com.miteksystems.misnap.params.* { *; }
-keep class com.miteksystems.misnap.analyzer.*
-keepclassmembers class com.miteksystems.misnap.analyzer.* { *; }
-keep class com.miteksystems.misnap.analyzer.MiSnapAnalyzer$MiSnapAnalyzerExtraInfo { *; }

##### MISNAP MIBI DATA
-keep public class com.miteksystems.misnap.mibidata.** { *; }
-keep public class com.miteksystems.misnap.mibidata.*$* { *; }
-keepclassmembers class com.miteksystems.misnap.mibidata.* { *; }
-keepattributes Exceptions
-keep class com.miteksystems.misnap.analyzer.IAnalyzeResponse$* { *; }
-keep class com.miteksystems.misnap.events.*
-keepclassmembers class com.miteksystems.misnap.events.* { *; }

##### MISNAP CAMERA
-keep class * extends android.support.v4.app.Fragment
-keepclassmembers class * extends android.support.v4.app.Fragment { *; }

-keep class * extends android.app.Activity
-keepclassmembers class * extends android.app.Activity { *; }

##### MISNAP SCIENCE
-keep class com.miteksystems.facialcapture.science.events.*
-keepclassmembers class com.miteksystems.facialcapture.science.events.* { *; }
-keep class com.miteksystems.facialcapture.science.analyzer.**
-keepclassmembers class com.miteksystems.facialcapture.science.analyzer.** { *; }
-keep class com.miteksystems.facialcapture.science.api.**
-keepclassmembers class com.miteksystems.facialcapture.science.api.** { *; }
-keep class com.miteksystems.facialcapture.science.FacialCaptureFragment
-keepclassmembers class com.miteksystems.facialcapture.science.FacialCaptureFragment { *; }

##### FACIAL CAPTURE WORKFLOW
-keep class com.miteksystems.facialcapture.workflow.**
-keepclassmembers class com.miteksystems.facialcapture.workflow.** { *; }

##### FACIAL CAPTURE OVERLAY
-keep class com.miteksystems.facialcapture.overlay.*
-keepclassmembers class com.miteksystems.facialcapture.overlay.* { *; }

##### FACIAL CAPTURE CORE
-keep class com.miteksystems.facialcapture.science.api.**
-keepclassmembers class com.miteksystems.facialcapture.science.api.** { *; }

-keep class com.miteksystems.facialcapture.controller.FacialCaptureFragment
-keepclassmembers class com.miteksystems.facialcapture.controller.FacialCaptureFragment { *; }

-keep class com.daon.**
-keepclassmembers class com.daon.** { *; }
-keep class com.cognitec.**
-keepclassmembers class com.cognitec.** { *; }
-keep class com.sensory.**
-keepclassmembers class com.sensory.** { *; }
-keep class visidon.**
-keepclassmembers class visidon.** { *; }

# Don't mess with classes with native methods
-keepclasseswithmembers class * {
    native <methods>;
}
-keepclasseswithmembernames class * {
    native <methods>;
}

-dontwarn com.daon.**
-dontwarn com.cognitec.**
-dontwarn com.sensory.**
-dontwarn visidon.**
-dontwarn org.tensorflow.lite.**


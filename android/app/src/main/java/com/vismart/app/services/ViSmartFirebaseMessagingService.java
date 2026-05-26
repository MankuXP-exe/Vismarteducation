package com.vismart.app.services;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import com.vismart.app.MainActivity;
import com.vismart.app.R;

import java.util.Map;

public class ViSmartFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "ViSmartFCM";

    public static final String CHANNEL_LIVE = "vismart_live_classes";
    public static final String CHANNEL_RECORDINGS = "vismart_recordings";
    public static final String CHANNEL_EXAMS = "vismart_exams";
    public static final String CHANNEL_FEE = "vismart_fee_reminders";
    public static final String CHANNEL_GENERAL = "vismart_general";

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannels();
    }

    @Override
    public void onNewToken(@NonNull String token) {
        Log.d(TAG, "New FCM token: " + token);
    }

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        String title = remoteMessage.getNotification() != null
                ? remoteMessage.getNotification().getTitle() : "Vi Smart";
        String body = remoteMessage.getNotification() != null
                ? remoteMessage.getNotification().getBody() : "";

        Map<String, String> data = remoteMessage.getData();
        String type = data.getOrDefault("type", "general");
        String channelId = getChannelForType(type);
        String deepLink = data.get("deepLink");
        String classId = data.get("classId");
        String lectureId = data.get("lectureId");

        Intent intent = new Intent(this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        if (deepLink != null) {
            intent.setData(android.net.Uri.parse(deepLink));
        } else if (classId != null) {
            intent.putExtra("classId", classId);
        } else if (lectureId != null) {
            intent.putExtra("lectureId", lectureId);
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        int icon;
        switch (type) {
            case "live":
                icon = android.R.drawable.ic_media_play;
                break;
            case "recording":
                icon = android.R.drawable.ic_media_play;
                break;
            case "exam":
                icon = android.R.drawable.ic_menu_edit;
                break;
            case "fee":
                icon = android.R.drawable.ic_menu_sort_by_size;
                break;
            default:
                icon = android.R.drawable.ic_dialog_info;
        }

        Notification notification = new NotificationCompat.Builder(this, channelId)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(icon)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setCategory(NotificationCompat.CATEGORY_EVENT)
                .build();

        NotificationManagerCompat.from(this).notify(
                (int) System.currentTimeMillis(),
                notification
        );
    }

    private String getChannelForType(String type) {
        switch (type) {
            case "live": return CHANNEL_LIVE;
            case "recording": return CHANNEL_RECORDINGS;
            case "exam": return CHANNEL_EXAMS;
            case "fee": return CHANNEL_FEE;
            default: return CHANNEL_GENERAL;
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);

            manager.createNotificationChannel(new NotificationChannel(
                    CHANNEL_LIVE, "Live Classes",
                    NotificationManager.IMPORTANCE_HIGH
            ) {{
                setDescription("Notifications for live class sessions");
                setShowBadge(true);
                enableLights(true);
                enableVibration(true);
            }});

            manager.createNotificationChannel(new NotificationChannel(
                    CHANNEL_RECORDINGS, "New Recordings",
                    NotificationManager.IMPORTANCE_DEFAULT
            ) {{
                setDescription("When new lecture recordings are available");
                setShowBadge(true);
            }});

            manager.createNotificationChannel(new NotificationChannel(
                    CHANNEL_EXAMS, "Tests & Exams",
                    NotificationManager.IMPORTANCE_HIGH
            ) {{
                setDescription("Test schedules, assignments and exam updates");
                setShowBadge(true);
                enableVibration(true);
            }});

            manager.createNotificationChannel(new NotificationChannel(
                    CHANNEL_FEE, "Fee Reminders",
                    NotificationManager.IMPORTANCE_DEFAULT
            ) {{
                setDescription("Fee payment reminders and receipts");
                setShowBadge(true);
            }});

            manager.createNotificationChannel(new NotificationChannel(
                    CHANNEL_GENERAL, "General",
                    NotificationManager.IMPORTANCE_DEFAULT
            ) {{
                setDescription("Other notifications");
                setShowBadge(true);
            }});
        }
    }
}

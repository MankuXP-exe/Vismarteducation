package com.vismart.app.services;

import android.app.DownloadManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.os.IBinder;
import android.provider.MediaStore;
import android.webkit.MimeTypeMap;
import android.app.PendingIntent;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.vismart.app.R;

import java.io.File;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class DownloadService extends Service {

    public static final String CHANNEL_ID = "vismart_downloads";
    public static final String ACTION_START_DOWNLOAD = "com.vismart.app.START_DOWNLOAD";
    public static final String ACTION_CANCEL_DOWNLOAD = "com.vismart.app.CANCEL_DOWNLOAD";
    public static final String EXTRA_URL = "download_url";
    public static final String EXTRA_TITLE = "download_title";
    public static final String EXTRA_FILENAME = "download_filename";

    private DownloadManager downloadManager;
    private NotificationManager notificationManager;
    private ScheduledExecutorService scheduler;

    @Override
    public void onCreate() {
        super.onCreate();
        downloadManager = (DownloadManager) getSystemService(DOWNLOAD_SERVICE);
        notificationManager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        createNotificationChannel();

        scheduler = Executors.newSingleThreadScheduledExecutor();

        registerReceiver(downloadCompleteReceiver, new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_START_DOWNLOAD.equals(intent.getAction())) {
            String url = intent.getStringExtra(EXTRA_URL);
            String title = intent.getStringExtra(EXTRA_TITLE);
            String filename = intent.getStringExtra(EXTRA_FILENAME);
            if (url != null) startDownload(url, title, filename);
        }
        return START_STICKY;
    }

    private void startDownload(String url, String title, String filename) {
        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Downloading...")
                .setContentText(title != null ? title : "Lecture download")
                .setSmallIcon(android.R.drawable.stat_sys_download)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setOngoing(true)
                .build();

        startForeground(1, notification);

        Uri uri = Uri.parse(url);
        String fileName = filename != null ? filename : uri.getLastPathSegment();
        if (fileName == null) fileName = "lecture_" + System.currentTimeMillis() + ".mp4";

        String extension = fileName.contains(".") ? fileName.substring(fileName.lastIndexOf(".")) : ".mp4";
        String mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.replace(".", ""));
        if (mimeType == null) mimeType = "video/mp4";

        DownloadManager.Request request = new DownloadManager.Request(uri);
        request.setTitle(title != null ? title : "Lecture");
        request.setDescription("Downloading lecture video");
        request.setMimeType(mimeType);
        request.setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
        request.setDestinationInExternalPublicDir(Environment.DIRECTORY_MOVIES, "ViSmart/" + fileName);
        request.setAllowedOverMetered(true);
        request.setAllowedOverRoaming(false);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues values = new ContentValues();
            values.put(MediaStore.Video.Media.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/ViSmart");
            values.put(MediaStore.Video.Media.TITLE, title != null ? title : "Lecture");
            values.put(MediaStore.Video.Media.DISPLAY_NAME, fileName);
            values.put(MediaStore.Video.Media.MIME_TYPE, mimeType);
            values.put(MediaStore.Video.Media.IS_PENDING, 1);
            Uri collection = MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
            Uri itemUri = getContentResolver().insert(collection, values);
            if (itemUri != null) {
                request.setDestinationUri(itemUri);
            }
        }

        downloadManager.enqueue(request);
    }

    private final BroadcastReceiver downloadCompleteReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
            if (id == -1) return;

            DownloadManager.Query query = new DownloadManager.Query();
            query.setFilterById(id);
            Cursor cursor = downloadManager.query(query);

            if (cursor != null && cursor.moveToFirst()) {
                int status = cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS));
                if (status == DownloadManager.STATUS_SUCCESSFUL) {
                    Uri fileUri = downloadManager.getUriForDownloadedFile(id);
                    if (fileUri != null) {
                        MediaScannerConnection.scanFile(context,
                            new String[]{fileUri.getPath()}, null, null);
                    }

                    Notification notification = new NotificationCompat.Builder(context, CHANNEL_ID)
                            .setContentTitle("Download Complete")
                            .setContentText("Lecture saved to Movies/ViSmart/")
                            .setSmallIcon(android.R.drawable.stat_sys_download_done)
                            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                            .setAutoCancel(true)
                            .build();

                    NotificationManagerCompat.from(context).notify((int) id, notification);
                }
            }
            if (cursor != null) cursor.close();

            stopForeground(STOP_FOREGROUND_DETACH);
            stopSelf();
        }
    };

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Lecture Downloads",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Download progress for lecture videos");
            channel.setShowBadge(false);
            notificationManager.createNotificationChannel(channel);
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        try {
            unregisterReceiver(downloadCompleteReceiver);
        } catch (Exception ignored) {}
        if (scheduler != null) scheduler.shutdown();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

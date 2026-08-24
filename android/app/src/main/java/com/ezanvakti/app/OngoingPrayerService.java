package com.ezanvakti.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Kalıcı durum çubuğu bildirimi: sonraki namaz vaktini gösterir.
 */
public class OngoingPrayerService extends Service {
    public static final String CHANNEL_ID = "ezan_ongoing";
    public static final int NOTIF_ID = 77001;
    private static final String PREFS = "CapacitorStorage";
    private static final String KEY = "widget_prayer_times";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createChannel();
        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIF_ID, notification);
        }
        return START_STICKY;
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Sonraki namaz (kalıcı)",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Sonraki ezan vaktini durum çubuğunda gösterir");
        channel.setShowBadge(false);
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) nm.createNotificationChannel(channel);
    }

    private Notification buildNotification() {
        String title = "Ezan Vakti Ultra";
        String body = "Sonraki vakit senkronize ediliyor…";
        try {
            SharedPreferences prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = prefs.getString(KEY, null);
            if (raw != null) {
                JSONObject json = new JSONObject(raw);
                String location = json.optString("location", "");
                JSONArray times = json.optJSONArray("times");
                if (times != null && times.length() > 0) {
                    JSONObject first = times.getJSONObject(0);
                    title = first.optString("label", "Namaz") + "  " + first.optString("time", "");
                    StringBuilder sb = new StringBuilder();
                    if (!location.isEmpty()) sb.append(location);
                    for (int i = 1; i < Math.min(times.length(), 3); i++) {
                        JSONObject t = times.getJSONObject(i);
                        if (sb.length() > 0) sb.append(" · ");
                        sb.append(t.optString("label", ""))
                            .append(" ")
                            .append(t.optString("time", ""));
                    }
                    body = sb.toString();
                }
            }
        } catch (Exception ignored) {
        }

        Intent launch = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(
            this,
            0,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pi)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .build();
    }

    public static void refreshNotification(Context context) {
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        OngoingPrayerService svc = new OngoingPrayerService();
        // Rebuild via started service
        Intent i = new Intent(context, OngoingPrayerService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(i);
        } else {
            context.startService(i);
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

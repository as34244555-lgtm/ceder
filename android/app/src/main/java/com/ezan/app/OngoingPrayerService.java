package com.ezan.app;

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
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Kalıcı durum bildirimi: sonraki ezana kalan süreyi saniye saniye günceller.
 */
public class OngoingPrayerService extends Service {
    public static final String CHANNEL_ID = "ezan_ongoing";
    public static final int NOTIF_ID = 77001;
    private static final String PREFS = "CapacitorStorage";
    private static final String KEY = "widget_prayer_times";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable tick = new Runnable() {
        @Override
        public void run() {
            NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
            if (nm != null) {
                nm.notify(NOTIF_ID, buildNotification());
            }
            handler.postDelayed(this, 1000);
        }
    };

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        createChannel();
        Notification notification = buildNotification();
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIF_ID, notification);
        }
        handler.removeCallbacks(tick);
        handler.postDelayed(tick, 1000);
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        handler.removeCallbacks(tick);
        super.onDestroy();
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Sonraki namaz (kalıcı)",
            NotificationManager.IMPORTANCE_LOW
        );
        channel.setDescription("Sonraki ezana kalan süreyi canlı gösterir");
        channel.setShowBadge(false);
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm != null) nm.createNotificationChannel(channel);
    }

    private Notification buildNotification() {
        String title = "Ezan vakti senkronize ediliyor…";
        String body = "Sonraki ezan saati yüklenince geri sayım başlar";

        try {
            SharedPreferences prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = prefs.getString(KEY, null);
            if (raw != null) {
                JSONObject json = new JSONObject(raw);
                String location = json.optString("location", "");
                JSONArray times = json.optJSONArray("times");
                if (times != null) {
                    long now = System.currentTimeMillis();
                    JSONObject next = null;
                    JSONObject after = null;
                    for (int i = 0; i < times.length(); i++) {
                        JSONObject t = times.getJSONObject(i);
                        long at = t.optLong("at", 0);
                        if (at <= now) continue;
                        if (next == null) next = t;
                        else if (after == null) after = t;
                    }
                    if (next != null) {
                        long targetAt = next.optLong("at", 0);
                        String label = next.optString("label", "Ezan");
                        String clock = next.optString("time", "");
                        title = label + " ezanına " + PrayerCountdown.formatRemaining(targetAt - now);
                        StringBuilder sb = new StringBuilder();
                        if (!clock.isEmpty()) sb.append(clock);
                        if (!location.isEmpty()) {
                            if (sb.length() > 0) sb.append(" · ");
                            sb.append(location);
                        }
                        if (after != null) {
                            if (sb.length() > 0) sb.append(" · ");
                            sb.append("sonra ")
                                .append(after.optString("label", ""))
                                .append(" ")
                                .append(after.optString("time", ""));
                        }
                        body = sb.toString();
                    }
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

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pi)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_STATUS)
            .setShowWhen(false);

        return builder.build();
    }

    public static void refreshNotification(Context context) {
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

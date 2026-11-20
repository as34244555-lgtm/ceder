package com.ezan.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import androidx.core.app.NotificationCompat;

/** Vakit alarmı. Ses kapalıysa yalnızca bildirim, açıksa ezan servisini başlatır. */
public class PrayerAlarmReceiver extends BroadcastReceiver {
    static final String CHANNEL_ID = "ezan_alarm_playback";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        boolean audible = intent.getBooleanExtra("audible", true);
        if (!audible) {
            showSilent(context, intent.getStringExtra("title"), intent.getStringExtra("body"));
            return;
        }
        Intent service = new Intent(context, PrayerSoundService.class);
        if (intent.getExtras() != null) service.putExtras(intent.getExtras());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(service);
        } else {
            context.startService(service);
        }
    }

    static void ensureChannel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(
            CHANNEL_ID,
            "Ezan alarmı",
            NotificationManager.IMPORTANCE_HIGH
        );
        channel.setDescription("Vakit girince ezan veya kısa nağme");
        channel.setSound(null, null);
        channel.enableVibration(true);
        channel.setLockscreenVisibility(android.app.Notification.VISIBILITY_PUBLIC);
        NotificationManager nm = context.getSystemService(NotificationManager.class);
        if (nm != null) nm.createNotificationChannel(channel);
    }

    private static void showSilent(Context context, String title, String body) {
        ensureChannel(context);
        Intent launch = new Intent(context, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(
            context,
            0,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title == null ? "Ezan vakti" : title)
            .setContentText(body == null ? "Vaktin hayırlı olsun." : body)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC);
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(88002, builder.build());
    }
}

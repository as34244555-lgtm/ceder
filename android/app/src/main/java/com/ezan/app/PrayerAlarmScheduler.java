package com.ezan.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Vakit alarmlarını AlarmManager.setAlarmClock ile kurar.
 * Uygulama kapalıyken ve Doze modunda da çalar.
 */
public final class PrayerAlarmScheduler {
    public static final String ACTION = "com.ezan.app.PRAYER_ALARM";
    private static final String PREFS = "ezan_alarms";
    private static final String KEY_PAYLOAD = "payload";
    private static final String KEY_IDS = "ids";

    private PrayerAlarmScheduler() {}

    public static void sync(Context context, String payload) {
        Context app = context.getApplicationContext();
        SharedPreferences prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        cancelAll(app, prefs);
        prefs.edit().putString(KEY_PAYLOAD, payload == null ? "" : payload).apply();
        scheduleFromPayload(app, payload);
    }

    public static void restore(Context context) {
        Context app = context.getApplicationContext();
        SharedPreferences prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        cancelAll(app, prefs);
        scheduleFromPayload(app, prefs.getString(KEY_PAYLOAD, ""));
    }

    private static void cancelAll(Context context, SharedPreferences prefs) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        String raw = prefs.getString(KEY_IDS, "");
        if (am != null && raw != null) {
            for (String part : raw.split(",")) {
                if (part.isEmpty()) continue;
                try {
                    int id = Integer.parseInt(part);
                    Intent op = new Intent(context, PrayerAlarmReceiver.class);
                    op.setAction(ACTION);
                    PendingIntent pi = PendingIntent.getBroadcast(
                        context,
                        id,
                        op,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    am.cancel(pi);
                    pi.cancel();
                } catch (Exception ignored) {
                }
            }
        }
        prefs.edit().remove(KEY_IDS).apply();
    }

    private static void scheduleFromPayload(Context context, String payload) {
        if (payload == null || payload.isEmpty()) return;
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        try {
            JSONObject json = new JSONObject(payload);
            JSONArray alarms = json.optJSONArray("alarms");
            if (alarms == null || alarms.length() == 0) return;

            long now = System.currentTimeMillis();
            StringBuilder ids = new StringBuilder();
            int scheduled = 0;
            for (int i = 0; i < alarms.length() && scheduled < 40; i++) {
                JSONObject alarm = alarms.getJSONObject(i);
                long at = alarm.optLong("at", 0);
                if (at <= now + 1000) continue;
                int id = alarm.optInt("id", 1000 + i);

                Intent op = new Intent(context, PrayerAlarmReceiver.class);
                op.setAction(ACTION);
                op.putExtra("id", id);
                op.putExtra("title", alarm.optString("title", "Ezan vakti"));
                op.putExtra("body", alarm.optString("body", "Vaktin hayırlı olsun."));
                op.putExtra("mode", alarm.optString("mode", "chime"));
                op.putExtra("soundId", alarm.optString("soundId", "makkah"));
                op.putExtra("audible", alarm.optBoolean("audible", true));

                PendingIntent operation = PendingIntent.getBroadcast(
                    context,
                    id,
                    op,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                Intent show = new Intent(context, MainActivity.class);
                show.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
                PendingIntent showPi = PendingIntent.getActivity(
                    context,
                    id + 50_000,
                    show,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        am.setAlarmClock(new AlarmManager.AlarmClockInfo(at, showPi), operation);
                    } else {
                        am.setExact(AlarmManager.RTC_WAKEUP, at, operation);
                    }
                } catch (SecurityException ex) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, operation);
                    } else {
                        am.set(AlarmManager.RTC_WAKEUP, at, operation);
                    }
                }

                if (ids.length() > 0) ids.append(',');
                ids.append(id);
                scheduled++;
            }
            context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
                .edit()
                .putString(KEY_IDS, ids.toString())
                .apply();
        } catch (Exception ignored) {
        }
    }
}

package com.ezanvakti.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Ana ekran widget'ı. Web tarafı Capacitor Preferences ile
 * "widget_prayer_times" anahtarına JSON yazar (CapacitorStorage).
 */
public class PrayerTimesWidget extends AppWidgetProvider {

    private static final String PREFS = "CapacitorStorage";
    private static final String KEY = "widget_prayer_times";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId);
        }
    }

    static void updateAppWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_prayer_times);

        Intent launchIntent = new Intent(context, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        String location = "Ezan Vakti";
        String timesText = "Uygulamayı açarak vakitleri senkronize edin.";

        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
            String raw = prefs.getString(KEY, null);
            if (raw != null && !raw.isEmpty()) {
                JSONObject json = new JSONObject(raw);
                location = json.optString("location", location);
                JSONArray arr = json.optJSONArray("times");
                if (arr != null && arr.length() > 0) {
                    StringBuilder sb = new StringBuilder();
                    for (int i = 0; i < arr.length(); i++) {
                        JSONObject t = arr.getJSONObject(i);
                        if (i > 0) sb.append('\n');
                        sb.append(t.optString("label", ""))
                            .append("  ")
                            .append(t.optString("time", ""));
                    }
                    timesText = sb.toString();
                }
            }
        } catch (Exception ignored) {
            // varsayılan metin kalır
        }

        views.setTextViewText(R.id.widget_location, location);
        views.setTextViewText(R.id.widget_times, timesText);
        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}

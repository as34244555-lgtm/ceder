package com.ezan.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(PrayerNativePlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onResume() {
        super.onResume();
        refreshWidgets();
    }

    private void refreshWidgets() {
        try {
            Intent intent = new Intent(this, PrayerTimesWidget.class);
            intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
            int[] ids = AppWidgetManager.getInstance(this)
                .getAppWidgetIds(new ComponentName(this, PrayerTimesWidget.class));
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
            sendBroadcast(intent);
        } catch (Exception ignored) {
            // widget yoksa sorun değil
        }
    }
}

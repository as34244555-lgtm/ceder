package com.ezan.app;

import android.content.Context;
import android.content.Intent;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import android.view.Surface;
import android.view.WindowManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PrayerNative")
public class PrayerNativePlugin extends Plugin implements SensorEventListener {

    private SensorManager sensorManager;
    private Sensor rotationSensor;
    private Sensor accelerometer;
    private Sensor magnetometer;
    private boolean compassRunning = false;
    private long lastEmitMs = 0;

    private final float[] gravity = new float[3];
    private final float[] geomagnetic = new float[3];
    private final float[] rotationMatrix = new float[9];
    private final float[] remappedMatrix = new float[9];
    private final float[] orientation = new float[3];
    private boolean hasGravity = false;
    private boolean hasMag = false;

    @PluginMethod
    public void startOngoing(PluginCall call) {
        Intent service = new Intent(getContext(), OngoingPrayerService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(service);
        } else {
            getContext().startService(service);
        }
        Intent widget = new Intent(getContext(), PrayerTimesWidget.class);
        widget.setAction(android.appwidget.AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = android.appwidget.AppWidgetManager.getInstance(getContext())
            .getAppWidgetIds(new android.content.ComponentName(getContext(), PrayerTimesWidget.class));
        widget.putExtra(android.appwidget.AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        getContext().sendBroadcast(widget);
        call.resolve();
    }

    @PluginMethod
    public void stopOngoing(PluginCall call) {
        Intent service = new Intent(getContext(), OngoingPrayerService.class);
        getContext().stopService(service);
        call.resolve();
    }

    @PluginMethod
    public void openBatterySettings(PluginCall call) {
        try {
            Intent intent = new Intent();
            String pkg = getContext().getPackageName();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                intent.setAction(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + pkg));
            } else {
                intent.setAction(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            try {
                Intent fallback = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(fallback);
                call.resolve();
            } catch (Exception ex) {
                call.reject("Pil ayarları açılamadı");
            }
        }
    }

    @PluginMethod
    public void isIgnoringBatteryOptimizations(PluginCall call) {
        JSObject ret = new JSObject();
        boolean ignoring = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) getContext().getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                ignoring = pm.isIgnoringBatteryOptimizations(getContext().getPackageName());
            }
        }
        ret.put("value", ignoring);
        call.resolve(ret);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                intent.setData(Uri.parse("package:" + getContext().getPackageName()));
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                getContext().startActivity(intent);
            }
            call.resolve();
        } catch (Exception e) {
            call.reject("Exact alarm ayarı açılamadı");
        }
    }

    @PluginMethod
    public void startCompass(PluginCall call) {
        try {
            if (sensorManager == null) {
                sensorManager = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
            }
            if (sensorManager == null) {
                call.reject("Sensör yöneticisi yok");
                return;
            }
            stopCompassInternal();

            rotationSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
            if (rotationSensor != null) {
                sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_GAME);
            } else {
                accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
                magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);
                if (accelerometer == null || magnetometer == null) {
                    call.reject("Bu cihazda pusula sensörü yok");
                    return;
                }
                sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
                sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_GAME);
            }
            compassRunning = true;
            JSObject ret = new JSObject();
            ret.put("ok", true);
            ret.put("mode", rotationSensor != null ? "rotation" : "mag");
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Pusula başlatılamadı: " + e.getMessage());
        }
    }

    @PluginMethod
    public void stopCompass(PluginCall call) {
        stopCompassInternal();
        call.resolve();
    }

    @PluginMethod
    public void isCompassAvailable(PluginCall call) {
        JSObject ret = new JSObject();
        SensorManager sm = (SensorManager) getContext().getSystemService(Context.SENSOR_SERVICE);
        boolean ok = false;
        if (sm != null) {
            ok = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR) != null
                || (sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null
                    && sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD) != null);
        }
        ret.put("value", ok);
        call.resolve(ret);
    }

    private void stopCompassInternal() {
        if (sensorManager != null && compassRunning) {
            sensorManager.unregisterListener(this);
        }
        compassRunning = false;
        hasGravity = false;
        hasMag = false;
        rotationSensor = null;
        accelerometer = null;
        magnetometer = null;
    }

    @Override
    protected void handleOnDestroy() {
        stopCompassInternal();
        super.handleOnDestroy();
    }

    @Override
    protected void handleOnPause() {
        // Arka planda dinlemeyi kes (pil)
        if (compassRunning && sensorManager != null) {
            sensorManager.unregisterListener(this);
        }
        super.handleOnPause();
    }

    @Override
    protected void handleOnResume() {
        super.handleOnResume();
        if (compassRunning && sensorManager != null) {
            if (rotationSensor != null) {
                sensorManager.registerListener(this, rotationSensor, SensorManager.SENSOR_DELAY_GAME);
            } else {
                if (accelerometer != null) {
                    sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
                }
                if (magnetometer != null) {
                    sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_GAME);
                }
            }
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        float heading = Float.NaN;

        if (event.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR) {
            SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);
            remapForDisplay(rotationMatrix, remappedMatrix);
            SensorManager.getOrientation(remappedMatrix, orientation);
            heading = (float) Math.toDegrees(orientation[0]);
        } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
            lowPass(event.values, gravity);
            hasGravity = true;
        } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
            lowPass(event.values, geomagnetic);
            hasMag = true;
        }

        if (Float.isNaN(heading) && hasGravity && hasMag) {
            if (SensorManager.getRotationMatrix(rotationMatrix, null, gravity, geomagnetic)) {
                remapForDisplay(rotationMatrix, remappedMatrix);
                SensorManager.getOrientation(remappedMatrix, orientation);
                heading = (float) Math.toDegrees(orientation[0]);
            }
        }

        if (Float.isNaN(heading)) return;

        long now = System.currentTimeMillis();
        if (now - lastEmitMs < 50) return;
        lastEmitMs = now;

        float normalized = (heading + 360f) % 360f;
        JSObject ret = new JSObject();
        ret.put("heading", normalized);
        ret.put("accuracy", event.accuracy);
        notifyListeners("compassHeading", ret);
    }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        JSObject ret = new JSObject();
        ret.put("accuracy", accuracy);
        notifyListeners("compassAccuracy", ret);
    }

    /** Telefon dik/portrait tutulurken dünya eksenlerini ekrana göre yeniden eşle. */
    private void remapForDisplay(float[] inR, float[] outR) {
        int rotation = Surface.ROTATION_0;
        try {
            WindowManager wm = (WindowManager) getContext().getSystemService(Context.WINDOW_SERVICE);
            if (wm != null) {
                rotation = wm.getDefaultDisplay().getRotation();
            }
        } catch (Exception ignored) {
            // varsayılan
        }

        int axisX = SensorManager.AXIS_X;
        int axisY = SensorManager.AXIS_Z; // cihaz dik: Z yukarıya bakış yerine ekran

        switch (rotation) {
            case Surface.ROTATION_90:
                axisX = SensorManager.AXIS_Z;
                axisY = SensorManager.AXIS_MINUS_X;
                break;
            case Surface.ROTATION_180:
                axisX = SensorManager.AXIS_MINUS_X;
                axisY = SensorManager.AXIS_MINUS_Z;
                break;
            case Surface.ROTATION_270:
                axisX = SensorManager.AXIS_MINUS_Z;
                axisY = SensorManager.AXIS_X;
                break;
            case Surface.ROTATION_0:
            default:
                axisX = SensorManager.AXIS_X;
                axisY = SensorManager.AXIS_Z;
                break;
        }

        boolean remapped = SensorManager.remapCoordinateSystem(inR, axisX, axisY, outR);
        if (!remapped) {
            System.arraycopy(inR, 0, outR, 0, inR.length);
        }
    }

    private static void lowPass(float[] input, float[] output) {
        final float alpha = 0.18f;
        for (int i = 0; i < input.length; i++) {
            if (output[i] == 0f && input[i] != 0f && Math.abs(output[0]) + Math.abs(output[1]) + Math.abs(output[2]) < 0.01f) {
                // ilk örnek: doğrudan kopyala
                System.arraycopy(input, 0, output, 0, input.length);
                return;
            }
            output[i] = output[i] + alpha * (input[i] - output[i]);
        }
    }
}

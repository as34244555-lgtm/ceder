package com.ezan.app;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.content.res.AssetFileDescriptor;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.session.MediaSession;
import android.media.session.PlaybackState;
import android.os.Build;
import android.os.IBinder;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;

/**
 * Uygulama kapalıyken ezan kaydını veya kısa nağmeyi alarm sesiyle çalar.
 */
public class PrayerSoundService extends Service {
    public static final String ACTION_STOP = "com.ezan.app.STOP_ADHAN";
    private static final int NOTIF_ID = 88001;

    private boolean stopping;
    private MediaPlayer player;
    private MediaSession session;
    private PowerManager.WakeLock wakeLock;
    private AssetFileDescriptor source;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            shutdown();
            return START_NOT_STICKY;
        }
        stopping = false;

        PrayerAlarmReceiver.ensureChannel(this);
        String title = intent != null ? intent.getStringExtra("title") : null;
        String body = intent != null ? intent.getStringExtra("body") : null;
        String mode = intent != null ? intent.getStringExtra("mode") : "chime";
        String soundId = intent != null ? intent.getStringExtra("soundId") : "makkah";
        if (title == null || title.isEmpty()) title = "Ezan vakti";
        if (body == null) body = "Vaktin hayırlı olsun.";

        startSession();
        startInForeground(buildNotification(title, playingLabel(mode)));
        acquireWakeLock();
        boolean fullAdhan = "adhan".equals(mode);
        play(fullAdhan ? AdhanAssets.assetPath(soundId) : null, fullAdhan);
        return START_NOT_STICKY;
    }

    private static String playingLabel(String mode) {
        return "adhan".equals(mode) ? "Ezan okunuyor" : "Kısa nağme çalıyor";
    }

    private void startInForeground(Notification notification) {
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK);
        } else {
            startForeground(NOTIF_ID, notification);
        }
    }

    private Notification buildNotification(String title, String body) {
        Intent launch = new Intent(this, MainActivity.class);
        launch.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent open = PendingIntent.getActivity(
            this,
            1,
            launch,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        Intent stop = new Intent(this, PrayerSoundService.class);
        stop.setAction(ACTION_STOP);
        PendingIntent stopPi = PendingIntent.getService(
            this,
            2,
            stop,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        return new NotificationCompat.Builder(this, PrayerAlarmReceiver.CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(open)
            .setOngoing(true)
            .setSilent(true)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Durdur", stopPi)
            .setDeleteIntent(stopPi)
            .build();
    }

    private void play(String assetPath, boolean allowChimeFallback) {
        releasePlayer();
        try {
            MediaPlayer mp = new MediaPlayer();
            player = mp;
            mp.setAudioAttributes(new AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_ALARM)
                .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                .build());
            mp.setWakeMode(this, PowerManager.PARTIAL_WAKE_LOCK);
            if (assetPath != null) {
                source = getAssets().openFd(assetPath);
            } else {
                source = getResources().openRawResourceFd(R.raw.ezan_alert);
            }
            mp.setDataSource(source.getFileDescriptor(), source.getStartOffset(), source.getLength());
            mp.setOnPreparedListener(prepared -> {
                closeSource();
                requestFocus();
                prepared.start();
            });
            mp.setOnCompletionListener(done -> shutdown());
            mp.setOnErrorListener((failed, what, extra) -> {
                if (player == failed) player = null;
                try {
                    failed.release();
                } catch (Exception ignored) {
                }
                closeSource();
                if (allowChimeFallback) {
                    play(null, false);
                } else {
                    shutdown();
                }
                return true;
            });
            mp.prepareAsync();
        } catch (Exception ex) {
            releasePlayer();
            if (allowChimeFallback) {
                play(null, false);
            } else {
                shutdown();
            }
        }
    }

    private void requestFocus() {
        AudioManager am = (AudioManager) getSystemService(AUDIO_SERVICE);
        if (am == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            am.requestAudioFocus(new android.media.AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                    .build())
                .build());
        } else {
            am.requestAudioFocus(null, AudioManager.STREAM_ALARM, AudioManager.AUDIOFOCUS_GAIN_TRANSIENT);
        }
    }

    private void startSession() {
        if (session != null) return;
        session = new MediaSession(this, "ezan-alarm");
        session.setCallback(new MediaSession.Callback() {
            @Override
            public void onStop() {
                shutdown();
            }

            @Override
            public void onPause() {
                shutdown();
            }
        });
        session.setPlaybackState(new PlaybackState.Builder()
            .setActions(PlaybackState.ACTION_STOP | PlaybackState.ACTION_PAUSE)
            .setState(PlaybackState.STATE_PLAYING, 0, 1f)
            .build());
        session.setActive(true);
    }

    private void stopSession() {
        if (session == null) return;
        try {
            session.setActive(false);
            session.release();
        } catch (Exception ignored) {
        }
        session = null;
    }

    private void acquireWakeLock() {
        if (wakeLock != null && wakeLock.isHeld()) return;
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        if (pm == null) return;
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "ezan:adhan");
        wakeLock.setReferenceCounted(false);
        wakeLock.acquire(10 * 60 * 1000L);
    }

    private void closeSource() {
        if (source != null) {
            try {
                source.close();
            } catch (Exception ignored) {
            }
            source = null;
        }
    }

    private void releasePlayer() {
        closeSource();
        if (player != null) {
            try {
                player.setOnCompletionListener(null);
                player.setOnErrorListener(null);
                player.reset();
            } catch (Exception ignored) {
            }
            try {
                player.release();
            } catch (Exception ignored) {
            }
            player = null;
        }
    }

    private void shutdown() {
        if (stopping) return;
        stopping = true;
        releasePlayer();
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {
            }
        }
        wakeLock = null;
        stopSession();
        NotificationManager nm = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(NOTIF_ID);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            stopForeground(STOP_FOREGROUND_REMOVE);
        } else {
            stopForeground(true);
        }
        stopSelf();
    }

    @Override
    public void onDestroy() {
        releasePlayer();
        stopSession();
        if (wakeLock != null && wakeLock.isHeld()) {
            try {
                wakeLock.release();
            } catch (Exception ignored) {
            }
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}

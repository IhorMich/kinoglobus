package com.movenexplore.app;

import android.Manifest;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import java.util.Calendar;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class ReleaseAlertReceiver extends BroadcastReceiver {
    private static final String ACTION = "com.movenexplore.app.RELEASE_ALERT";
    private static final String CHANNEL = "moven_releases";

    static boolean canNotify(Context context) {
        return (Build.VERSION.SDK_INT < 33 ||
                context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED)
                && NotificationManagerCompat.from(context).areNotificationsEnabled();
    }

    private static SharedPreferences storage(Context context) {
        return context.getSharedPreferences("release_alerts", Context.MODE_PRIVATE);
    }

    private static JSONArray stored(Context context) {
        try {
            return new JSONArray(storage(context).getString("events", "[]"));
        } catch (JSONException error) {
            return new JSONArray();
        }
    }

    private static PendingIntent pending(Context context, String id) {
        Intent intent = new Intent(context, ReleaseAlertReceiver.class).setAction(ACTION)
                .setData(Uri.fromParts("moven-release", id, null));
        return PendingIntent.getBroadcast(context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    static synchronized void replace(Context context, JSONArray events) {
        AlarmManager alarm = context.getSystemService(AlarmManager.class);
        JSONArray previous = stored(context);
        if (alarm != null) {
            for (int i = 0; i < previous.length(); i++) {
                JSONObject event = previous.optJSONObject(i);
                if (event != null) alarm.cancel(pending(context, event.optString("id")));
            }
        }
        SharedPreferences preferences = storage(context);
        SharedPreferences.Editor editor = preferences.edit().putString("events", events.toString());
        long cutoff = System.currentTimeMillis() - 35L * 24 * 60 * 60 * 1000;
        for (Map.Entry<String, ?> mark : preferences.getAll().entrySet()) {
            if (mark.getKey().startsWith("delivered:") && mark.getValue() instanceof Long
                    && (Long) mark.getValue() < cutoff) editor.remove(mark.getKey());
        }
        editor.apply();
        schedule(context, events);
    }

    private static long localWhen(JSONObject event) {
        String date = event.optString("date");
        if (!date.matches("\\d{4}-\\d{2}-\\d{2}")) return event.optLong("at");
        String[] parts = date.split("-");
        Calendar local = Calendar.getInstance();
        local.clear();
        local.set(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]) - 1,
                Integer.parseInt(parts[2]), event.optInt("hour", 9), 0, 0);
        int lead = event.optInt("lead");
        local.add(Calendar.DATE, -(lead / 1440));
        local.add(Calendar.MINUTE, -(lead % 1440));
        return local.getTimeInMillis();
    }

    private static void schedule(Context context, JSONArray events) {
        AlarmManager alarm = context.getSystemService(AlarmManager.class);
        if (alarm == null || !canNotify(context)) return;
        for (int i = 0; i < events.length(); i++) {
            JSONObject event = events.optJSONObject(i);
            if (event == null) continue;
            String id = event.optString("id");
            long at = localWhen(event);
            if (!id.isEmpty() && id.length() <= 150 && at > System.currentTimeMillis()
                    && !storage(context).contains("delivered:" + id)) {
                PendingIntent action = pending(context, id);
                if ((Build.VERSION.SDK_INT < 31 || alarm.canScheduleExactAlarms())) {
                    try {
                        alarm.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, action);
                        continue;
                    } catch (SecurityException ignored) {
                        // Permission may have been revoked since the capability check.
                    }
                }
                alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, action);
            }
        }
    }

    static void notify(Context context, String id, String title, String text) {
        if (!canNotify(context)) return;
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        if (manager == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Moven",
                    NotificationManager.IMPORTANCE_DEFAULT));
        }
        Intent launch = new Intent(context, MainActivity.class)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent open = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE);
        manager.notify(id, 0, new NotificationCompat.Builder(context, CHANNEL)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(text)
                .setContentIntent(open)
                .setAutoCancel(true)
                .build());
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction()) ||
                Intent.ACTION_TIMEZONE_CHANGED.equals(intent.getAction())) {
            replace(context, stored(context));
            return;
        }
        if (!ACTION.equals(intent.getAction()) || intent.getData() == null) return;
        String id = intent.getData().getSchemeSpecificPart();
        JSONArray events = stored(context);
        for (int i = 0; i < events.length(); i++) {
            JSONObject event = events.optJSONObject(i);
            if (event != null && id.equals(event.optString("id"))) {
                SharedPreferences preferences = storage(context);
                String delivered = "delivered:" + id;
                long now = System.currentTimeMillis();
                if (localWhen(event) <= now && canNotify(context) && !preferences.contains(delivered)) {
                    notify(context, id, event.optString("title"), event.optString("body"));
                    preferences.edit().putLong(delivered, now).apply();
                }
                return;
            }
        }
    }
}

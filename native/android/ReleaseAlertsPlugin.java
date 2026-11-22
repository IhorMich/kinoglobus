package com.movenexplore.app;

import android.Manifest;
import android.os.Build;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "ReleaseAlerts", permissions = {
    @Permission(alias = "notifications", strings = {Manifest.permission.POST_NOTIFICATIONS})
})
public class ReleaseAlertsPlugin extends Plugin {
    @PluginMethod
    public void enable(PluginCall call) {
        if (Build.VERSION.SDK_INT >= 33 && getPermissionState("notifications") != PermissionState.GRANTED) {
            requestPermissionForAlias("notifications", call, "notificationPermission");
        } else {
            notificationPermission(call);
        }
    }

    @PermissionCallback
    private void notificationPermission(PluginCall call) {
        boolean granted = ReleaseAlertReceiver.canNotify(getContext());
        call.resolve(new JSObject().put("enabled", granted));
    }

    @PluginMethod
    public void synchronize(PluginCall call) {
        JSArray events = call.getArray("events", new JSArray());
        if (events.length() > 250) {
            call.reject("Too many release reminders");
            return;
        }
        try {
            ReleaseAlertReceiver.replace(getContext(), events);
            call.resolve(new JSObject().put("enabled", ReleaseAlertReceiver.canNotify(getContext())));
        } catch (RuntimeException error) {
            call.reject("Could not synchronize release reminders", error);
        }
    }

    @PluginMethod
    public void trailer(PluginCall call) {
        String id = call.getString("id", "");
        String title = call.getString("title", "");
        String body = call.getString("body", "");
        if (id.isEmpty() || id.length() > 150 || title.length() > 500 || body.length() > 500) {
            call.reject("Invalid trailer notification");
            return;
        }
        ReleaseAlertReceiver.notify(getContext(), id, title, body);
        call.resolve(new JSObject().put("enabled", ReleaseAlertReceiver.canNotify(getContext())));
    }
}

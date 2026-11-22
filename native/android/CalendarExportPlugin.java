package com.movenexplore.app;

import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "CalendarExport")
public class CalendarExportPlugin extends Plugin {
    @PluginMethod
    public void share(PluginCall call) {
        String content = call.getString("content", "");
        if (!content.startsWith("BEGIN:VCALENDAR\r\n") || content.length() > 524288) {
            call.reject("Invalid calendar content");
            return;
        }

        try {
            File directory = new File(getContext().getCacheDir(), "calendar");
            if (!directory.isDirectory() && !directory.mkdirs()) {
                call.reject("Calendar cache unavailable");
                return;
            }
            File file = new File(directory, "Moven.ics");
            try (FileOutputStream stream = new FileOutputStream(file)) {
                stream.write(content.getBytes(StandardCharsets.UTF_8));
            }
            Uri uri = FileProvider.getUriForFile(getContext(),
                    getContext().getPackageName() + ".fileprovider", file);
            Intent send = new Intent(Intent.ACTION_SEND);
            send.setType("text/calendar");
            send.putExtra(Intent.EXTRA_STREAM, uri);
            send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            getActivity().runOnUiThread(() -> {
                try {
                    getActivity().startActivity(Intent.createChooser(send, null));
                    call.resolve();
                } catch (RuntimeException error) {
                    call.reject("Could not open calendar sharing", error);
                }
            });
        } catch (Exception error) {
            call.reject("Could not prepare calendar", error);
        }
    }
}

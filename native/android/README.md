# Android entry point

Copy the Java files from this directory to `android/app/src/main/java/com/movenexplore/app/` in the Capacitor wrapper.

The JavaScript `window.KGHandleBack()` returns `true` after navigating back within the app and `false` at the root screen. At the root, two Back gestures within two seconds move the task to the background, without a toast or dialog. Leaving the activity or navigating back within the app resets the gesture window.


Add the permissions and receiver from `release-alerts-manifest.xml` to the Capacitor wrapper's Android manifest. The release reminder schedule uses exact alarms when Android permits them. Otherwise Android can adjust delivery time to save battery.

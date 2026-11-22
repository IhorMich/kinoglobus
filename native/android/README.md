# Android entry point

Copy `MainActivity.java`, `RootBackGate.java` and `CalendarExportPlugin.java` to `android/app/src/main/java/com/movenexplore/app/` in the Capacitor wrapper.

The JavaScript `window.KGHandleBack()` returns `true` after navigating back within the app and `false` at the root screen. At the root, two Back gestures within two seconds move the task to the background, without a toast or dialog. Leaving the activity or navigating back within the app resets the gesture window.

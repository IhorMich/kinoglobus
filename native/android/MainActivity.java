package com.movenexplore.app;

import android.os.Bundle;
import android.os.SystemClock;
import android.graphics.Color;
import androidx.activity.OnBackPressedCallback;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private final RootBackGate rootBackGate = new RootBackGate();
    private boolean acceptingBack = false;

    private void handleRootBack() {
        if (rootBackGate.shouldMoveToBackground(SystemClock.elapsedRealtime())) {
            moveTaskToBack(true);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        acceptingBack = true;
    }

    @Override
    protected void onPause() {
        acceptingBack = false;
        rootBackGate.reset();
        super.onPause();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        configureEdgeToEdge();
        super.onCreate(savedInstanceState);
        configureEdgeToEdge();
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (getBridge() == null || getBridge().getWebView() == null) {
                    handleRootBack();
                    return;
                }
                getBridge().getWebView().evaluateJavascript(
                    "window.KGHandleBack ? window.KGHandleBack() : false",
                    result -> {
                        if (!acceptingBack) return;
                        if ("true".equals(result)) rootBackGate.reset();
                        else handleRootBack();
                    }
                );
            }
        });
    }

    private void configureEdgeToEdge() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        WindowInsetsControllerCompat bars = WindowCompat.getInsetsController(
                getWindow(), getWindow().getDecorView());
        bars.setAppearanceLightStatusBars(false);
        bars.setAppearanceLightNavigationBars(false);
    }
}

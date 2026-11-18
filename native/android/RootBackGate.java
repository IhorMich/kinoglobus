package com.movenexplore.app;

final class RootBackGate {
    private static final long INTERVAL_MS = 2000L;
    private long previousBackAt = -1L;

    boolean shouldMoveToBackground(long now) {
        if (previousBackAt >= 0 && now - previousBackAt <= INTERVAL_MS) {
            reset();
            return true;
        }
        previousBackAt = now;
        return false;
    }

    void reset() {
        previousBackAt = -1L;
    }
}

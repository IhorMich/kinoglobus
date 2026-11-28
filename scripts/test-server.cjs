"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = fs.realpathSync(
    path.resolve(__dirname, "..")
);

const HOST = "127.0.0.1";
const PORT = 4173;

const ALLOWED = new Set(
[
    "account-page.js",
    "app-theme.css",
    "assets/branding/moven-icon-180.png",
    "assets/branding/moven-icon-192.png",
    "assets/branding/moven-icon-32.png",
    "assets/branding/moven-icon-512.png",
    "assets/branding/moven-icon-source.png",
    "assets/covers/african.jpg",
    "assets/covers/arabic.jpg",
    "assets/covers/auhorror.jpg",
    "assets/covers/brazil.jpg",
    "assets/covers/cnfan.jpg",
    "assets/covers/dedrama.jpg",
    "assets/covers/esdrama.jpg",
    "assets/covers/eshorror.jpg",
    "assets/covers/frcom.jpg",
    "assets/covers/frnoir.jpg",
    "assets/covers/gbdet.jpg",
    "assets/covers/gbdrama.jpg",
    "assets/covers/hk.jpg",
    "assets/covers/idhorror.jpg",
    "assets/covers/inact.jpg",
    "assets/covers/inclassic.jpg",
    "assets/covers/inromance.jpg",
    "assets/covers/ir.jpg",
    "assets/covers/itcom.jpg",
    "assets/covers/itcrime.jpg",
    "assets/covers/jhorror.jpg",
    "assets/covers/jp.jpg",
    "assets/covers/jpauteur.jpg",
    "assets/covers/jpcrime.jpg",
    "assets/covers/jpscifi.jpg",
    "assets/covers/kr.jpg",
    "assets/covers/krdrama.jpg",
    "assets/covers/latam.jpg",
    "assets/covers/mxdrama.jpg",
    "assets/covers/nordic.jpg",
    "assets/covers/pldrama.jpg",
    "assets/covers/series/tv-au-drama.webp",
    "assets/covers/series/tv-auhorror.webp",
    "assets/covers/series/tv-brazil.webp",
    "assets/covers/series/tv-ca-mystery.webp",
    "assets/covers/series/tv-cnfan.webp",
    "assets/covers/series/tv-dedrama.webp",
    "assets/covers/series/tv-es-crime.webp",
    "assets/covers/series/tv-esdrama.webp",
    "assets/covers/series/tv-frcom.webp",
    "assets/covers/series/tv-frnoir.webp",
    "assets/covers/series/tv-gbdet.webp",
    "assets/covers/series/tv-gbdrama.webp",
    "assets/covers/series/tv-indian-crime.webp",
    "assets/covers/series/tv-inromance.webp",
    "assets/covers/series/tv-itcrime.webp",
    "assets/covers/series/tv-jp.webp",
    "assets/covers/series/tv-jpauteur.webp",
    "assets/covers/series/tv-jpcrime.webp",
    "assets/covers/series/tv-kr.webp",
    "assets/covers/series/tv-krdrama.webp",
    "assets/covers/series/tv-latam.webp",
    "assets/covers/series/tv-mxdrama.webp",
    "assets/covers/series/tv-nordic.webp",
    "assets/covers/series/tv-pldrama.webp",
    "assets/covers/series/tv-th-drama.webp",
    "assets/covers/series/tv-tr-soap.webp",
    "assets/covers/series/tv-tr.webp",
    "assets/covers/series/tv-uadrama.webp",
    "assets/covers/series/tv-usanimation.webp",
    "assets/covers/series/tv-uscrime.webp",
    "assets/covers/series/tv-usscifi.webp",
    "assets/covers/suanim.jpg",
    "assets/covers/sufi.jpg",
    "assets/covers/suwar.jpg",
    "assets/covers/thhorror.jpg",
    "assets/covers/tr.jpg",
    "assets/covers/uadrama.jpg",
    "assets/covers/usanimation.jpg",
    "assets/covers/uscomedy.jpg",
    "assets/covers/uscrime.jpg",
    "assets/covers/usdrama.jpg",
    "assets/covers/ushorror.jpg",
    "assets/covers/usscifi.jpg",
    "assets/covers/uswestern.jpg",
    "assets/flags/Flag_of_East_Germany.svg",
    "assets/flags/Flag_of_Yugoslavia_(1946-1992).svg",
    "assets/flags/Flag_of_the_Soviet_Union.svg",
    "assets/flags/ad.svg",
    "assets/flags/ae.svg",
    "assets/flags/af.svg",
    "assets/flags/ag.svg",
    "assets/flags/ai.svg",
    "assets/flags/al.svg",
    "assets/flags/am.svg",
    "assets/flags/ao.svg",
    "assets/flags/aq.svg",
    "assets/flags/ar.svg",
    "assets/flags/as.svg",
    "assets/flags/at.svg",
    "assets/flags/au.svg",
    "assets/flags/aw.svg",
    "assets/flags/ax.svg",
    "assets/flags/az.svg",
    "assets/flags/ba.svg",
    "assets/flags/bb.svg",
    "assets/flags/bd.svg",
    "assets/flags/be.svg",
    "assets/flags/bf.svg",
    "assets/flags/bg.svg",
    "assets/flags/bh.svg",
    "assets/flags/bi.svg",
    "assets/flags/bj.svg",
    "assets/flags/bl.svg",
    "assets/flags/bm.svg",
    "assets/flags/bn.svg",
    "assets/flags/bo.svg",
    "assets/flags/bq.svg",
    "assets/flags/br.svg",
    "assets/flags/bs.svg",
    "assets/flags/bt.svg",
    "assets/flags/bv.svg",
    "assets/flags/bw.svg",
    "assets/flags/by.svg",
    "assets/flags/bz.svg",
    "assets/flags/ca.svg",
    "assets/flags/cc.svg",
    "assets/flags/cd.svg",
    "assets/flags/cf.svg",
    "assets/flags/cg.svg",
    "assets/flags/ch.svg",
    "assets/flags/ci.svg",
    "assets/flags/ck.svg",
    "assets/flags/cl.svg",
    "assets/flags/cm.svg",
    "assets/flags/cn.svg",
    "assets/flags/co.svg",
    "assets/flags/cr.svg",
    "assets/flags/cu.svg",
    "assets/flags/cv.svg",
    "assets/flags/cw.svg",
    "assets/flags/cx.svg",
    "assets/flags/cy.svg",
    "assets/flags/cz.svg",
    "assets/flags/de.svg",
    "assets/flags/dj.svg",
    "assets/flags/dk.svg",
    "assets/flags/dm.svg",
    "assets/flags/do.svg",
    "assets/flags/dz.svg",
    "assets/flags/ec.svg",
    "assets/flags/ee.svg",
    "assets/flags/eg.svg",
    "assets/flags/eh.svg",
    "assets/flags/er.svg",
    "assets/flags/es.svg",
    "assets/flags/et.svg",
    "assets/flags/fi.svg",
    "assets/flags/fj.svg",
    "assets/flags/fk.svg",
    "assets/flags/flag-fabric.jpg",
    "assets/flags/fm.svg",
    "assets/flags/fo.svg",
    "assets/flags/fr.svg",
    "assets/flags/ga.svg",
    "assets/flags/gb.svg",
    "assets/flags/gd.svg",
    "assets/flags/ge.svg",
    "assets/flags/gf.svg",
    "assets/flags/gg.svg",
    "assets/flags/gh.svg",
    "assets/flags/gi.svg",
    "assets/flags/gl.svg",
    "assets/flags/gm.svg",
    "assets/flags/gn.svg",
    "assets/flags/gp.svg",
    "assets/flags/gq.svg",
    "assets/flags/gr.svg",
    "assets/flags/gs.svg",
    "assets/flags/gt.svg",
    "assets/flags/gu.svg",
    "assets/flags/gw.svg",
    "assets/flags/gy.svg",
    "assets/flags/hk.svg",
    "assets/flags/hm.svg",
    "assets/flags/hn.svg",
    "assets/flags/hr.svg",
    "assets/flags/ht.svg",
    "assets/flags/hu.svg",
    "assets/flags/id.svg",
    "assets/flags/ie.svg",
    "assets/flags/il.svg",
    "assets/flags/im.svg",
    "assets/flags/in.svg",
    "assets/flags/io.svg",
    "assets/flags/iq.svg",
    "assets/flags/ir.svg",
    "assets/flags/is.svg",
    "assets/flags/it.svg",
    "assets/flags/je.svg",
    "assets/flags/jm.svg",
    "assets/flags/jo.svg",
    "assets/flags/jp.svg",
    "assets/flags/ke.svg",
    "assets/flags/kg.svg",
    "assets/flags/kh.svg",
    "assets/flags/ki.svg",
    "assets/flags/km.svg",
    "assets/flags/kn.svg",
    "assets/flags/kp.svg",
    "assets/flags/kr.svg",
    "assets/flags/kw.svg",
    "assets/flags/ky.svg",
    "assets/flags/kz.svg",
    "assets/flags/la.svg",
    "assets/flags/lb.svg",
    "assets/flags/lc.svg",
    "assets/flags/li.svg",
    "assets/flags/lk.svg",
    "assets/flags/lr.svg",
    "assets/flags/ls.svg",
    "assets/flags/lt.svg",
    "assets/flags/lu.svg",
    "assets/flags/lv.svg",
    "assets/flags/ly.svg",
    "assets/flags/ma.svg",
    "assets/flags/mc.svg",
    "assets/flags/md.svg",
    "assets/flags/me.svg",
    "assets/flags/mf.svg",
    "assets/flags/mg.svg",
    "assets/flags/mh.svg",
    "assets/flags/mk.svg",
    "assets/flags/ml.svg",
    "assets/flags/mm.svg",
    "assets/flags/mn.svg",
    "assets/flags/mo.svg",
    "assets/flags/mp.svg",
    "assets/flags/mq.svg",
    "assets/flags/mr.svg",
    "assets/flags/ms.svg",
    "assets/flags/mt.svg",
    "assets/flags/mu.svg",
    "assets/flags/mv.svg",
    "assets/flags/mw.svg",
    "assets/flags/mx.svg",
    "assets/flags/my.svg",
    "assets/flags/mz.svg",
    "assets/flags/na.svg",
    "assets/flags/nc.svg",
    "assets/flags/ne.svg",
    "assets/flags/nf.svg",
    "assets/flags/ng.svg",
    "assets/flags/ni.svg",
    "assets/flags/nl.svg",
    "assets/flags/no.svg",
    "assets/flags/np.svg",
    "assets/flags/nr.svg",
    "assets/flags/nu.svg",
    "assets/flags/nz.svg",
    "assets/flags/om.svg",
    "assets/flags/pa.svg",
    "assets/flags/pe.svg",
    "assets/flags/pf.svg",
    "assets/flags/pg.svg",
    "assets/flags/ph.svg",
    "assets/flags/pk.svg",
    "assets/flags/pl.svg",
    "assets/flags/pm.svg",
    "assets/flags/pn.svg",
    "assets/flags/pr.svg",
    "assets/flags/ps.svg",
    "assets/flags/pt.svg",
    "assets/flags/pw.svg",
    "assets/flags/py.svg",
    "assets/flags/qa.svg",
    "assets/flags/re.svg",
    "assets/flags/ro.svg",
    "assets/flags/rs.svg",
    "assets/flags/ru.svg",
    "assets/flags/rw.svg",
    "assets/flags/sa.svg",
    "assets/flags/sb.svg",
    "assets/flags/sc.svg",
    "assets/flags/sd.svg",
    "assets/flags/se.svg",
    "assets/flags/sg.svg",
    "assets/flags/sh.svg",
    "assets/flags/si.svg",
    "assets/flags/sj.svg",
    "assets/flags/sk.svg",
    "assets/flags/sl.svg",
    "assets/flags/sm.svg",
    "assets/flags/sn.svg",
    "assets/flags/so.svg",
    "assets/flags/sr.svg",
    "assets/flags/ss.svg",
    "assets/flags/st.svg",
    "assets/flags/sv.svg",
    "assets/flags/sx.svg",
    "assets/flags/sy.svg",
    "assets/flags/sz.svg",
    "assets/flags/tc.svg",
    "assets/flags/td.svg",
    "assets/flags/tf.svg",
    "assets/flags/tg.svg",
    "assets/flags/th.svg",
    "assets/flags/tj.svg",
    "assets/flags/tk.svg",
    "assets/flags/tl.svg",
    "assets/flags/tm.svg",
    "assets/flags/tn.svg",
    "assets/flags/to.svg",
    "assets/flags/tr.svg",
    "assets/flags/tt.svg",
    "assets/flags/tv.svg",
    "assets/flags/tw.svg",
    "assets/flags/tz.svg",
    "assets/flags/ua.svg",
    "assets/flags/ug.svg",
    "assets/flags/um.svg",
    "assets/flags/us.svg",
    "assets/flags/uy.svg",
    "assets/flags/uz.svg",
    "assets/flags/va.svg",
    "assets/flags/vc.svg",
    "assets/flags/ve.svg",
    "assets/flags/vg.svg",
    "assets/flags/vi.svg",
    "assets/flags/vn.svg",
    "assets/flags/vu.svg",
    "assets/flags/wf.svg",
    "assets/flags/ws.svg",
    "assets/flags/xk.svg",
    "assets/flags/ye.svg",
    "assets/flags/yt.svg",
    "assets/flags/za.svg",
    "assets/flags/zm.svg",
    "assets/flags/zw.svg",
    "assets/fonts/inter-cyrillic-italic.woff2",
    "assets/fonts/inter-cyrillic-normal.woff2",
    "assets/fonts/inter-latin-ext-italic.woff2",
    "assets/fonts/inter-latin-ext-normal.woff2",
    "assets/fonts/inter-latin-italic.woff2",
    "assets/fonts/inter-latin-normal.woff2",
    "assets/fonts/material-symbols-outlined-subset.woff2",
    "assets/fonts/noto-serif-cyrillic-italic.woff2",
    "assets/fonts/noto-serif-cyrillic-normal.woff2",
    "assets/fonts/noto-serif-latin-ext-italic.woff2",
    "assets/fonts/noto-serif-latin-ext-normal.woff2",
    "assets/fonts/noto-serif-latin-italic.woff2",
    "assets/fonts/noto-serif-latin-normal.woff2",
    "assets/geo/countries-110m.json",
    "assets/globe/earth-clouds.jpg",
    "assets/globe/earth-day-2k.jpg",
    "assets/globe/earth-day-4k.jpg",
    "assets/globe/earth-night.jpg",
    "assets/globe/earth-normal.png",
    "assets/globe/earth-specular.png",
    "assets/globe/earth_atmos_2048.jpg",
    "assets/globe/milky-way.jpg",
    "assets/hall-of-fame/banner.png",
    "assets/interface/default-avatar.svg",
    "assets/interface/index-01.jpg",
    "assets/interface/index-02.jpg",
    "assets/interface/index-03.jpg",
    "assets/interface/index-04.jpg",
    "assets/interface/index-05.jpg",
    "assets/interface/index-06.jpg",
    "assets/interface/index-07.jpg",
    "assets/interface/index-08.jpg",
    "assets/interface/index-09.jpg",
    "assets/interface/password-recovery-01.jpg",
    "assets/interface/profile-editor-01.jpg",
    "assets/interface/profile-editor-02.jpg",
    "assets/interface/profile-editor-03.jpg",
    "assets/interface/profile-editor-04.jpg",
    "assets/interface/profile-editor-05.jpg",
    "assets/interface/profile-editor-06.jpg",
    "assets/interface/profile-page-01.jpg",
    "assets/interface/profile-page-02.jpg",
    "assets/interface/profile-page-03.jpg",
    "assets/interface/profile-page-04.jpg",
    "assets/interface/profile-page-05.jpg",
    "assets/interface/profile-page-06.jpg",
    "assets/interface/profile-page-07.jpg",
    "assets/interface/profile-page-08.jpg",
    "assets/interface/profile-page-09.jpg",
    "assets/interface/profile-page-10.jpg",
    "assets/interface/profile-page-11.jpg",
    "assets/oscar/oscar-hero.jpg",
    "assets/series-gold/gold-hero.webp",
    "assets/series-hub/apple.svg",
    "assets/series-hub/fx.png",
    "assets/series-hub/max.svg",
    "assets/series-hub/netflix.svg",
    "assets/series-hub/prime.svg",
    "assets/series-hub/reference-0.jpg",
    "assets/series-hub/reference-1.jpg",
    "assets/series-hub/reference-2.jpg",
    "assets/series-hub/reference-3.jpg",
    "assets/series-hub/reference-4.jpg",
    "assets/series-hub/reference-5.jpg",
    "assets/series-hub/reference-6.jpg",
    "assets/series-hub/reference-7.jpg",
    "assets/series-hub/reference-8.jpg",
    "assets/sounds/blaster.mp3",
    "assets/sounds/build-finish.mp3",
    "assets/sounds/confirm.mp3",
    "assets/sounds/impact.mp3",
    "assets/sounds/logo-reveal.mp3",
    "assets/sounds/m-addkick.mp3",
    "assets/sounds/m-bassdrop.mp3",
    "assets/sounds/m-darkrolls.mp3",
    "assets/sounds/m-goldmetal.mp3",
    "assets/sounds/m-heroes.mp3",
    "assets/sounds/m-horror.mp3",
    "assets/sounds/m-menu.mp3",
    "assets/sounds/m-moonwalker.mp3",
    "assets/sounds/m-multiverse.mp3",
    "assets/sounds/m-oblivion.mp3",
    "assets/sounds/m-ondabeat.mp3",
    "assets/sounds/m-percussion.mp3",
    "assets/sounds/m-tension.mp3",
    "assets/sounds/reel-cine-loop.mp3",
    "assets/sounds/reel-click.mp3",
    "assets/sounds/reel-projector2-loop.mp3",
    "assets/sounds/reel-swoosh.mp3",
    "assets/sounds/reel-whistle.mp3",
    "assets/sounds/reel-whoosh-cape.mp3",
    "assets/sounds/reel-whoosh-fire.mp3",
    "assets/sounds/reel-whoosh-motion.mp3",
    "assets/sounds/ui-02.mp3",
    "assets/sounds/ui-14.mp3",
    "assets/sounds/ui-73.mp3",
    "assets/vendor/tailwind.min.css",
    "assets/vendor/three-r128.min.js",
    "assets/vibes/adrenaline.jpg",
    "assets/vibes/after-apocalypse.jpg",
    "assets/vibes/after-midnight.jpg",
    "assets/vibes/alien-signal.jpg",
    "assets/vibes/animation.jpg",
    "assets/vibes/another-era.jpg",
    "assets/vibes/awkward-comedy.jpg",
    "assets/vibes/back-in-the-day.jpg",
    "assets/vibes/behind-power.jpg",
    "assets/vibes/beyond-reality.jpg",
    "assets/vibes/billion-dollar-game.jpg",
    "assets/vibes/catharsis.jpg",
    "assets/vibes/chemistry.jpg",
    "assets/vibes/deep-space.jpg",
    "assets/vibes/familiar-faces.jpg",
    "assets/vibes/fantasy.jpg",
    "assets/vibes/goosebumps.jpg",
    "assets/vibes/growing-pains.jpg",
    "assets/vibes/last-second.jpg",
    "assets/vibes/laughs.jpg",
    "assets/vibes/locker-room.jpg",
    "assets/vibes/long-romance.jpg",
    "assets/vibes/melancholy.jpg",
    "assets/vibes/mindfuck.jpg",
    "assets/vibes/mystery.jpg",
    "assets/vibes/night-shift.jpg",
    "assets/vibes/palace-walls.jpg",
    "assets/vibes/rewind-time.jpg",
    "assets/vibes/roadtrip.jpg",
    "assets/vibes/season-case.jpg",
    "assets/vibes/shift-at-limit.jpg",
    "assets/vibes/slow-evening.jpg",
    "assets/vibes/strange-town.jpg",
    "assets/vibes/sunshine.jpg",
    "assets/vibes/trust-no-one.jpg",
    "assets/vibes/under-oath.jpg",
    "assets/vibes/wine.jpg",
    "backup-storage.js",
    "bookmarks-page.css",
    "bookmarks-page.js",
    "catalog-safety.js",
    "cinema-diary.js",
    "cinema-reel.js",
    "collection-examples.js",
    "collections.js",
    "confirm-action.js",
    "country-pages.js",
    "country-statistics.js",
    "curated-collections.js",
    "emmy-winners.js",
    "episode-page.css",
    "episode-page.js",
    "exact-top.js",
    "favorites.css",
    "favorites.js",
    "film-card.js",
    "film-detail-page.js",
    "film-interactions.js",
    "global-search.css",
    "global-search.js",
    "globe-visuals.js",
    "hall-of-fame.css",
    "hall-of-fame.js",
    "home-recommendations-controller.js",
    "home-recommendations.js",
    "home-releases.js",
    "index.html",
    "interface-en.js",
    "interface-i18n.js",
    "legal-watch.js",
    "login-page.js",
    "mood-page.js",
    "mood-vibe-additions.js",
    "mood-vibe-page.js",
    "moven.webmanifest",
    "oscar-design.js",
    "oscar-page.js",
    "password-recovery.js",
    "person-profile.css",
    "personal-calendar.css",
    "personal-calendar.js",
    "personal-preferences.js",
    "personal-recommendations.js",
    "profile-dashboard.css",
    "profile-editor.js",
    "profile-page.js",
    "profile-settings.css",
    "profile-settings.js",
    "profile-storage.js",
    "recovery-code.js",
    "release-alerts.js",
    "release-follow.css",
    "release-follow.js",
    "release-settings.css",
    "release-settings.js",
    "review-editor.css",
    "review-editor.js",
    "reviews-page.css",
    "reviews-page.js",
    "series-calendar.css",
    "series-calendar.js",
    "series-detail.css",
    "series-detail.js",
    "series-discovery.js",
    "series-gold.css",
    "series-gold.js",
    "series-hub.css",
    "series-hub.js",
    "series-page.js",
    "settings-page.css",
    "settings-page.js",
    "steel-motion.js",
    "viewing-history-page.css",
    "viewing-history-page.js",
    "viewing-note.css",
    "viewing-note.js",
    "viewing-preferences.js",
    "viewing-statistics.js",
    "watch-entry.js",
    "watch-history.js",
    "watched-button.css",
    "watched-button.js"
]
);

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".ico": "image/x-icon",
    ".avif": "image/avif",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".mp3": "audio/mpeg",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "audio/ogg",
    ".wav": "audio/wav",
    ".wasm": "application/wasm",
    ".glb": "model/gltf-binary",
    ".gltf": "model/gltf+json",
    ".ktx": "image/ktx",
    ".ktx2": "image/ktx2",
    ".bin": "application/octet-stream"
};

function headers(res) {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
}

function send(req, res, status, body, type) {
    const data = Buffer.from(body);

    res.writeHead(status, {
        "Content-Type": type || "text/plain; charset=utf-8",
        "Content-Length": data.length
    });

    res.end(req.method === "HEAD" ? undefined : data);
}

function resolveResource(rawUrl) {
    if (typeof rawUrl !== "string") return null;

    const rawPath = rawUrl.split("?")[0];

    if (!rawPath.startsWith("/") ||
        rawPath.startsWith("//")) {
        return null;
    }

    let decoded;

    try {
        decoded = decodeURIComponent(rawPath);
    } catch {
        return null;
    }

    if (/[\x00-\x1f\x7f\\%]/.test(decoded)) {
        return null;
    }

    if (decoded.includes("//")) {
        return null;
    }

    const parts = decoded.slice(1).split("/");

    if (parts.some(part =>
        part === "." ||
        part === ".." ||
        part.startsWith(".")
    )) {
        return null;
    }

    const name = decoded === "/"
        ? "index.html"
        : decoded.slice(1);

    if (!ALLOWED.has(name)) {
        return null;
    }

    let current = ROOT;

    try {
        for (const part of name.split("/")) {
            current = path.join(current, part);

            if (fs.lstatSync(current).isSymbolicLink()) {
                return null;
            }
        }

        const real = fs.realpathSync(current);
        const relative = path.relative(ROOT, real);

        if (
            relative === ".." ||
            relative.startsWith(".." + path.sep) ||
            path.isAbsolute(relative)
        ) {
            return null;
        }

        if (!fs.statSync(real).isFile()) {
            return null;
        }

        return real;
    } catch {
        return null;
    }
}

const server = http.createServer((req, res) => {
    headers(res);

    if (req.headers.host !== `${HOST}:${PORT}`) {
        return send(req, res, 403, "Forbidden");
    }

    if (!["GET", "HEAD"].includes(req.method)) {
        res.setHeader("Allow", "GET, HEAD");
        return send(req, res, 405, "Method Not Allowed");
    }

    if (req.url === "/__health") {
        return send(
            req,
            res,
            200,
            JSON.stringify({
                status: "ok",
                service: "moven-test-server",
                allowedFiles: ALLOWED.size
            }),
            "application/json; charset=utf-8"
        );
    }

    const file = resolveResource(req.url);

    if (!file) {
        return send(req, res, 404, "Not Found");
    }

    const type = MIME[
        path.extname(file).toLowerCase()
    ];

    if (!type) {
        return send(req, res, 415, "Unsupported Media Type");
    }

    fs.readFile(file, (error, data) => {
        if (error) {
            return send(req, res, 500, "Resource Read Error");
        }

        res.writeHead(200, {
            "Content-Type": type,
            "Content-Length": data.length
        });

        res.end(
            req.method === "HEAD" ? undefined : data
        );
    });
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 2000;

server.on("error", error => {
    console.error("TEST SERVER ERROR:", error.message);
    process.exitCode = 1;
});

let stopping = false;

function shutdown() {
    if (stopping) return;
    stopping = true;

    const timer = setTimeout(() => {
        server.closeAllConnections();
        process.exit(1);
    }, 5000);

    timer.unref();

    server.close(error => {
        clearTimeout(timer);
        console.log("MOVEN_TEST_SERVER_STOPPED");
        process.exitCode = error ? 1 : 0;
    });

    server.closeIdleConnections();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

server.listen(PORT, HOST, () => {
    console.log(
        `MOVEN_TEST_SERVER_READY http://${HOST}:${PORT}`
    );

    console.log("Allowed resources:", ALLOWED.size);
});

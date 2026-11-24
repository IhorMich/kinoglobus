/* Moven local backup storage, format version 1. */

(() => {
  "use strict";

  const FORMAT = "moven-backup";
  const VERSION = 1;

  const dataKeys = [
    "kgFavorites.v1",
    "kgBookmarks",
    "kgBookmarkFilms",
    "watched",
    "seen",
    "visited",
    "lastCC",
    "kgCinemaDiaryNotes",
    "kgCinemaDiaryDrafts",
    "kgReviews.v1",
    "kgPersonActions.v1",
    "kgCountryFavorites",
    "kg.releaseFollows.v1",
    "kgSearchHistory.v1",
    "kgSeries.watched",
    "kgSeries.bookmarks"
  ];

  const settingsKeys = [
    "kgAppTheme",
    "kgButtonAccent",
    "kgInterfaceLanguage",
    "kgFilmLanguage",
    "kgTrailerSubtitles",
    "kgWatchRegion",
    "kgGlobeQuality",
    "kgFavoritesLayout",
    "foldCats",
    "foldCatsDefaultApplied",
    "kgCinemaDiaryHideSpoilers",
    "kgCinemaDiaryRhythmCollapsed",
    "kgSeriesRegion",
    "kgSeriesMode",
    "kgHallTab.v1",
    "countryFilters",
    "cats",
    "year",
    "yearTo",
    "rmin",
    "rmax",
    "theme",
    "fx",
    "filmSpin",
    "reelStyle",
    "playMode",
    "surprise",
    "soundVolume",
    "snd",
    "reelSnd",
    "series.cats",
    "series.countryFilters",
    "series.year",
    "series.yearTo",
    "series.rmin",
    "series.rmax",
    "series.playMode",
    "series.surprise",
    "series.theme"
  ];

  const profileFields = [
    "name",
    "handle",
    "country",
    "city",
    "status",
    "bio",
    "avatar",
    "banner"
  ];

  const allowedKeys = new Set([
    ...dataKeys,
    ...settingsKeys
  ]);

  function isAllowedKey(key) {
    return allowedKeys.has(key) ||
      /^kgSeries\.(episodes|episodeNotes)\.v1\.\d+$/.test(key);
  }

  function readLocalData() {
    const result = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (!key || !isAllowedKey(key)) continue;

      const value = localStorage.getItem(key);

      if (value !== null) result[key] = value;
    }

    return result;
  }

  async function readProfile() {
    if (!window.KGProfileStorage?.readStrict) {
      throw new Error("Profile storage unavailable");
    }

    const saved = await window.KGProfileStorage.readStrict();

    if (!saved) return null;

    const result = {};

    for (const field of profileFields) {
      if (typeof saved[field] === "string") {
        result[field] = saved[field];
      }
    }

    if (typeof saved.privatePage === "boolean") {
      result.privatePage = saved.privatePage;
    }

    if (typeof saved.joinedAt === "number" &&
        Number.isFinite(saved.joinedAt)) {
      result.joinedAt = saved.joinedAt;
    }

    return result;
  }

  async function create() {
    return {
      format: FORMAT,
      version: VERSION,
      createdAt: new Date().toISOString(),
      profile: await readProfile(),
      localData: readLocalData()
    };
  }

  async function download() {
    const backup = await create();
    return downloadBackup(backup);
  }

  function downloadBackup(backup, prefix = "Moven-backup") {

    const json = JSON.stringify(backup, null, 2);

    const blob = new Blob(
      [json],
      {type: "application/json;charset=utf-8"}
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    const date = new Date().toISOString()
      .replace(/[:.]/g, "-");

    link.href = url;
    link.download = `${prefix}-${date}.json`;

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 30000);

    return {
      keys: Object.keys(backup.localData).length,
      bytes: blob.size,
      hasProfile: backup.profile !== null
    };
  }


  const MAX_BACKUP_BYTES = 50 * 1024 * 1024;

  function isObject(value) {
    return value !== null &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype;
  }


  const storageTypes = Object.freeze({
    "foldCats": "boolean",
    "foldCatsDefaultApplied": "boolean",
    "kg.releaseFollows.v1": "object",
    "kgAppTheme": "string",
    "kgBookmarkFilms": "object",
    "kgBookmarks": "array",
    "kgCinemaDiaryHideSpoilers": "boolean",
    "kgCinemaDiaryNotes": "object",
    "kgCinemaDiaryRhythmCollapsed": "boolean",
    "kgFavorites.v1": "object",
    "kgGlobeQuality": "raw",
    "kgPersonActions.v1": "object",
    "kgReviews.v1": "object",
    "kgSeries.bookmarks": "object",
    "kgSeries.watched": "object",
    "lastCC": "string",
    "seen": "array",
    "series.year": "string",
    "series.yearTo": "string",
    "visited": "object",
    "watched": "array",
    "year": "string",
    "yearTo": "string",
    "kgCountryFavorites": "array",
    "kgSearchHistory.v1": "array",
    "kgCinemaDiaryDrafts": "object",
    "kgButtonAccent": "string",
    "kgInterfaceLanguage": "string",
    "kgFilmLanguage": "string",
    "kgTrailerSubtitles": "string",
    "kgWatchRegion": "string",
    "kgFavoritesLayout": "string",
    "kgSeriesRegion": "raw",
    "kgSeriesMode": "raw",
    "kgHallTab.v1": "string",
    "countryFilters": "array",
    "cats": "array",
    "rmin": "string",
    "rmax": "string",
    "theme": "string",
    "fx": "boolean",
    "filmSpin": "boolean",
    "reelStyle": "string",
    "playMode": "string",
    "surprise": "string",
    "soundVolume": "number",
    "snd": "string",
    "reelSnd": "string",
    "series.countryFilters": "array",
    "series.cats": "array",
    "series.rmin": "string",
    "series.rmax": "string",
    "series.theme": "string",
    "series.playMode": "string",
    "series.surprise": "string"
  });



  function validateObjectSafety(value, depth = 0) {
    if (depth > 50) {
      throw new Error("Слишком глубокая структура данных");
    }

    if (value === null || typeof value !== "object") {
      return;
    }

    for (const [key, item] of Object.entries(value)) {
      if (["__proto__", "constructor", "prototype"].includes(key)) {
        throw new Error("Недопустимое свойство объекта: " + key);
      }

      validateObjectSafety(item, depth + 1);
    }
  }

  function validateNestedData(key, value) {
    const fail = () => {
      throw new Error("Повреждённая структура записей: " + key);
    };

    const validId = id =>
      Number.isSafeInteger(id) && id > 0;

    const objectMap = data =>
      isObject(data) &&
      Object.values(data).every(item => isObject(item));

    const filmRecord = item =>
      isObject(item) && validId(item.id);

    if (["kgBookmarks", "seen"].includes(key)) {
      if (!value.every(validId)) fail();
    }

    if (key === "watched") {
      if (!value.every(filmRecord)) fail();
    }

    if (["kgFavorites.v1", "kgBookmarkFilms"].includes(key)) {
      if (!objectMap(value) ||
          !Object.values(value).every(filmRecord)) fail();
    }

    if ([
      "kgSeries.watched",
      "kgSeries.bookmarks",
      "kgCinemaDiaryNotes",
      "kgCinemaDiaryDrafts",
      "kgPersonActions.v1"
    ].includes(key)) {
      if (!objectMap(value)) fail();
    }

    if (key === "kgReviews.v1") {
      if (!objectMap(value.reviews) ||
          !objectMap(value.drafts)) fail();
    }

    if (key === "kg.releaseFollows.v1") {
      if (!objectMap(value) ||
          !Object.values(value).every(item =>
            validId(item.id) &&
            typeof item.key === "string" &&
            typeof item.kind === "string"
          )) fail();
    }

    if (key === "visited") {
      if (!Object.values(value).every(item =>
        typeof item === "number" &&
        Number.isFinite(item) &&
        item >= 0
      )) fail();
    }

    if (key === "kgSearchHistory.v1") {
      if (!value.every(item =>
        typeof item === "string"
      )) fail();
    }

    if (/^kgSeries\.episodes\.v1\.\d+$/.test(key)) {
      if (!value.every(item =>
        typeof item === "string" &&
        /^\d+:\d+$/.test(item)
      )) fail();
    }

    if (/^kgSeries\.episodeNotes\.v1\.\d+$/.test(key)) {
      if (!objectMap(value)) fail();

      for (const [episodeKey, note] of Object.entries(value)) {
        if (!/^\d+:\d+$/.test(episodeKey) ||
            !isObject(note.series) ||
            !isObject(note.episode) ||
            !Number.isInteger(note.season) ||
            !Number.isInteger(note.episode.episode_number)) {
          fail();
        }

        if (episodeKey !==
            `${note.season}:${note.episode.episode_number}`) {
          fail();
        }
      }
    }
  }


  const settingOptions = Object.freeze({
    kgAppTheme: [
      "midnight", "cinematic", "oled",
      "golden-age", "steel", "cinema-amber"
    ],
    kgButtonAccent: [
      "blue", "cyan", "gold", "lavender", "coral"
    ],
    kgInterfaceLanguage: ["ru", "en"],
    kgFilmLanguage: ["auto", "ru", "en", "original"],
    playMode: ["filters", "surprise"],
    "series.playMode": ["filters", "surprise"],
    kgTrailerSubtitles: ["auto", "ru", "en", "off"],
    kgGlobeQuality: ["economy", "balanced", "maximum"],
    kgFavoritesLayout: ["list", "grid"],
    kgSeriesMode: ["original", "available"],
    "kgHallTab.v1": ["actors", "directors"]
  });

  function validateSetting(key, value) {

    if (key === "soundVolume" &&
        (!Number.isFinite(value) || value < 0 || value > 100)) {
      throw new Error("Некорректная громкость звука");
    }

    if (Object.hasOwn(settingOptions, key) &&
        !settingOptions[key].includes(value)) {
      throw new Error("Недопустимое значение настройки: " + key);
    }

    if (key === "kgSeriesRegion" &&
        !/^[A-Z]{2}$/.test(value)) {
      throw new Error("Некорректный регион сериалов");
    }

    if (key === "kgWatchRegion" &&
        value !== "auto" &&
        !/^[A-Z]{2}$/.test(value)) {
      throw new Error("Некорректный регион просмотра");
    }
  }

  function validateStorageValue(key, raw) {
    let expected = storageTypes[key];

    if (/^kgSeries\.episodes\.v1\.\d+$/.test(key)) {
      expected = "array";
    }

    if (/^kgSeries\.episodeNotes\.v1\.\d+$/.test(key)) {
      expected = "object";
    }

    if (expected === "raw") {
      validateSetting(key, raw);
      return;
    }

    if (!expected) {
      return;
    }

    let value;

    try {
      value = JSON.parse(raw);
    } catch {
      throw new Error("Повреждённые данные: " + key);
    }

    const actual = Array.isArray(value)
      ? "array"
      : value === null
        ? "null"
        : typeof value;

    if (actual !== expected) {
      throw new Error("Неверный тип данных: " + key);
    }

    validateSetting(key, value);
    validateObjectSafety(value);
    validateNestedData(key, value);
  }

  function validate(backup) {
    if (!isObject(backup)) {
      throw new Error("Некорректная структура файла");
    }

    if (backup.format !== FORMAT) {
      throw new Error("Это не резервная копия Moven");
    }

    if (backup.version !== VERSION) {
      throw new Error("Неподдерживаемая версия резервной копии");
    }

    if (typeof backup.createdAt !== "string" ||
        !Number.isFinite(Date.parse(backup.createdAt))) {
      throw new Error("Некорректная дата создания копии");
    }

    if (!isObject(backup.localData)) {
      throw new Error("Некорректное хранилище данных");
    }

    for (const [key, value] of Object.entries(backup.localData)) {
      if (!isAllowedKey(key)) {
        throw new Error("Недопустимый ключ: " + key);
      }

      if (typeof value !== "string") {
        throw new Error("Некорректное значение: " + key);
      }

      validateStorageValue(key, value);
    }

    if (backup.profile !== null) {
      if (!isObject(backup.profile)) {
        throw new Error("Некорректный профиль");
      }

      for (const [field, value] of Object.entries(backup.profile)) {
        if (profileFields.includes(field)) {
          if (typeof value !== "string") {
            throw new Error("Некорректное поле профиля: " + field);
          }

          if (["avatar", "banner"].includes(field) &&
              value !== "" &&
              !/^data:image\/(?:jpeg|png|webp|avif|gif);base64,[A-Za-z0-9+/]+={0,2}$/i.test(value)) {
            throw new Error("Некорректное изображение: " + field);
          }

        } else if (field === "privatePage") {
          if (typeof value !== "boolean") {
            throw new Error("Некорректная настройка приватности");
          }

        } else if (field === "joinedAt") {
          if (typeof value !== "number" ||
              !Number.isFinite(value) ||
              value <= 0) {
            throw new Error("Некорректная дата регистрации");
          }

        } else {
          throw new Error("Недопустимое поле профиля: " + field);
        }
      }
    }

    return {
      createdAt: backup.createdAt,
      version: backup.version,
      keys: Object.keys(backup.localData).length,
      hasProfile: backup.profile !== null,
      profileFields: Object.keys(backup.profile || {}).length,
      dataKeys: Object.keys(backup.localData)
        .filter(key => !settingsKeys.includes(key)).length,
      settingsKeys: Object.keys(backup.localData)
        .filter(key => settingsKeys.includes(key)).length
    };
  }

  async function readFile(file) {
    if (!(file instanceof Blob)) {
      throw new Error("Файл не выбран");
    }

    if (file.size === 0) {
      throw new Error("Файл пуст");
    }

    if (file.size > MAX_BACKUP_BYTES) {
      throw new Error("Размер файла превышает 50 МБ");
    }

    let backup;

    try {
      backup = JSON.parse(await file.text());
    } catch {
      throw new Error("Не удалось прочитать JSON-файл");
    }

    const summary = validate(backup);

    return {backup, summary};
  }


  async function previewRestore(backup) {
    const summary = validate(backup);
    const current = await create();

    const added = [];
    const replaced = [];
    const removed = [];
    const unchanged = [];

    const keys = new Set([
      ...Object.keys(current.localData),
      ...Object.keys(backup.localData)
    ]);

    for (const key of keys) {
      const existsNow = Object.hasOwn(current.localData, key);
      const existsInBackup = Object.hasOwn(backup.localData, key);

      if (!existsNow && existsInBackup) {
        added.push(key);
      } else if (existsNow && !existsInBackup) {
        removed.push(key);
      } else if (current.localData[key] !== backup.localData[key]) {
        replaced.push(key);
      } else {
        unchanged.push(key);
      }
    }

    return {
      mode: "replace",
      summary,
      added,
      replaced,
      removed,
      unchanged,
      profileAction: backup.profile === null
        ? "preserve"
        : current.profile === null
          ? "create"
          : "replace",
      counts: {
        added: added.length,
        replaced: replaced.length,
        removed: removed.length,
        unchanged: unchanged.length
      }
    };
  }


  function snapshotStorage(storage) {
    const result = {};

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);

      if (!key || !isAllowedKey(key)) continue;

      const value = storage.getItem(key);

      if (value !== null) result[key] = value;
    }

    return result;
  }

  function replaceStorage(storage, data) {
    const current = snapshotStorage(storage);

    for (const key of Object.keys(current)) {
      if (!Object.hasOwn(data, key)) {
        storage.removeItem(key);
      }
    }

    for (const [key, value] of Object.entries(data)) {
      if (!isAllowedKey(key)) {
        throw new Error("Недопустимый ключ: " + key);
      }

      if (storage.getItem(key) !== value) {
        storage.setItem(key, value);
      }
    }
  }

  function restoreLocalData(storage, backup) {
    validate(backup);

    const previous = snapshotStorage(storage);

    try {
      replaceStorage(storage, backup.localData);

      return {
        success: true,
        keys: Object.keys(backup.localData).length
      };

    } catch (error) {
      try {
        replaceStorage(storage, previous);
      } catch (rollbackError) {
        throw new AggregateError(
          [error, rollbackError],
          "Ошибка восстановления и отката"
        );
      }

      throw new Error(
        "Восстановление отменено. Предыдущие данные возвращены.",
        {cause: error}
      );
    }
  }


  function prepareRestoredProfile(current, backup) {
    validate(backup);

    if (backup.profile === null) {
      return current ?? null;
    }

    const next = {...(current || {})};

    const fields = [
      ...profileFields,
      "privatePage",
      "joinedAt"
    ];

    for (const field of fields) {
      delete next[field];

      if (Object.hasOwn(backup.profile, field)) {
        next[field] = backup.profile[field];
      }
    }

    return next;
  }


  async function createSafetyBackup() {
    const backup = await create();

    const downloadInfo = downloadBackup(
      backup,
      "Moven-before-restore"
    );

    return {
      backup,
      downloadInfo
    };
  }


  function sameStorage(a, b) {
    const keys = Object.keys(a);

    return keys.length === Object.keys(b).length &&
      keys.every(key =>
        Object.hasOwn(b, key) && a[key] === b[key]
      );
  }

  function sameProfile(a, b) {
    if (a === null || b === null) {
      return a === b;
    }

    return sameStorage(a, b);
  }

  function backupProfileFields(profile) {
    if (!profile) return null;

    const result = {};

    for (const field of profileFields) {
      if (typeof profile[field] === "string") {
        result[field] = profile[field];
      }
    }

    if (typeof profile.privatePage === "boolean") {
      result.privatePage = profile.privatePage;
    }

    if (typeof profile.joinedAt === "number" &&
        Number.isFinite(profile.joinedAt)) {
      result.joinedAt = profile.joinedAt;
    }

    return result;
  }

  let restoreInProgress = false;

  async function restoreCombined(
    storage,
    profileStore,
    backup,
    safetyBackup
  ) {
    if (restoreInProgress) {
      throw new Error("Восстановление уже выполняется");
    }

    restoreInProgress = true;

    try {
      backup = structuredClone(backup);
      safetyBackup = structuredClone(safetyBackup);

      validate(backup);
      validate(safetyBackup);

      if (!profileStore?.readStrict ||
          !profileStore?.write) {
        throw new Error("Хранилище профиля недоступно");
      }

      const currentProfile =
        await profileStore.readStrict();

      const previous = snapshotStorage(storage);

      if (!sameStorage(
        previous,
        safetyBackup.localData
      ) || !sameProfile(
        backupProfileFields(currentProfile),
        safetyBackup.profile
      )) {
        throw new Error(
          "Данные изменились. Создайте новую страховочную копию."
        );
      }

      const nextProfile = prepareRestoredProfile(
        currentProfile,
        backup
      );

      if (backup.profile !== null &&
          (typeof nextProfile?.name !== "string" ||
           !nextProfile.name.trim())) {
        throw new Error(
          "В резервной копии отсутствует имя профиля"
        );
      }

      const result = {
        success: true,
        keys: Object.keys(backup.localData).length,
        profileRestored: backup.profile !== null,
        reloadRequired: true
      };

      try {
        replaceStorage(storage, backup.localData);

        if (backup.profile !== null) {
          await profileStore.write(nextProfile);
        }

        return result;

      } catch (error) {
        try {
          replaceStorage(storage, previous);
        } catch (rollbackError) {
          throw new AggregateError(
            [error, rollbackError],
            "Ошибка восстановления и отката. Используйте страховочную копию."
          );
        }

        throw new Error(
          "Восстановление отменено. Предыдущие данные возвращены.",
          {cause: error}
        );
      }

    } finally {
      restoreInProgress = false;
    }
  }

  window.KGBackupStorage = Object.freeze({
    create,
    download,
    validate,
    readFile,
    previewRestore,
    restoreLocalData,
    prepareRestoredProfile,
    createSafetyBackup,
    restoreCombined,
    isAllowedKey
  });

})();

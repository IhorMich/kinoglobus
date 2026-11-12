(function () {
  const cards = [
    {
      id: "catharsis", icon: "water_drop", image: "assets/vibes/catharsis.jpg",
      title: "«Поплакать и отпустить»", tag: "#Катарсис #Прощание",
      description: "Пронзительные истории о прощании, утрате и примирении.",
      countries: ["US", "GB", "FR", "JP"], genres: [18], keywords: ["grief", "mourning"],
      labels: ["🇺🇸 США", "🇬🇧 Великобритания", "🇫🇷 Франция", "🇯🇵 Япония"], genreLabel: "Драма"
    },
    {
      id: "chemistry", icon: "favorite", image: "assets/vibes/chemistry.jpg",
      title: "«Искра между ними»", tag: "#Романтика #Химия",
      description: "Случайные встречи, флирт и признания, которых ждёшь весь фильм.",
      countries: ["US", "FR", "KR", "GB"], genres: [10749],
      labels: ["🇺🇸 США", "🇫🇷 Франция", "🇰🇷 Южная Корея", "🇬🇧 Великобритания"], genreLabel: "Романтика"
    },
    {
      id: "goosebumps", icon: "dark_mode", image: "assets/vibes/goosebumps.jpg",
      title: "«Мурашки в темноте»", tag: "#Хоррор #Готика",
      description: "Тени в коридоре, странные звуки и страх, который нарастает постепенно.",
      countries: ["US", "GB", "JP", "ES"], genres: [27], keywords: ["haunted house", "ghost", "psychological horror"],
      labels: ["🇺🇸 США", "🇬🇧 Великобритания", "🇯🇵 Япония", "🇪🇸 Испания"], genreLabel: "Хоррор"
    },
    {
      id: "roadtrip", icon: "route", image: "assets/vibes/roadtrip.jpg",
      title: "«Хочется в дорогу»", tag: "#РоудМуви #Свобода",
      description: "Попутчики, придорожные мотели и пейзажи за окном. Иногда дорога меняет всё.",
      countries: ["US", "FR", "DE", "AU"], genres: [18, 35, 12], keywords: ["road trip"],
      labels: ["🇺🇸 США", "🇫🇷 Франция", "🇩🇪 Германия", "🇦🇺 Австралия"], genreLabel: "Роуд-муви"
    },
    {
      id: "awkward-comedy", icon: "theater_comedy", image: "assets/vibes/awkward-comedy.jpg", imagePosition: "50% 41%",
      title: "«Неловко, но смешно»", tag: "#Сатира #ЧёрныйЮмор",
      description: "Неловкие ужины, неуместные реплики и герои, которые сами загоняют себя в угол.",
      countries: ["GB", "US", "FR", "SE"], genres: [35], keywords: ["dark comedy", "black humor", "satire"],
      labels: ["🇬🇧 Великобритания", "🇺🇸 США", "🇫🇷 Франция", "🇸🇪 Швеция"], genreLabel: "Чёрная комедия · Сатира"
    },
    {
      id: "deep-space", icon: "rocket_launch", image: "assets/vibes/deep-space.jpg", imagePosition: "50% 53%",
      title: "«Далеко от Земли»", tag: "#Космос #НаучнаяФантастика",
      description: "Одиночество на орбите, дальние экспедиции и первый контакт.",
      countries: ["US", "GB", "CA", "JP"], genres: [878], keywords: ["space travel", "astronaut", "space station", "first contact"],
      labels: ["🇺🇸 США", "🇬🇧 Великобритания", "🇨🇦 Канада", "🇯🇵 Япония"], genreLabel: "Научная фантастика"
    },
    {
      id: "last-second", icon: "timer", image: "assets/vibes/last-second.jpg", imagePosition: "50% 78%",
      title: "«До последней секунды»", tag: "#Триллер #ГонкаСоВременем",
      description: "Срок истекает. Один неверный шаг может всё изменить.",
      countries: ["US", "GB", "KR", "FR"], genres: [53], keywords: ["race against time", "hostage", "countdown"],
      labels: ["🇺🇸 США", "🇬🇧 Великобритания", "🇰🇷 Южная Корея", "🇫🇷 Франция"], genreLabel: "Триллер"
    }
  ];

  const details = {
    catharsis: {
      crumb: "Прощание и примирение", pill: "ДАТЬ ВОЛЮ ЭМОЦИЯМ",
      badge: ["water_drop", "До слёз"], tags: ["#Катарсис", "#Прощание", "#Память", "#Примирение"],
      heading: "Поплакать и отпустить",
      hero: "Письма, которые так и не отправили, последние встречи и люди, которые учатся жить дальше.",
      effect: ["water_drop", "Катарсис"], projector: "Кинопроектор драм", spin: "Крутить этот вайб (Случайная драма)",
      chips: [["mail", "text-primary", "Прощание"], ["history", "text-secondary", "Память"], ["favorite", "text-primary-fixed-dim", "Близкие люди"], ["spa", "text-tertiary", "Примирение"]],
      coll: "Истории, которые трогают до слёз", sub: "Драмы о потере и принятии", short: "До слёз", shortSub: "Катарсис"
    },
    chemistry: {
      crumb: "Встречи и признания", pill: "ИСКРА МЕЖДУ НИМИ",
      badge: ["favorite", "Химия героев"], tags: ["#Романтика", "#Флирт", "#Встречи", "#Признания"],
      heading: "Искра между ними",
      hero: "Взгляд через столик, разговор, который не хочется заканчивать, и герои, за которых болеешь с первой встречи.",
      effect: ["favorite", "Влюблённость"], projector: "Кинопроектор романтики", spin: "Крутить этот вайб (Случайная романтика)",
      chips: [["coffee", "text-primary", "Случайные встречи"], ["chat_bubble", "text-secondary", "Флирт"], ["bolt", "text-primary-fixed-dim", "Химия героев"], ["favorite", "text-tertiary", "Признания"]],
      coll: "Фильмы с искрой", sub: "Романтика и сильная химия между героями", short: "Искра", shortSub: "Романтика"
    },
    goosebumps: {
      crumb: "Готика и страх", pill: "МУРАШКИ В ТЕМНОТЕ",
      badge: ["dark_mode", "Нарастающий страх"], tags: ["#Хоррор", "#Готика", "#Призраки", "#Саспенс"],
      heading: "Мурашки в темноте",
      hero: "Запертые комнаты, старые дома и ощущение, что кто-то стоит за дверью. Тревога растёт от сцены к сцене.",
      effect: ["visibility", "Тревога"], projector: "Кинопроектор ужасов", spin: "Крутить этот вайб (Случайный хоррор)",
      chips: [["door_front", "text-primary", "Дома с тайной"], ["dark_mode", "text-secondary", "Готическая атмосфера"], ["visibility", "text-primary-fixed-dim", "Сверхъестественное"], ["hourglass_bottom", "text-tertiary", "Нарастающий страх"]],
      coll: "Хорроры для тёмного вечера", sub: "Призраки и психологические ужасы", short: "Мурашки", shortSub: "Хоррор"
    },
    roadtrip: {
      crumb: "Дорога и попутчики", pill: "ХОЧЕТСЯ В ДОРОГУ",
      badge: ["route", "Открытая дорога"], tags: ["#РоудМуви", "#Попутчики", "#Свобода", "#Пейзажи"],
      heading: "Хочется в дорогу",
      hero: "Шоссе до горизонта, случайные попутчики и разговоры в пути. Истории, в которых поездка меняет героев.",
      effect: ["explore", "Свобода"], projector: "Дорожный кинопроектор", spin: "Крутить этот вайб (Случайное роуд-муви)",
      chips: [["route", "text-primary", "Открытая дорога"], ["group", "text-secondary", "Попутчики"], ["landscape", "text-primary-fixed-dim", "Пейзажи"], ["explore", "text-tertiary", "Новые маршруты"]],
      coll: "Фильмы в дороге", sub: "Поездки, которые меняют планы и людей", short: "В дорогу", shortSub: "Роуд-муви"
    },
    "awkward-comedy": {
      crumb: "Сатира и неловкость", pill: "НЕЛОВКО, НО СМЕШНО",
      badge: ["theater_comedy", "Чёрный юмор"], tags: ["#Сатира", "#ЧёрныйЮмор", "#Неловкость", "#Абсурд"],
      heading: "Неловко, но смешно",
      hero: "За парадным столом разговор заходит слишком далеко. Сатира и чёрные комедии о людях, которые сами создают себе проблемы.",
      effect: ["theater_comedy", "Ирония"], projector: "Кинопроектор сатиры", spin: "Крутить этот вайб (Случайная сатира)",
      chips: [["restaurant", "text-primary", "Неловкие ужины"], ["chat_bubble", "text-secondary", "Колкие реплики"], ["theater_comedy", "text-primary-fixed-dim", "Чёрный юмор"], ["groups", "text-tertiary", "Социальная сатира"]],
      coll: "Комедии с неудобными моментами", sub: "Чёрный юмор и сатира", short: "Неловко", shortSub: "Чёрный юмор"
    },
    "deep-space": {
      crumb: "Космос и первый контакт", pill: "ДАЛЕКО ОТ ЗЕМЛИ",
      badge: ["rocket_launch", "В открытом космосе"], tags: ["#Космос", "#Орбита", "#ПервыйКонтакт", "#Экспедиции"],
      heading: "Далеко от Земли",
      hero: "На орбите каждый выход из корабля меняет перспективу. Фильмы о дальних миссиях, одиночестве и встречах с неизвестным.",
      effect: ["explore", "Удивление"], projector: "Космический кинопроектор", spin: "Крутить этот вайб (Случайная фантастика)",
      chips: [["rocket_launch", "text-primary", "Дальние миссии"], ["satellite_alt", "text-secondary", "Орбитальные станции"], ["public", "text-primary-fixed-dim", "Другие планеты"], ["sensors", "text-tertiary", "Первый контакт"]],
      coll: "Фильмы о космосе", sub: "Научная фантастика об орбите и дальних экспедициях", short: "Космос", shortSub: "Фантастика"
    },
    "last-second": {
      crumb: "Гонка со временем", pill: "ДО ПОСЛЕДНЕЙ СЕКУНДЫ",
      badge: ["timer", "Время на исходе"], tags: ["#Триллер", "#Дедлайн", "#Переговоры", "#Выживание"],
      heading: "До последней секунды",
      hero: "Телефон вот-вот замолчит, срок истекает, а правильного решения всё ещё нет. Триллеры, где напряжение держится на выборе героев.",
      effect: ["timer", "Напряжение"], projector: "Кинопроектор триллеров", spin: "Крутить этот вайб (Случайный триллер)",
      chips: [["timer", "text-primary", "Обратный отсчёт"], ["forum", "text-secondary", "Переговоры"], ["shield", "text-primary-fixed-dim", "Спасти других"], ["gavel", "text-tertiary", "Трудный выбор"]],
      coll: "Триллеры против времени", sub: "Фильмы, в которых важна каждая секунда", short: "До секунды", shortSub: "Триллер"
    }
  };

  async function discoverFilters(mood, searchKeywords) {
    const filters = {with_genres: mood.genres.join("|")};
    if (!mood.keywords?.length) return filters;

    const results = await Promise.all(mood.keywords.map(query => searchKeywords(query)));
    const ids = results.flatMap((result, index) => {
      const query = mood.keywords[index];
      return (result.results || [])
        .filter(item => item.name?.toLowerCase() === query && Number.isInteger(item.id))
        .map(item => item.id);
    });
    if (!ids.length) throw new Error("TMDB не нашёл тематические метки для этого вайба. Попробуйте ещё раз.");
    return {...filters, with_keywords: [...new Set(ids)].join("|")};
  }

  window.KGMoodVibeAdditions = {cards, details, discoverFilters};
})();

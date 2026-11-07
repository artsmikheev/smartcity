# Реализация MVP ЖК «Умный город»

- [x] **Собрать mobile-first клиентский контур и навигацию:** приложение использует фиксированный Expo Router / React Native / TypeScript starter; в нижней навигации доступны «Главная», «Планировки», «Стройка» и «Профиль»; экраны рассчитаны на portrait и сценарий быстрого просмотра одной рукой.
- [x] **Сделать главный экран для быстрого входа в проект:** главная показывает ценность проекта, заметный CTA, компактный статус проекта, быстрые действия для консультации и планировки, переходы в «О проекте» и контакты; неподтверждённые цифры не представлены как факты.
- [x] **Сделать каталог планировок:** экран содержит фильтры по комнатности, карточки вариантов, маркировку демонстрационных/проверяемых данных и CTA для запроса деталей; карточка не утверждает цены или наличие и ведёт в форму заявки.
- [x] **Сделать ход строительства:** экран содержит статус «на проверке», ленту по этапам, подписи источника/даты и CTA на получение обновлений; не подтверждённые сроки и проценты не выдаются за реальные показатели.
- [x] **Сделать заявку на консультацию/подбор/планировку:** форма принимает имя, телефон, удобный канал, комментарий и согласие; клиентская валидация не пропускает короткое имя, некорректный телефон и отсутствие согласия; повторный tap блокируется, после отправки показывается понятное подтверждение с demo-ID и следующим шагом.
- [x] **Сделать информационные разделы:** доступны «О проекте», «Контакты», «FAQ»; в контактах есть Telegram/MAX, FAQ раскрывается по tap, а контент помечен как управляемый и требующий подтверждения.
- [x] **Добавить безопасную telemetry-ready абстракцию:** события экранов, CTA, фильтров и отправки заявки типизированы в `lib/telemetry.ts`; connection string и секреты не попадают в мобильный bundle.
- [x] **Подготовить route manifest и брендовые токены:** `public/manus-routes.json` перечисляет маршруты MVP; интерфейс и native-иконка используют палитру из брендбука SmartCity_BB_sketch_CORR9_26.02.26.pdf: `#484848`, `#EDEAE4`, `#B88F00`, `#8A8887`.
- [ ] **Подключить production-контур лидов:** сервер должен создавать уникальный ID и время лида, валидировать данные, сохранять в CRM, уведомлять ответственного через Telegram Bot API, поддерживать retry/журнал/антиспам и push для авторизованных клиентов.
- [ ] **Подключить управляемые данные, RBAC и CRM:** администратор без релиза меняет квартиры, планировки, цены, статусы, акции, новости, стройку, медиа, контакты, push, FAQ и тексты согласий; роли гостя, клиента, менеджера, контент-менеджера, руководителя, брокера и администратора получают ограничения доступа; CRM включает канбан, карточки, задачи, SLA, источники, аналитику и аудит.
- [ ] **Определить Azure App Insights hosting:** брендбук и палитра уже применены; остаётся определить Azure-хостинг и ресурс App Insights, после чего подключить серверную отправку telemetry через защищённую конфигурацию.
- [x] **Добавить визуальный экран концептов в смартфон-рамке:** `/concepts` показывает три варианта на основе существующих визуализаций проекта — «Двор», «Наукоград» и «Вечер» — с переключателями, CTA в планировки и маркировкой визуализаций как концептных материалов.

## Recovery R1.2 — фундамент, без редизайна экранов

- [x] **Токены:** app-data.ts экспортирует только COLORS, TYPOGRAPHY, SPACING, RADIUS с буквальными значениями из pasted_content_18; sans fontFamily undefined; mock-данные сохранены отдельно в mock-data.ts. theme.ts — только реэкспорт четырёх объектов; все runtime-потребители используют constants/theme, без старых Colors/Fonts и без дублей цвета.
- [x] **SQL типы и клиент:** types/db.ts отражает 7 enum union и все поля 16 таблиц восстановленной 0001_init.sql, правильную nullable/default семантику Row/Insert/Update и Database для supabase-js; Functions.submit_lead Args/Returns и has_role типизированы, без as never. lib/supabase.ts использует URL polyfill, AsyncStorage и guard supabaseConfigured, placeholder при отсутствии env; никаких секретов в Git.
- [x] **Шрифт и навигация:** PlayfairDisplay_400Regular загружается через useFonts, Stack и провайдеры сохраняются. Глобальная pill: left/right 20, bottom 20+safe area, height 64, radius 32, rgba(28,27,26,0.95), тень 0 8 24 rgba(0,0,0,0.4); активный круг 36/иконка 20, неактивные outline 22, подписи 10, 4 существующих таба Главная/Планировки/Стройка/Профиль: пользователь запретил создавать Избранное в R1.2. Pressable role tab, selected state, hit area высотой 64; ScrollView content paddingBottom 130.
- [x] **Проверки и страховка:** pnpm check/lint/test PASS без отключения существующих тестов; Expo Web screenshot 375×812 существующего экрана с pill и золотым кругом. Commit R1.2 и tag recovery-r1.2 опубликованы на github, SHA проверена. ApartmentCard, каталог/detail/home/lead не перерисовывать; никаких SQL/backend изменений. После отчёта стоп до приёмки.

## Recovery R1.3 — ApartmentCard и каталог по числовой спецификации

- [x] **Git-барьер R1.2:** перед любыми изменениями R1.3 попытка A (sleep30, обычный git push github main) должна сохранить ed1067c на github/main; recovery-r1.2 опубликован и проверен ls-remote. Выполнено 07.11.2026, попытка A успешна; helper MODULE_NOT_FOUND не препятствует fallback push.
- [x] **Horizontal ApartmentCard:** height160, padding16, radius20, cardBackground; flex columns55/45, gap12. Transparent shadow wrapper offset0/8, radius16, opacity.35, elevation6 без overflow:hidden; clip wrapper full width/height, overflow:hidden radius20 bgcardBackground padding16. Title Playfair20/25 foreground, numberOfLines2 и осмысленный перенос «1-комнатная\n38 м²»; meta11 uppercase letterSpacing.5 muted numberOfLines1 сокращённый без обрезки; price sans22 weight700 foreground, ru-RU currency RUB без дробей. Image area45%, aspect1, fit height, radius12 cover, apartment.plan_path через resolver asset/http/otherwise-null. Heart absolute top/right12 относительно карточки, 48×48 Pressable padding2; visual44 radius22 rgba(28,27,26,.7), Ionicons20 muted/accent, button role selected state и label добавить/убрать. Никаких demo/status badges, apartment numbers или arrows.
- [x] **Каталог:** safe top, eyebrow «НАУКОГРАД / РЕУТОВ»11 uppercase muted tracking1, gap8 до title «Планировки» Playfair36/40 tracking-.5; filter-outline20 в круге44 border1 border. Gap24 до subtitle «Тишина, свет, честные метры.»15 muted1line, gap24 до modes Квартиры/Чертежи sans14 weight500 gap24; activeforeground underline2 accent bottompadding8, inactive muted, никаких pill/fill. Gap32 до sort: N вариантов13 muted / «Сначала дешевле»13 foreground с Ionicons chevron. Gap16 до FlatList horizontal cards separator16 paddingBottom130. Content footer после списка: marginTop32, divider1 border, gap12 до «Материалы, цены и наличие уточняются командой проекта.»11 muted centered2lines. Demo labels только footer, не cards.
- [x] **Четыре состояния и рабочие действия:** content, loading ровно3 card-shaped skeleton160/radius20/cardBackground и muted blocks opacity.5 без shimmer/spinner; empty icon48 muted круг, «Ничего не найдено»Playfair22 + «Измените фильтры»15muted + secondary52 reset; error icon48error, «Не удалось загрузить»Playfair22 + «Проверьте соединение»15muted + primary52 retry. supabaseConfigured false по умолчанию → error «Сервис временно недоступен», затем loading/empty/content. Для evidence разрешён явный dev-preview production layouts с demo seed-данными из mock-data.ts, никогда молчаливый fake backend. Реальные фильтры/reset, price sort и heart state; не добавлять новые маршруты.
- [x] **Scope, evidence, Git:** только ApartmentCard/layouts и минимальные каталожные data/resolver/test helpers. Без gradients, дополнительных shadows, text glyph icons. Tab bar, detail/home/favorites/lead, SQL и backend не менять. pnpm check/lint/test PASS, Expo Web375×812 content/loading/empty/error (карточки работают) и contrast cardBackground/foreground, muted/cardBackground, accent/foreground, accentForeground/accent. Commit «R1.3: redesign ApartmentCard and catalog screen», push github main, recovery-r1.3 tag и push tags с проверкой SHA. Если push снова падает — bundle и стоп. После screenshot/report — стоп до приёмки, R1.4 не начинать.

- [ ] **Визуальная приёмка R1.3:** после четырёх screenshots и final report ждать ответа пользователя; не начинать R1.4/detail/home/lead/Package2.

## Recovery R1.4 — полный принятый контракт

- [ ] **Часть A — 3 fixes каталога.**
## ЧАСТЬ A — 3 фикса каталога

### Фикс 1 — планировки в карточках вместо фото улиц

Проблема: сейчас в ApartmentCard стоит concept-фото ЖК. Пользователь
видит «1-комнатная 38 м²» + фасад. Это сбивает.

Решение: сгенерировать 5 SVG-планировок в стиле Image 4 (blueprint,
тёмный фон, тонкие золотые линии, комнаты с подписями). Это не
«выдуманные чертежи» — это schematic placeholder, явно помеченный
как «Схема». В footer уже есть "Демо-данные · концептные изображения,
не планировки" — обнови до "Схематичные планировки, демо-данные".

Создай 5 SVG-файлов в assets/images/plans/:
- studio-25.svg (25 м²)
- one-room-38.svg (38 м²)
- two-room-55.svg (55 м²)
- two-room-62.svg (62 м²)
- three-room-78.svg (78 м²)

Стиль каждого:
- background #121212
- Сетка rgba(184,143,0,0.06) шагом 8px
- Стены: stroke #B88F00 2px, заливка rgba(184,143,0,0.04)
- Комнаты: прямоугольники с подписями (СПАЛЬНЯ, КУХНЯ, ГОСТИНАЯ)
  sans 8px muted #BCB9B7, uppercase
- Дверные проёмы: разрыв в стене (stroke-dasharray) 6px
- Мебель схематично: кровать (прямоугольник), стол (круг)
  тонкими линиями muted

Пропорции: реалистичные для метража. Студия — почти квадрат,
3-комнатная — вытянутая.

Обнови resolveMediaUrl: asset://plans/*.svg → require() локально.
Проверь, что SVG рендерится в Expo Web и RN (react-native-svg
уже должен быть, если нет — pnpm add react-native-svg).

В seed.sql plan_path уже верный (asset://plans/*.png) — поменяй
на .svg в seed. Перепримени seed через psql.

### Фикс 2 — усилить тень карточки (только карточка, не везде)

На тёмном фоне тень 0 8 16 opacity 0.35 не читается. Увеличить
только для ApartmentCard:

- shadowOffset: { width: 0, height: 10 }
- shadowRadius: 24
- shadowOpacity: 0.55 (было 0.35)
- elevation: 8 (было 6)
- Плюс тонкая граница: borderWidth: 1, borderColor: '#2E2C2A'
  (чуть светлее cardBackground, чтобы дать объём)

Tab bar НЕ трогать — там тень работает.
Остальные карточки (home, detail) — в их фазах.

### Фикс 3 — heart contrast на светлом фото

Проблема: золотой heart на светлом участке фото = 2.11:1 FAIL.

Решение: усилить подложку heart.

- bg: rgba(28,27,26,0.85) (было 0.7)
- Плюс тонкая граница: borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)'
- Плюс drop-shadow для иконки: не через shadow, а через
  двойной рендер (второй heart на 1px ниже с color rgba(0,0,0,0.3))

Проверь contrast:
- muted #BCB9B7 на new bg (0.85 opacity + white worst) ≥ 3:1
- accent #B88F00 на new bg (0.85 opacity + white worst) ≥ 3:1

Если 3:1 не достигается — эскалируй, не меняй цвета.


- [x] **Часть B — Detail/Home/Favorites/Lead/Success.**
## ЧАСТЬ B — R1.4

### Detail (app/apartment/[id].tsx — создать)

Структура по detail.html + Image 1:
[Safe top]
[Hero 55% высоты экрана ≈ 440px]
  Фото интерьера (apartment-terrace.webp) или plan SVG
  Gradient снизу: transparent → background, 60%-100%
  Кнопки floating поверх hero:
    Слева [←] в круге 44, bg rgba(28,27,26,0.7)
    Справа [♡][⋯] в кругах 44, тот же bg, gap 8
  Текст поверх gradient внизу:
    Meta 11 uppercase muted «8 ЭТАЖ · КОРПУС 1 · 55 М²»
    Title Playfair 32 foreground «2-комнатная квартира»

[Контент, padding top 24]
  Price: sans 34 bold foreground «15 800 000 ₽»
  Status: 13 accent «В продаже»
  16px
  Primary CTA 52px full width «Оставить заявку» gold,
    переход на /lead?type=apartment&apartment_id=xxx
  32px
  Section «О квартире»:
    Заголовок Playfair 22
    Facts grid 2 колонки: Площадь / Этаж / Корпус / Отделка
  32px
  Section «Планировка»:
    Заголовок Playfair 22
    Blueprint SVG (тот же, что в карточке), radius 12,
    на тёмном #121212, aspect 1:1
  32px
  Section «Похожие квартиры» (горизонтальный скролл):
    3 ApartmentCard compact variant (создай compact: 280×140,
    image слева 112×112, title/meta/price справа)

[Sticky CTA bottom: gradient + кнопка «Оставить заявку» 52px]
  Не перекрывает контент: paddingBottom контента 120px

Состояния: content, not-found («Квартира не найдена», кнопка
«Вернуться в каталог»)

Роут добавь в app/_layout.tsx (Stack) и public/manus-routes.json.

### Home (app/(tabs)/index.tsx — переписать)

[Safe top]
Хедер:
  Слева eyebrow «НАУКОГРАД / РЕУТОВ» 11 uppercase muted
  Title Playfair 36 «Умный город»
  Справа колокольчик Ionicons notifications-outline 22 в круге 44

[Hero 260px, radius 20, marginHorizontal 20]
  Фото reutov-urban-day-concept.jpg
  Gradient снизу: transparent 30% → background 100%
  Поверх:
    Title Playfair 28 foreground «Дом для новых планов»
    4px
    Subtitle 15 muted «Современная среда в Наукограде»
  Под hero (вне градиента) 8px:
    Disclaimer 11 muted italic «Визуализация. Не является
    публичной офертой.»

[32px]
[Quick actions, grid 3 колонки, gap 8, marginHorizontal 20]
  Каждая: 88px высота, radius 12, bg cardBackground,
    icon Ionicons 24 accent, label 11 foreground
  «Подобрать квартиру» / «Узнать условия» / «Заказать звонок»
  Тапы → /layouts, /lead?type=price_request, /lead?type=manager_call

[32px]
[Section «Избранное»] — только если favorites.length > 0
  Заголовок Playfair 22 + «Все →» 13 accent справа
  ApartmentCard compact × N (горизонтальный скролл)

[32px]
[Section «Ход строительства»]
  Заголовок Playfair 22 + «Все отчёты →» 13 accent справа
  Мини-карточка 100% × 120, bg cardBackground, radius 16:
    Изображение 96×96 radius 12 слева (reutov-urban-evening)
    Справа: title «Октябрь 2026» 15 weight 500,
      meta «Обновлено 3 дня назад» 11 muted

[32px]
[Section «Акции»]
  Заголовок Playfair 22 + «Все →» 13 accent
  Horizontal scroll 2 карточки 260×200:
    Изображение 260×120 radius 16 сверху
    Ниже 12: title Playfair 18, meta 11 muted

[Safe bottom 130 (под tab bar)]
[Demo footer]

### Favorites (app/(tabs)/favorites.tsx — создать)

[Safe top]
Title Playfair 36 «Избранное»
8px
«3 квартиры» 13 muted
24px
FlatList ApartmentCard horizontal
32px
Empty state: heart icon 48 в круге muted, «Пока пусто»
Playfair 22, «Сохраняйте понравившиеся варианты» 15 muted,
кнопка «Открыть планировки» secondary 52

### Lead (app/lead.tsx — переписать)

По package-1.html:
[Safe top]
Хедер: [×] закрыть в круге 44 справа
Kicker 11 uppercase muted «КОНСУЛЬТАЦИЯ» или «ИПОТЕКА» или
  «КВАРТИРА» в зависимости от type
Title Playfair 28 «Оставить заявку» / «Узнать условия»
8px
Body 15 muted «Расскажем о проекте и подберём следующий шаг»

[24px]
Поле Input name: label 11 uppercase muted «ИМЯ»,
  input 52 radius 12 bg cardBackground border #9A9896,
  placeholder muted, font 16
Поле Input phone: label «НОМЕР ТЕЛЕФОНА»,
  формат +7 (___) ___-__-__ маска
Radio group каналов: label «КАНАЛ СВЯЗИ»,
  2 опции: «Позвонить» / «Написать в Telegram»
  Каждая 56px radius 12 border #9A9896, активная border accent
    bg rgba(184,143,0,0.12), иконка radio в кружке
Checkbox согласия: 22×22 checkbox, label 11 muted,
  ссылка «согласие на обработку» accent underline,
  touch 44×44
[24px]
Primary CTA 52 «Отправить» gold, полная ширина

Состояния:
- default: пустая форма
- validation-error: border error + текст 11 error под полем +
  inline-error сверху
- submitting: CTA disabled + ActivityIndicator

### Lead success (app/lead/success.tsx — создать)

Центрированный экран:
Check icon 64 в круге gold, «Заявка принята» Playfair 28,
«Спасибо. Менеджер свяжется с вами» 15 muted,
блок с номером заявки 18 mono foreground в bg cardBackground,
primary «Вернуться в приложение» 52,
secondary «Посмотреть планировки» 52
Без tab bar (это финальный экран flow)


- [ ] **Scope и handoff R1.4.**
## ЧАСТЬ C — Что не делать

- НЕ добавлять градиенты везде (только hero detail + home, sticky CTA)
- НЕ менять tab bar (принят R1.2)
- НЕ трогать catalog композицию (только 3 фикса из Части A)
- НЕ использовать текстовые символы (только Ionicons)
- НЕ выдумывать планировки/цены (только из seed)
- НЕ отключать существующие состояния (loading/empty/error)

## ЧАСТЬ D — Проверки и отчёт

1. pnpm check/lint/test PASS
2. Скриншоты Expo Web 375×812:
   - catalog с новыми SVG-планировками в карточках
   - detail content + not-found
   - home с hero (с фото ЖК)
   - favorites content + empty
   - lead default + validation + submitting
   - success
3. contrast.mjs на всех новых парах
4. Git:
   git add -A
   git commit -m "R1.4: detail, home, favorites, lead + catalog fixes"
   git push github main
   git tag recovery-r1.4
   git push github --tags

## СТОП

После скриншотов — стоп. Если push упадёт — bundle и стоп.
Не начинай Package 2 (blog, promos, construction, contacts).
### R1.4 итог верификации (07.11.2026)

- [x] Код трёх catalog fixes, пять schematic SVG, idempotent seed local PASS; Web rendering verified.
- [x] Production screenshots всех новых экранов и 4catalog states; no HTML/QA mocks.
- [x] Check/lint/test PASS:177 passing+1 прежний skipped; Android bundle5SVG.
- [x] Контраст semantic pairs AA PASS, hero metadata8.139, 59controls≥48.
- [ ] Actual Android/iOS device визуал/аппаратный back: не подтверждены bundle-сборкой.
- [ ] GitHub release main+recovery-r1.4: подтвердить фактический remote SHA после push.
- [ ] Визуальная приёмка пользователем. Package2/серверный backend не начинать.

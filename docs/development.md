# Разработка

Как запустить, как устроен репозиторий и что делать, когда хочется что-то
поменять. Правила оформления и текста — в [`design.md`](design.md), устройство
кода — в [`architecture.md`](architecture.md).

## Запуск

Нужен Node 22+ и pnpm. Версия Node проверяется строго (`.npmrc`:
`engine-strict=true`).

```sh
pnpm install
pnpm dev        # http://localhost:5173
```

### С телефона

`pnpm dev --host` поднимает сервер на всех интерфейсах и печатает адрес вида
`http://192.168.x.x:5173` — его и открывают с телефона в той же сети. Так
проверяют вёрстку на настоящем экране: safe-зоны из `env()` там нулевые, пока не
открыто standalone-приложение, поэтому нижняя навигация в браузере телефона
увидит только `env(safe-area-inset-bottom)`, а не верхний вырез.

По локалке не зарегистрируется service-worker и не поставится PWA: `http://` на
не-localhost адресе не secure context. Для этого нужен https — то есть хостинг.

## Команды

| Команда             | Что делает                                 |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | dev-сервер                                 |
| `pnpm dev --host`   | dev-сервер, доступный с телефона           |
| `pnpm build`        | сборка и пререндер всех страниц в `build/` |
| `pnpm preview`      | локальный просмотр собранного сайта        |
| `pnpm check`        | `svelte-check` + тайпчек                   |
| `pnpm check:watch`  | то же самое в watch-режиме                 |
| `pnpm lint`         | prettier, eslint **и проверка токенов**    |
| `pnpm check:tokens` | только проверка токенов                    |
| `pnpm test`         | vitest                                     |
| `pnpm format`       | prettier --write                           |
| `pnpm screenshots`  | переснять скриншоты для README             |
| `pnpm icons`        | пересобрать иконки и манифест из `refs/`   |

`pnpm test:unit` — тот же vitest в watch-режиме.

### Перед коммитом

```sh
pnpm check && pnpm lint && pnpm test
```

Три команды обязательны. `pnpm lint` включает `scripts/check-contrast.mjs`: он
читает `tokens.css`, разбирает обе темы и прогоняет зарегистрированные в нём
пары «текст/графика на фоне» по формуле WCAG, а затем инварианты токенов. Провал
роняет линт.

## Стек

SvelteKit 5 (runes) · TypeScript · `adapter-static` · `unplugin-icons` +
Iconify.

**Без Tailwind, без CSS-in-JS, без препроцессоров.** Только `<style>` в каждом
компоненте и дизайн-токены в `src/lib/styles/tokens.css`.

### Где лежит конфиг

`svelte.config.js` в проекте нет. Вся конфигурация SvelteKit передаётся прямо в
плагин из `vite.config.ts`:

```ts
sveltekit({
  compilerOptions: { runes: ({ filename }) => /* ... */, experimental: { async: true } },
  adapter: adapter(),
  experimental: { remoteFunctions: true },
})
```

Руны принудительно включены для всех файлов проекта (кроме `node_modules`).
`remoteFunctions` включены, но не используются.

## Структура

```
src/
├── app.html                     lang=ru, data-theme, инлайн-скрипт темы
├── app.d.ts
├── lib/
│   ├── index.ts                 цель импорта для #lib, экспортов нет
│   ├── assets/favicon.svg
│   ├── styles/
│   │   ├── tokens.css           дизайн-токены: цвет, шрифт, шкалы, тени, движение
│   │   └── base.css             reset, .icon, .sr-only, focus-visible
│   ├── data/                    dishes.ts, orders.ts, profile.ts — только данные
│   ├── state/
│   │   ├── app.svelte.ts        createAppState() + синглтон app
│   │   └── app.spec.ts
│   └── components/
│       ├── ui/                  переиспользуемые примитивы
│       ├── app/                 шелл, шапка, навигация
│       └── features/            карточка блюда, карта, экраны
└── routes/
    ├── +layout.svelte           AppShell + AppHeader + BottomNav
    ├── +layout.ts               prerender = true
    ├── +error.svelte            404 и прочие ошибки, внутри шелла
    ├── +page.svelte             /            меню
    ├── cart/+page.svelte        /cart        корзина
    ├── order/+page.svelte       /order       заказ (распределитель по статусу)
    ├── favorites/+page.svelte   /favorites   любимое
    ├── profile/+page.svelte     /profile     профиль
    └── profile/
        ├── history/+page.svelte   история заказов
        └── notifications/+page.svelte

scripts/
├── check-contrast.mjs           контрастный гейт, встроен в lint
├── screenshots.mjs              скриншоты для README
└── make-icons.mjs               иконки PWA и манифест из refs/

refs/                             исходники иконки, в сборку не попадают
```

## Иконки и манифест

`static/manifest.webmanifest` и иконки рядом с ним **генерируются**:
`pnpm icons` рендерит их из `refs/icon.jpeg` и пишет манифест заново. Правки в
`static/manifest.webmanifest` руками перетрутся — правится `refs/icon.jpeg` и
палитра, потом команда прогоняется снова.

Ссылка на манифест в `app.html` идёт через `%sveltekit.assets%`, поэтому
остаётся верной и в корне домена, и в подкаталоге `/v-domike/`.

## Скриншоты для README

`pnpm screenshots` собирает проект, поднимает раздачу `build/` и снимает 4
экрана в двух темах в `docs/images/`. Ровно то, что уедет на хостинг.

- Вьюпорт 390×920, `deviceScaleFactor: 2`, анимации выключены.
- Тема ставится через `localStorage` **до** загрузки страницы, скрипт падает,
  если `data-theme` не применился.
- Корзина наполняется кликами перед уходом на `/order`: экран снимается таким,
  каким его видит человек. Скрипт не сеет `localStorage` — в каждом контексте
  storage пустой, иначе снимки зависели бы от прошлого прогона.
- Изменил вёрстку — пересними картинки, README показывает старую версию.

## Деплой

`adapter-static` пишет готовые HTML в `build/`: `/order` становится
`build/order.html`. Собирать и выкладывать нужно именно эту папку, на любой
статический хостинг, без Node на сервере.

Маршруты лежат плоско, поэтому хостинг должен отдавать `/order` как
`order.html`. На GH Pages это работает само, на Netlify и Vercel — из коробки.

Ссылки внутри приложения относительные (`./order`, `../profile`): их даёт
`resolve()`, типизированный `RouteId`. Приложение поэтому работает и в
подкаталоге хостинга, а опечатка в адресе падает на `pnpm check`.

### GitHub Pages

`.github/workflows/pages.yml`: пуш в `main` → `pnpm build` →
`actions/upload-pages-artifact` → `actions/deploy-pages`. Ручной запуск — кнопка
Run workflow на вкладке Actions. Отдельный `pnpm install` в шагах не нужен:
`pnpm/setup` ставит pnpm и Node и выполняет установку сам, с
`require-lockfile: true` — без `pnpm-lock.yaml` шаг упал бы, а не разрешил бы
зависимости из реестра.

Адрес: **`https://ku6epxboctuk.is-a.dev/v-domike/`**. Кастомный домен привязан к
Pages проекта, поэтому приложение лежит не в корне домена, а в подкаталоге
`/v-domike/` — это и проверяет относительные ссылки. Отдельный домен покупать не
нужно: https Pages выдаёт сам, по сертификату Let's Encrypt.

**Ставить приложение можно только по https.** Сертификат для
`ku6epxboctuk.is-a.dev` выдан и действует, но `Enforce HTTPS` в Settings → Pages
выключено: сайт отдаётся и по http, и по https. По http service-worker не
зарегистрируется и PWA не встанет, поэтому включать надо — вручную или
`PUT /repos/Ku6epXBOCTuK/v-domike/pages` с `https_enforced: true`.

Чего воркфлоу не делает: не гоняет `pnpm check`, `pnpm lint` и `pnpm test` перед
выкладкой. Пока это не сделано, порядок «проверил локально → запушил» держится
на владельце.

## Известные проблемы

- **404 приходит от хостинга, а не от приложения.** `+error.svelte` есть: в dev
  и при настоящих ошибках он показывает страницу в оформлении приложения. Но
  `adapter-static` без `fallback` не знает про неизвестные пути — `/orderr`
  отдаст 404 самого хостинга. Хостинг определился (GitHub Pages), и лечится это
  одним `fallback: "404.html"` в адаптере: Pages подхватит файл сам. Пока не
  сделано — см. бэклог.
- **Предупреждение `adapter-static`**:
  `Reading config.kit inside adapters is deprecated`. Приходит изнутри адаптера,
  сборку не ломает. Наша форма конфига уже та, которой ждёт апстрим; ждём, пока
  приберут.
- **`src/lib/index.ts` пустой.** Работает как цель импорта для `#lib`, но
  экспортов не содержит.
- **`static/robots.txt` из скаффолда**, `Disallow:` пустой.

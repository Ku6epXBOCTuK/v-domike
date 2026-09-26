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

## Команды

| Команда             | Что делает                                 |
| ------------------- | ------------------------------------------ |
| `pnpm dev`          | dev-сервер                                 |
| `pnpm build`        | сборка и пререндер всех страниц в `build/` |
| `pnpm preview`      | локальный просмотр собранного сайта        |
| `pnpm check`        | `svelte-check` + тайпчек                   |
| `pnpm check:watch`  | то же самое в watch-режиме                 |
| `pnpm lint`         | prettier, eslint **и проверка токенов**    |
| `pnpm check:tokens` | только проверка токенов                    |
| `pnpm test`         | vitest                                     |
| `pnpm format`       | prettier --write                           |
| `pnpm screenshots`  | переснять скриншоты для README             |

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
│   ├── data/                    dishes.ts, profile.ts — только данные
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
    ├── order/+page.svelte       /order       заказ
    ├── favorites/+page.svelte   /favorites   любимое
    └── profile/+page.svelte     /profile     профиль

scripts/
├── check-contrast.mjs           контрастный гейт, встроен в lint
└── screenshots.mjs              скриншоты для README
```

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

## Известные проблемы

- **404 приходит от хостинга, а не от приложения.** `+error.svelte` есть: в dev
  и при настоящих ошибках он показывает страницу в оформлении приложения. Но
  `adapter-static` без `fallback` не знает про неизвестные пути — `/orderr`
  отдаст 404 самого хостинга. Пока раздаём статику, так и будет; вернёмся к
  вопросу вместе с хостингом: подойдёт либо `fallback` в адаптере, либо хостинг,
  который отдаёт 404 приложению.
- **Предупреждение `adapter-static`**:
  `Reading config.kit inside adapters is deprecated`. Приходит изнутри адаптера,
  сборку не ломает. Наша форма конфига уже та, которой ждёт апстрим; ждём, пока
  приберут.
- **`src/lib/index.ts` пустой.** Работает как цель импорта для `#lib`, но
  экспортов не содержит.
- **`static/robots.txt` из скаффолда**, `Disallow:` пустой.

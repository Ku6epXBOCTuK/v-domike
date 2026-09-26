# План: порт дизайна `refs/` на SvelteKit (без Tailwind, на дизайн-токенах)

> Статус: план согласован, к реализации не приступать без команды. Источник:
> `refs/` (Next.js 16 + React 19 + Tailwind v4 + shadcn, сгенерировано v0.app).
> Цель: `src/` (SvelteKit 5 runes + adapter-static).

## Что портируем

`refs/app/page.tsx` (474 строки) — 1 экран, 4 таба, весь дизайн зашит в ~80
hardcoded hex-хартеджей. Плюс `refs/app/globals.css` (260 строк), из которых
строки 7–154 (shadcn `--background/--primary/--sidebar-*`) — **мёртвый код**, ни
один класс в `page.tsx` их не использует. Реальный дизайн = палитра в
`page.tsx` + блок `.theme-*` в `globals.css:169–260`.

Дополнительно: `refs/app/layout.tsx` (метаданные, `lang="ru"`), `refs/public/*`
(4 картинки блюд + иконки).

## Зафиксированные решения

| Вопрос           | Решение                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Тёмная тема      | Семантические токены, тёмные значения есть у **каждого** токена. Дыры рефа (`#f0e4df`, `#a67677`, `#aa9a95`, `#9f7778` без тёмных) закрыты |
| Стили            | Scoped `<style>` в каждом `.svelte`. Глобально — только `tokens.css` + `base.css`                                                          |
| Гранулярность    | ~18 атомарных компонентов + 4 таба + shell                                                                                                 |
| Состояние        | Фабрика `createAppState()` в `src/lib/state/app.svelte.ts`                                                                                 |
| Тема             | `localStorage` + `data-theme` на `<html>`, инлайн-скрипт в `<head>`                                                                        |
| Ассеты           | 4 PNG → WebP ~600px, ~7.9 MB → ~200 KB                                                                                                     |
| Иконки           | `unplugin-icons@24` + `@iconify-json/lucide` (SVG инлайнится на сборке, размер/цвет — из CSS-токенов)                                      |
| Менеджер пакетов | pnpm (уже настроен: `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `.npmrc`)                                                                     |

## Что НЕ портируем (осознанно)

- `refs/components/ui/button.tsx` — в рефе **мёртвый код**, нигде не
  импортируется. Общие `Button`/`cva` не нужны: покрыто `IconButton` +
  `TextButton` + `Chip` + `NavItem`.
- `shadcn/tailwind.css`, `@theme inline`, shadcn-токены
  `--background/--primary/--card/--sidebar-*/--chart-*` — не используются
  дизайном.
- `refs/public/placeholder*` (4 файла) и `refs/public/icon.svg` (v0-болванка) —
  не бренд проекта.
- `next/image` → plain `<img>` + `aspect-ratio` (в рефе
  `images.unoptimized: true`, т.е. это и был обычный `<img>`).
- `@vercel/analytics` — для статического адаптера не нужен.
- `refs/` в целом не трогаем — остаётся как есть (коммичен в git, отдельный
  не-workspace пакет).

---

## Этап 0 — инфраструктура

1. **Иконки — `unplugin-icons` + Iconify.**

   ```bash
   pnpm add -D unplugin-icons @iconify-json/lucide
   ```

   `vite.config.ts` — добавить плагин в `plugins` **после**
   `sveltekit({ ... })`:

   ```ts
   import Icons from "unplugin-icons/vite";
   // ...
   plugins: [
     sveltekit({ /* ... */ }),
     Icons({ compiler: "svelte", scale: 1, defaultClass: "icon" }),
   ],
   ```

   - `compiler: "svelte"` — обязателен, иначе плагин не знает, во что
     компилировать SVG. Svelte-режим умеет и runes (Svelte 5), и legacy —
     определяется автоматически по установленной версии.
   - `scale: 1` — убирает дефолтный `1.2em` из атрибутов `width`/`height`, чтобы
     размер иконки целиком задавался нашими токенами в CSS. Фолбэк, если CSS не
     загрузился, — `1em`.
   - `defaultClass: "icon"` — стабильный глобальный хук на каждой иконке (см.
     Этап 1, `base.css`; стратегия размеров — в Этапе 3).

   `src/app.d.ts` — добавить первой строкой:

   ```ts
   import "unplugin-icons/types/svelte";
   ```

   Это объявляет модули `~icons/*` и `virtual:icons/*` для `svelte-check`
   (внутри — `Component<SvelteHTMLElements["svg"]>` из Svelte 5; `types/svelte`
   уже реэкспортит `types/svelte5`).

   `.vscode/extensions.json` — добавить `antfu.iconify`: inlay-превью и
   автодополнение имён иконок прямо в редакторе.

   Ставим только `@iconify-json/lucide` (612 KB, 1925 иконок), а не весь
   `@iconify/json` (~120 MB). В бандл попадут только те ~13, что мы импортируем.

   Имена иконок (проверено по `@iconify-json/lucide@1.2.136`):

   | `lucide-react` в рефе | `~icons/lucide/...`                              |
   | --------------------- | ------------------------------------------------ |
   | `ArrowRight`          | `arrow-right`                                    |
   | `Bell`                | `bell`                                           |
   | `Clock3`              | `clock-3`                                        |
   | `Heart`               | `heart`                                          |
   | `Home`                | **`house`** — в новом lucide `home` переименован |
   | `MapPin`              | `map-pin`                                        |
   | `Moon`                | `moon`                                           |
   | `Navigation`          | `navigation`                                     |
   | `Plus`                | `plus`                                           |
   | `Sun`                 | `sun`                                            |
   | `UserRound`           | `user-round`                                     |

   Почему `unplugin-icons` лучше `@lucide/svelte` именно здесь:
   - SVG инлайнится **на сборке** → иконки есть в пререндеренном HTML, ноль
     JS-флаша и FOUC.
   - `stroke="currentColor"` → цвет иконки = CSS `color`, размер = CSS
     `width`/`height`. Оба уже есть в нашей токен-системе, ничего нового
     заводить не надо.
   - Не привязан к одному набору: `~icons/ph/...`, `~icons/tabler/...`,
     `~icons/carbon/...` подключаются тем же импортом. Пригодится под сезонные
     меню и скины курьеров из `docs/idea.md`.
   - `@iconify-json/lucide` — 612 KB на 1925 иконок против рантайм-библиотеки
     компонентов.

2. **Проверить резолв `.svelte.ts` через `#lib`.** `imports` в `package.json`
   сейчас отображает `#lib/* → ./src/lib/*`, а файл называется `app.svelte.ts` —
   импорт `#lib/state/app.svelte.js` не резолвится ни Vite, ни TS. Добавить в
   `package.json`:

   ```json
   "imports": {
     "#lib": "./src/lib/index.js",
     "#lib/*": "./src/lib/*",
     "#lib/*.svelte.js": "./src/lib/*.svelte.ts"
   }
   ```

   Проверить через `pnpm check`. **Фолбэк**, если паттерн не заработает:
   относительный импорт из `+page.svelte`.

3. `src/routes/+layout.ts` — `export const prerender = true;` (сейчас нет
   вообще, а `adapter-static` вызывается без опций).
4. `src/app.html`:
   - `lang="en"` → `lang="ru"`
   - `<html data-theme="light">`
   - убрать нестандартный `<meta name="text-scale" content="scale" />`
   - добавить инлайн-скрипт в `<head>` **до** `%sveltekit.head%`:

     ```html
     <script>
       const t = localStorage.getItem("vb-theme");
       document.documentElement.dataset.theme =
         t === "dark" || t === "light" ? t : "light";
     </script>
     ```

   Скрипт в `<head>` → тема применена до первой отрисовки (нет FOUC), и значение
   совпадает с тем, что прочитает стор на клиенте (нет hydration mismatch).

---

## Этап 1 — дизайн-токены

`src/lib/styles/tokens.css` — единственный источник правды. Только custom
properties, никаких `@theme` / `@apply` / препроцессоров.

### Цвет (25 токенов)

**Светлая тема НЕ 1:1 к рефу** — по решению от 2026-09-26 весь вторичный текст
поднят до WCAG AA (4.5:1). В рефе 10 из 12 приглушённых цветов давали 2.2–4.1:1
при 11px шрифте. Тёмная тема проходила и до правок менялась только в местах, где
её не было в `globals.css`. Полный аудит — `scripts/check-contrast.mjs`, палитра
ниже железно проходит его (48 пар, 0 провалов).

```css
/* Поверхности */
--surface-canvas          #f2e8df  →  #211b2b      (фон страницы)
--surface-canvas-glow     #fff6ed  →  #4d3446      (радиал градиента)
--surface-base            #fffaf5  →  #2b2236      (шелл приложения)
--surface-raised          #fffaf8  →  #3a2d49      (пин на карте, строки профиля)
--surface-sunken          #f0e3e0  →  #4a3047      (ETA-панель, empty state, иконка-чип, «+»)
--surface-warm            #fff3e8  →  #3e2e4b      (переключатель темы)
--surface-glass        rgb(255 250 248/.85) → rgb(58 45 73/.85)
--surface-inverse         #2d2928  →  #fff2f1      (активный чип/таб, курьер)  ← ФЛИП
--surface-map             #e8e1dd  →  #49344b

/* Тона блюд (вместо dish.tone со строкой Tailwind-класса) */
--tone-warm               #f0e4df  →  #4a3243
--tone-blush              #eee4e7  →  #453049
--tone-cream              #f2e5e1  →  #4d2f44
--tone-butter             #eee5d9  →  #4a352c

/* Текст. Контраст в скобках — на своём фоне в светлой теме */
--content-primary         #2d2928  →  #fff2f1      (h1..h3, тело)             13.9:1
--content-secondary       #736462  →  #c1a2b4      (eyebrow, detail, nav)      5.4:1
--content-ui              #5e514e  →  #d3becb      (chevron, bell, бейдж, CTA) 7.3:1
--content-accent          #b08282  →  #dda9a3      (крупный 34px, иконки)      3.2:1
--content-accent-strong   #8a5c5d  →  #eecac4      (wordmark, overline, маршрут) 5.4:1
--content-accent-soft     #7f5657  →  #c99b9a      (цена, «Корзина →», toggle) 6.0:1
--content-inverse         #fffaf8  →  #2d2928      (на surface-inverse)  ← ФЛИП
--content-inverse-muted   #cbb8b5  →  #6b5a58      (Member since 2024)
--content-on-sunken       #73595a  →  #f2dcd6      (ETA-заголовок)
--content-on-sunken-muted #7a5859  →  #d3a3a2      (ETA-лейбл, часы)

/* Границы */
--border-subtle           #e8dfdb  →  #58435b
--border-strong           #ead8cf  →  #70506d
```

Токены `surface-inverse` / `content-inverse` — единственные, кто **меняет роль**
в тёмной теме (светлый фон + тёмный текст). Это сознательно: в рефе активный таб
в тёмной теме был тёмным блоком на тёмном шелле (нечитаемо).

**Акцент разложен на 3 уровня вместо одного.** `#b88988` из рефа даёт 2.9:1 —
его можно ставить только на крупный текст (≥24px) и графику, где порог 3:1.
Мелкий текст бренда (wordmark 21px, «Curated for you» 10px) и маршрут на карте
(2.55:1 в рефе) ушли на `--content-accent-strong`. Цена и «Корзина →» — на
`--content-accent-soft`.

**`--content-tertiary` переименован в `--content-ui`.** В рефе «третичный» цвет
(`#968985`) темнее «вторичного» (`#a89691`), то есть иерархия по имени соврала.
Он используется на интерактивных и служебных элементах (chevron, bell, бейдж
времени, CTA), поэтому названо по роли: `--content-ui`.

**Свёртка 15 near-identical приглушённых серых** в 3 уровня вместо 15 случайных
оттенков. Соответствия (для ревью):

| Hex в рефе                      | → токен                     |
| ------------------------------- | --------------------------- |
| `#a89691` eyebrow табов         | `--content-secondary`       |
| `#aa9d98` detail блюда          | `--content-secondary`       |
| `#aaa09c` inactive nav          | `--content-secondary`       |
| `#a99b98` «private dining»      | `--content-secondary`       |
| `#aa9a95` цитата пустой корзины | `--content-ui`              |
| `#968985` inactive chip         | `--content-ui`              |
| `#927d79` текст CTA заказа      | `--content-ui`              |
| `#796c69` подпись на карте      | `--content-ui`              |
| `#9b7e7d` текст ETA-панели      | `--content-ui`              |
| `#867775` иконка bell           | `--content-ui`              |
| `#766967` бейдж времени         | `--content-ui`              |
| `#b9aaa5` chevron в профиле     | `--content-ui`              |
| `#cbb8b5` Member since 2024     | `--content-inverse-muted`   |
| `#9f7778` «Корзина →»           | `--content-accent-soft`     |
| `#a77b7c` ETA-лейбл + часы      | `--content-on-sunken-muted` |

Дубли `#3a2d2b` (`.theme-page`) и `#262321` (body) → `--content-primary`.
`#a66e70` (theme toggle) → `--content-accent-soft`. `#c8a6a4` (кольцо аватара) →
`--content-accent-soft`.

**Схлопнутые пары-дубли** (разница 1–2/255, на глаз неразличимы, поэтому два
токена ради них — мусор):

- `#eee2df` (кнопка «+») слита в `--surface-sunken` (`#f0e3e0`)
- `#e9dfdc` (кнопка bell) слита в `--border-subtle` (`#e8dfdb`)
- `#fffefa` (в рефе не использовалась) выброшена
- `#fffaf5` (шелл) и `#fffaf8`/`#fffdfa` (карточки) оставлены как
  `--surface-base` / `--surface-raised` — разница 3/255, но роли структурно
  разные

### Типографика

- `--font-display`:
  `"Palatino Linotype", Palatino, "Iowan Old Style", Georgia, "Times New Roman", serif`
  (в рефе шрифт не загружен — работал браузерный дефолтный serif; в стеке только
  кириллические шрифты, у всех есть русский)
- `--font-sans`:
  `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`

Имена токенов размера — по роли, а не «title/lead/card»:

| Токен             | Значение | Где                             |
| ----------------- | -------- | ------------------------------- |
| `--text-display`  | 34px     | h1 таба                         |
| `--text-hero`     | 27px     | ETA                             |
| `--text-section`  | 24px     | h2 секции                       |
| `--text-wordmark` | 21px     | логотип                         |
| `--text-emphasis` | 18px     | имя в профиле, пустое состояние |
| `--text-card`     | 16px     | название блюда                  |
| `--text-quote`    | 13px     | курсивная цитата                |
| `--text-row`      | 12px     | строки списков                  |
| `--text-meta`     | 11px     | подписи, чипы, цены             |
| `--text-label`    | 10px     | микро-лейблы                    |
| `--text-badge`    | 9px      | бейдж времени                   |

Трекинг: `--tracking-display: -0.05em`, `--tracking-section: -0.03em`,
`--tracking-wordmark: -0.04em`, `--tracking-eyebrow: 0.18em`,
`--tracking-overline: 0.2em`, `--tracking-brand: 0.25em`,
`--tracking-wide: 0.025em`.

Интерлиньяжи: `--leading-heading: 0.98`, `--leading-tight: 1.15`,
`--leading-snug: 1.4`, `--leading-relaxed: 1.65`, `--leading-none: 1`. Веса:
`--weight-regular: 400`, `--weight-medium: 500`.

### Радиусы

`--radius-xs: 6px`, `--radius-sm: 12px`, `--radius-md: 16px`,
`--radius-lg: 22px`, `--radius-xl: 24px`, `--radius-2xl: 30px`,
`--radius-pill: 999px`.

Радиус карты `25px` из рефа сводим к `--radius-lg` (22px) — на ширине 285px
неразличимо.

### Тени

Токены переопределяются в тёмной теме, а не `-dark`-суффиксом:

- `--shadow-shell` (0 30px 100px)
- `--shadow-nav` (0 12px 35px)
- `--shadow-pin` (`shadow-lg`)
- `--shadow-marker` (`shadow-xl`)

### Движение

`--ease-out`, `--ease-snap` (rotate-анимация toggle), `--duration-fast: 180ms`,
`--duration-base: 250ms`, `--duration-slow: 500ms` (fade-in таба),
`--duration-image: 700ms` (hover-scale картинки).

### Слои

`--z-nav: 10`.

### Габариты фрейма

`--frame-max: 430px`, `--frame-min-height: 850px`, `--nav-max: 406px` — чтобы
AppShell и BottomNav не хранили магические числа.

### `src/lib/styles/base.css`

Современный reset (box-sizing, margin 0, `img { display: block }`),
`-webkit-font-smoothing: antialiased`, единый глобальный a11y-паттерн
`:focus-visible { outline: 2px solid var(--content-accent); outline-offset: 2px }`
(в рефе его нет вообще), `.sr-only`, и базовый класс для иконок из
`unplugin-icons` `defaultClass`:

```css
.icon {
  display: block;
  flex: none;
}
```

Импорт обоих файлов — **один раз** в `src/routes/+layout.svelte`.

---

## Этап 2 — данные и состояние

### `src/lib/data/dishes.ts`

```ts
type DishTone = "warm" | "blush" | "cream" | "butter";
type CategoryId = "all" | "warming" | "sweets" | "drinks";
type Dish = {
  id: string;
  name: string;
  detail: string;
  price: number;
  image: string;
  tone: DishTone;
  eta: string;
  category: Exclude<CategoryId, "all">;
};
```

Три фикса кода в рефе:

1. `id` вместо `name` как ключ — избранное в рефе привязано к строке,
   переименование блюда его ломает.
2. `tone` — union вместо сырого `bg-[#f0e4df]` (в Svelte это ещё и ломало бы
   source-detection).
3. `eta` в данных, а не `index % 2 === 0 ? "15–20 мин" : "5–10 мин"`.

### `src/lib/data/profile.ts`

Профиль (`name`, `initial`, `memberSince`) + 3 строки навигации с
`icon: "clock" | "pin" | "bell"` — строки, не компоненты, чтобы данные были
отделены от вида.

### `src/lib/state/app.svelte.ts`

Фабрика `createAppState()`:

- `tab`, `category`, `cart`, `favoriteIds` (сид `["latte"]`), `theme`
- `theme` инициализируется чтением `document.documentElement.dataset.theme` →
  совпадает с отрендеренным SSR-разметкой
- геттеры: `cartCount`, `visibleDishes`, `favoriteDishes`
- методы: `add`, `toggleFavorite`, `setTab`, `setCategory`, `toggleTheme` (пишет
  `dataset.theme` + `localStorage`)

---

## Этап 3 — примитивы (`src/lib/components/ui/`)

| Компонент       | API                                                                                | Переиспользование                            |
| --------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- |
| `IconButton`    | `label`, `tone: warm\|plain\|glass`, `size: sm\|md`, `pressed?`, `dot?`, `onclick` | toggle темы, bell, сердце в карточке         |
| `Chip`          | `label`, `active`, `onclick`                                                       | 4 категории                                  |
| `Overline`      | `variant: muted\|accent`, `children`                                               | eyebrow 4 табов + overline секции            |
| `TabHeading`    | `eyebrow`, `title` (слот — у Меню две строки + курсив)                             | 4 таба                                       |
| `SectionHeader` | `overline`, `title`, слот actions                                                  | 1 (Menu), задаёт паттерн                     |
| `TextButton`    | `variant: inline\|outline`, слот                                                   | «Корзина →», «Выбрать что-нибудь красивое →» |
| `EmptyState`    | `icon`, `title`                                                                    | пустое «Любимое»                             |
| `Avatar`        | `initial`                                                                          | карточка профиля                             |

Все — на `<button type="button">` / `<a>` с aria, без единой утилитарной строки.

### Стратегия размеров иконок

> **Проверено экспериментально на Этапе 0. Итог ниже — это единственный рабочий
> вариант, а не фолбэк.**

`unplugin-icons` спредит все пропсы на корневой `<svg>` и рендерит
`fill="none" stroke="currentColor"` + `width="1em" height="1em"` (благодаря
`scale: 1`). Значит цвет иконки задаётся через CSS `color`, размер — через
`width`/`height`.

**Способ A — `class`-проп. НЕ РАБОТАЕТ.** Svelte проставляет scope-хэш своему
собственному корневому элементу, но **не** корню дочернего компонента. Селектор
компилируется в `.cls.svelte-hash`, а у `<svg>` хэша нет → не матчится,
`svelte-check` пишет `Unused CSS selector`. Проверено сборкой: на выходе
`.cls.svelte-hash svg{…}` из способа B, а `.cls.svelte-hash` из способа A — без
срабатывания.

**Способ B — `:global(svg)` в scoped-блоке. Единственный рабочий:**

```css
/* src/lib/components/app/NavItem.svelte */
.nav-item :global(svg) {
  width: 16px;
  height: 16px;
}
```

Скомпилируется в `.nav-item.svelte-hash svg { … }` — матчится, потому что хэш
висит на родителе, а `svg` матчится как потомок. Проверено и для прямых детей, и
для вложенных.

Для этого дизайна это ещё и оптимально: почти каждый компонент рендерит иконки
**одного** размера (`AppHeader` — 16px, `NavItem` — 16px, `DishCard` — 14px,
`ProfileRow` — 16px, `TextButton` — 14px, `EtaPanel` — 20px), поэтому размер
объявляется один раз на компонент, а не на каждый вызов. Как исключение размер
нужен пропом только `IconButton` (14/16px) и `EmptyState` (24px).

> **Осторожно с `defaultClass`.** Он применяется, только если `class`-проп
> **не** передан — переданный `class` его затирает. Мы `class` иконкам не
> передаём (пользуемся способом B), так что `.icon` на каждом `<svg>`
> гарантирован. **Правило проекта: иконкам `class` не передаём никогда.**

Импорты иконок — **только в `.svelte`-файлах**. В `src/lib/data/profile.ts`
остаются строки (`icon: "clock" | "pin" | "bell"`), а не компоненты: данные
остаются сериализуемыми, маппинг строка → иконка живёт в `ProfileRow.svelte`.

---

## Этап 4 — каркас (`src/lib/components/app/`)

- `AppShell` — `main.surface-canvas` + фрейм 430px / radius 30px / тень. Слоты
  `header`, `default`, `footer`.
- `AppHeader` — слот `brand` + слот `actions`.
- `Wordmark` — `В` + акцентное `домике` + `уютная доставка`.
- `BottomNav` — floating, `backdrop-filter`, фиксированный, центрированный.
- `NavItem` — `icon`, `label`, `active`, `badge?`.

---

## Этап 5 — табы и фичи (`src/lib/components/features/`)

`MenuTab` / `OrderTab` / `FavoritesTab` / `ProfileTab`, плюс:

- `DishCard` — картинка c `mix-blend-multiply` + hover-scale, стеклянное сердце,
  бейдж времени, кнопка `+`, цена
- `DeliveryMap` + `MapMarker` (варианты `courier` / `home`)
- `EtaPanel`
- `IdentityCard`
- `ProfileRow`

Одно **сознательное визуальное добавление**: `.map-grid` в рефе — пустой `<div>`
без фона, то есть рендерится в **ничего** (при том что в `globals.css` ему
заданы `opacity` и `hue-rotate`). Добавим реальный тонкий grid-слоё через
`--map-grid-line` — это очевидный замысел автора. Если нужен буквальный 1:1 —
убирается одной правкой.

---

## Этап 6 — страница

`src/routes/+page.svelte` — тонкий композитор: `const app = createAppState()`,
`<AppShell>` → `AppHeader` / контент по `app.tab` / `BottomNav`. Плюс
`<svelte:head>` с title/description из `layout.tsx` рефа и `theme-color`.

---

## Этап 7 — ассеты и мета

1. `pnpm dlx sharp-cli` — 4 PNG → `static/dishes/*.webp`, ширина 600, quality
   ~80. Ожидаемо ~150–250 KB суммарно.
2. `static/favicon.svg` — заменить Svelte-логотип (взять `icon-light-32x32.png`
   / `apple-icon.png` из рефа, если они не v0-болванка; иначе — минимальный знак
   «vb»).
3. Удалить `src/lib/vitest-examples/*` (4 файла) и `src/lib/assets/favicon.svg`.
4. `README.md` — заменить шаблон `sv` на ~10 строк про запуск.

---

## Этап 8 — тесты и верификация

> **Пересмотрено после Этапа 0.** Browser-проект vitest в `vite.config.ts`
> требует Playwright-браузер (~300 MB, отдельно ставится `playwright install`).
> По условию задачи это не тянем — тесты переводим на `svelte/server`.

- `src/lib/state/app.svelte.spec.ts` — node-проект: переключение табов, фильтр
  категорий, `add` / `toggleFavorite`, `setTheme` пишет `localStorage` +
  `dataset.theme`. Стейт вынесен в фабрику именно ради этого.
- `src/lib/components/features/DishCard.spec.ts` — **node**-проект через
  `import { render } from "svelte/server"` + `describe`/`it` из `vitest`:
  проверяем, что в HTML попали имя, цена, `aria-label` кнопок и правильный
  `--tone-*` через `data-tone`. Браузер не нужен — это статический рендер.
- Существующий browser-проект vitest и `vitest-examples/*` — **удалить** из
  `vite.config.ts` и репозитория, чтобы не осталось мёртвой конфигурации. Если
  понадобится реальный браузерный тест позже — вернём одной строкой.

Команды:

```sh
pnpm check     # svelte-check, 0 ошибок
pnpm lint      # prettier + eslint
pnpm test      # vitest (node-проект)
pnpm build     # adapter-static prerender должен завершиться
```

Визуальная сверка: `pnpm install` в `refs/` + `pnpm dev` в обоих, сравнение 4
табов в светлой и тёмной теме.

---

## Итоги Этапа 0 (выполнен)

Все три риска проверены экспериментально, а не на словах:

| Риск                          | Результат                                                                                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `#lib/*.svelte.js` паттерн    | **Работает.** `svelte-check` — 0 ошибок, сборка — ок. Маппинг `"#lib/*.svelte.js": "./src/lib/*.svelte.ts"` оставлен                                                  |
| `unplugin-icons@24` на Vite 8 | **Работает.** SVG инлайнится в пререндеренный HTML: `<svg viewBox="0 0 24 24" width="1em" height="1em"><g fill="none" stroke="currentColor" …>`. `scale: 1` отработал |
| Проброс scope-хэша в `class`  | **Не работает.** `svelte-check` → `Unused CSS selector`. Стратегия размеров переписана на `:global(svg)`, см. Этап 3                                                  |

Побочные находки:

- `defaultClass: "icon"` затирается, если иконке передан `class`-проп. Мы
  `class` иконкам не передаём → правило зафиксировано в Этапе 3.
- `prerender = true` работает с `adapter-static`, сайт пишется в `build/`.
- `adapter-static` печатает deprecation:
  `Reading config.kit inside adapters is deprecated`. Приходит из конфига
  скаффолда (`sveltekit({ compilerOptions, adapter, experimental })` — без
  обёртки `kit`). Сборку не ломает; не трогаем, пока не понадобится.
- `pnpm test` в browser-проекте падает: Playwright-браузеры не установлены и
  качать их не будем → тесты переезжают на `svelte/server` (Этап 8).

---

## Итоги Этапа 1 (выполнен)

### `scripts/check-contrast.mjs` — автоматический a11y-гейт

Скрипт читает `tokens.css`, разбирает оба блока (`:root` и
`[data-theme="dark"]`), и прогоняет 48 реально используемых пар «текст/графика
на фоне» через формулу WCAG. Полупрозрачные поверхности композится над своим
родителем, чтобы стекло считалось честно. Порог: 4.5:1 для текста, 3:1 для
графики (1.4.11).

Прогнан вручную: **48 пар, 0 провалов** в обеих темах. Скрипт срабатывает при
изменении любого токена — если новый цвет не проходит, `pnpm lint` упадёт.

Найдено при первом прогоне: 3 провала в светлой теме, все из-за `#b08282`
(бренд-розовый) на средних тонах — исправлены, пара переназначена (`+` →
`accent-soft`, маршрут → `accent-strong`).

ESLint поймал реальный баг в самом скрипте: `const fg` с переприсваиванием —
упало бы при первом же токене с альфой. Исправлено на `let`.

### Решения, принятые на этапе

1. **Контраст → WCAG AA** (решение пользователя). Светлая тема перестала быть
   1:1 к рефу: 10 из 12 приглушённых цветов были 2.2–4.1:1 при 11px. Тёмная тема
   проходила и до правок.
2. **Акцент разложен на 3 уровня** (`accent` / `accent-strong` / `accent-soft`).
   `#b88988` = 2.9:1 — годится только для ≥24px и графики.
3. **`--content-tertiary` → `--content-ui`.** Имя врало: в рефе этот цвет темнее
   «вторичного» и используется на интерактивных элементах.
4. **Схлопнуты пары-дубли** в 1–2/255: `#eee2df`, `#e9dfdc`, неиспользуемая
   `#fffefa`. Токенов цветом стало 25, а не 26 — при полном покрытии.

### Итог

31 цветовой токен (9 поверхностей + 4 тона + 10 текстовых + 2 границы + 4 тени +
2 карты) и 55 не-цветовых (шрифты, 11 размеров, 5 интерлиньяжей, 7 трекингов, 2
веса, 12 шагов пространства, 7 радиусов, 5 движений, слой, 3 габарита фрейма).
CSS в бандле — 4.3 KB.

---

## Итоги Этапа 2 (выполнен)

### Маппинг импортов потребовал второго паттерна

`#lib/*` → `./src/lib/*` — буквальный, без вывода расширения. Extensionless
`#lib/data/dishes` не резолвится ни TS, ни Vite. Добавлен парный паттерн, и в
спецификаторе импорта теперь обязательно `.js`:

```json
"imports": {
  "#lib": "./src/lib/index.js",
  "#lib/*": "./src/lib/*",
  "#lib/*.svelte.js": "./src/lib/*.svelte.ts",
  "#lib/*.js": "./src/lib/*.ts"
}
```

**Правило проекта:** импортируешь через `#lib` — пиши расширение `.js` (для
`.ts`-файлов) или точное имя файла (`.svelte`, `.css`, `.svg`).

### Три бага рефа, закрытые в данных

1. **Избранное по `name`.** В рефе ключом был строковый `name` — переименование
   блюда ломало избранное. Теперь `Dish.id`.
2. **ETA считалась от индекса.** `index % 2 === 0 ? "15–20 мин" : "5–10 мин"` —
   из-за этого одно и то же блюдо показывало разное время в Меню и в Любимом (в
   Любимом массив переиндексируется). Теперь `eta` в данных. Единственное
   расхождение с рефом: «Пицца из печи» была 5–10 мин, стала 15–20 — значение из
   арифметики индекса, а не из логики.
3. **`tone` хранил Tailwind-класс.** Теперь union
   `"warm" | "blush" | "cream" | "butter"`, компонент мапит его в
   `var(--tone-*)` через `data-tone`.

### `createAppState()` — форма и решения

- `cart` — массив **ссылок** на блюда из каталога, а не копий. `add(id)` ищет в
  `Map` по id, поэтому цена/ETA/картинка в корзине никогда не устареют. API
  принимает `id`, а не объект.
- `setTheme` пишет и `data-theme`, и `localStorage`; `localStorage` обёрнут в
  `try/catch` — приватный режим и переполнение не ломают переключение темы.
- `readStoredTheme()` читает `document.documentElement.dataset.theme`, а не
  `localStorage` напрямую: источник истины — атрибут на `<html>`, который ставит
  инлайн-скрипт в `app.html`. Так SSR и клиент гарантированно согласованы. Под
  `typeof document === "undefined"` возвращается `"light"`.
- `const cart = $state([])` — массив мутируется через `push`, переприсваивания
  нет, поэтому `const`. ESLint это подтвердил.

### Тесты переехали на `svelte/server` раньше плана

Browser-проект vitest требовал Playwright-браузер (~300 MB), которого нет и
качать не будем. Чтобы `pnpm test` вообще работал, конфиг упрощён до одного
node-проекта:

- `vite.config.ts` — плоский `test` вместо `projects`
- удалены `playwright`, `@vitest/browser-playwright`, `vitest-browser-svelte`
- удалён `src/lib/vitest-examples/*` (4 файла) — существовал только чтобы
  проверять browser-сетап

`app.spec.ts` — 10 тестов на фабрику: фильтр категорий, корзина с дублями, `add`
с неизвестным id, toggle избранного, порядок `favoriteDishes`, запись темы в DOM
и `localStorage`, чтение стартовой темы из `data-theme`, устойчивость к
`QuotaExceededError`.

Одна ошибка была в моём же тесте: я забыл сид `latte` в ожидании
`favoriteDishes` — код был прав, тест нет.

Имя спеки — `app.spec.ts`, а **не** `app.svelte.spec.ts`: в старом конфиге
`*.svelte.spec.ts` попадал в browser-проект и исключался из node.

### Итог

`test` 10/10 · `check` 0/0 · `lint` PASS · `build` prerender OK.

⚠️ Картинки блюд (`/dishes/*.webp`) ещё не существуют — 404 до Этапа 7.

---

## Итоги Этапа 3 (выполнен)

### `Eyebrow` переименован в `Overline` и получил вариант

Планировался один `Eyebrow` на 5 мест, но два употребления в рефе визуально
разные: eyebrow таба — 11px / трекинг 0.18em / серый; overline секции — 10px /
трекинг 0.2em / розовый, и у него `mt-1` вместо `mb-3`. Один компонент с
`margin-bottom: 12px` пришлось бы переопределять в `SectionHeader`. Сделано
честнее: `Overline` с `variant: "muted" | "accent"`, отступ — часть варианта.

`TabHeading` поэтому **не** переиспользует `Overline` — у него свой маркер (11px
/ 0.18em / вторичный), и оба они совпадают с `Overline[data-variant=muted]`.
Дублирование в 4 строки сознательное: `TabHeading` не должен зависеть от
внутреннего устройства `Overline`.

`TabHeading` вместо слота-заголовка принимает `title: string` +
`accent?: string`. Все четыре таба покрываются этой парой, слот был бы лишней
абстракцией. Курсив сделан на `<span>`, а не на `<i>` из рефа — `<i>` ничего не
значит семантически.

### `IconButton` — 3 тона, и почему `aria-pressed` в селекторе

Тона из рефа: `warm` (переключатель темы, с rotate-анимацией), `plain` (bell),
`glass` (сердце в карточке). Размеры `sm` 32px / `md` 40px.

Заливка включённого сердца ключуется по `[aria-pressed="true"]`, а не по
`data-pressed`. Причина — не вкус: на `data-pressed` svelte-check выдаёт
`Unused CSS selector`, потому что иконка приходит снапетом и в разметке этого
компонента селектор не встречается. `aria-pressed` компонент и так пишет на
кнопку, поэтому анализатор его видит.

Цепочка селекторов: `.icon-button[aria-pressed="true"] :global(svg g)` —
`fill="none"` у lucide лежит на обёртке `<g>`, а не на `<svg>`, поэтому именно
`:global(svg g)`. Связано со структурой иконки, но для сердца это и есть нужный
эффект.

Все размеры иконок — через `:global(svg)` по размеру кнопки, как и решили на
Этапе 0. Класс иконкам не передаётся никогда (иначе `defaultClass` затирается).

### `TextButton` рендерит `<a>` или `<button>` по наличию `href`

«Корзина →» — ссылка, «Выбрать что-нибудь красивое» — действие. Одна компонента
с веткой по `href`, вместо того чтобы заставлять ярлык врать про `href="#"` на
кнопке.

### Тесты: 14 на примитивы, через `svelte/server`

`ui.spec.ts` рендерит каждый примитив и проверяет то, что реально может
сломаться: `aria-label` / `aria-pressed` у `IconButton`, `type="button"` у
`Chip`, ветку `<a>`/`<button>` у `TextButton`, появление точки только при `dot`,
`aria-pressed` не просочивается в разметку когда не задан, отсутствие лишнего
`<p>` без overline.

Снапеты в тестах собираются через `createRawSnippet` — фикстурных `.svelte`
файлов не понадобилось. `EmptyState` принимает иконку компонентой
(`Component<SvelteHTMLElements["svg"]>`), в тесте передаётся настоящий
`~icons/lucide/heart` — виртуальный модуль работает и в node-проекте vitest.

### Мелкие отклонения от рефа

- `p-7` (28px) в empty state → 24px `--space-8`: держать шкалу 4px-кратной
  важнее, чем лишние 4px
- `text-xl` (20px) в аватаре → `--text-emphasis` (18px): в круге 56px 20px
  выглядит тяжело
- У toggle темы убран внутренний `sr-only`-спан из рефа: он складывался с
  `aria-label` в имя «Включить тёмную тему Светлая тема»
- У неактивного `Chip` добавлен hover — в рефе его не было

### Итог

`test` 24/24 · `check` 0/0 · `lint` PASS · `build` OK.

⚠️ Scoped-стили примитивов не попадают в CSS-бандл, пока их не импортирует
какой-нибудь маршрут — это произойдёт на Этапах 4–6. Токен-связность проверена
на Этапе 1, компиляция `:global(svg)` — пробником на Этапе 0.

---

## Итоги Этапа 4 (выполнен)

### `BottomNav` владеет списком табов, страница — нет

Иконки обязаны импортироваться в `.svelte`-файле, но в `+page.svelte` им не
место: страница тогда знает про иконки и подписи. Поэтому `BottomNav` сам
импортирует 4 иконки lucide и держит массив `items`, а от страницы получает
`active: Tab`, `badgeOn: Tab | null` и `onselect: (tab: Tab) => void`.

`NavItem` при этом остаётся отдельной компонентой со своим API
(`label`/`icon`/`active`/`badge`) — `BottomNav` её собирает, но не диктует ей
внутренности.

### `NavItem` получил `aria-current="page"`

В рефе у навигации не было ни одной accessibility-метки. `aria-current="page"` —
честная метка для переключаемого раздела. Частичные `role="tablist"` без
`role="tabpanel"` не ставил: половина tab-семантики хуже, чем никакой.

`Wordmark` — `<button type="button">`, потому что он переключает таб, а не
переходит по ссылке. В рефе тоже `<button>`, но без `type`, то есть внутри формы
стал бы `submit`.

### Полупрозрачный навбар через `color-mix`, а не через два цвета

Реф держал `rgb(255 250 245 / 94%)` для светлой и `rgb(43 34 54 / 94%)` для
тёмной темы двумя литералами. Теперь:

```css
background: color-mix(in srgb, var(--surface-base) 94%, transparent);
```

Значение `94%` осталось константой, а цвет тянется из токена — смена темы
автоматическая.

### Четыре новых layout-токена

Градиент полотна в рефе различался **и по цвету, и по геометрии**: светлая
`circle at 15% 8% … transparent 32%`, тёмная
`circle at 82% 4% … transparent 30%`. Добавлены:

| Токен                  | Значение                            |
| ---------------------- | ----------------------------------- |
| `--canvas-glow-at`     | `15% 8%` → `82% 4%`                 |
| `--canvas-glow-extent` | `32%` → `30%`                       |
| `--nav-height`         | `62px`                              |
| `--content-bottom-pad` | `96px` (запас под плавающий навбар) |

`--content-bottom-pad` в рефе был `pb-24` — магическое число, отражающее высоту
плавающего навбара. Теперь оно выражено токеном рядом с `--nav-height`.

### Радиальный градиент в AppShell

Радиал собирается из `--canvas-glow-at` / `--surface-canvas-glow` /
`--canvas-glow-extent`, поэтому тёмная тема получает свою геометрию без
`:global([data-theme=dark])`-хака. Ровно то, чего не умел реф.

### Ошибка в моём тесте, не в коде

`expect(body).toContain('class="wordmark__name"')` падал: Svelte дописывает
scope-хэш, и в разметке `class="wordmark__name svelte-7chvu3"`. Добавлен хелпер
`hasClass(body, name)` на регулярке. Раньше в `ui.spec.ts` проверки шли по
substring и `data-*`, поэтому там хэш не мешал — но на будущее хелпер нужен
везде, где проверяется класс.

### Итог

`test` 35/35 · `check` 0/0 · `lint` PASS · `build` OK.

---

## Итоги Этапа 5 (выполнен)

### Находка Этапа 0 повторилась дважды — и это стоит записать правилом

`class` на компоненте из `~icons` не получает scope-хэш, поэтому scoped-стили по
нему не применяются. На этом этапе на это напоролись:

- `EtaPanel`: `<IconClock3 class="eta-panel__icon" />` → `Unused CSS selector`.
  Переписано на `.eta-panel__row :global(svg)`.
- `ProfileRow`: `<IconArrowRight class="profile-row__chevron" />` → то же.
  Переписано на `.profile-row > :global(svg)`.

Второй случай показал, что `:global(svg)` — не только про размер: он же решает
цвет. Иконка чипа наследует `color` от `.profile-row__chip` по обычному каскаду,
а шеврон — прямой потомок кнопки, и ему нужен собственный селектор
`.profile-row > :global(svg)`.

**Правило проекта: стили иконок задаются только через `:global(svg)` на
родителе. `class` иконкам не передаётся никогда** (это же нужно, чтобы
`defaultClass: "icon"` не затирался).

### `IconButton` и `Overline` расширены по требованию использования

Ни один из них не менялся в API «на будущее» — оба выросли из конкретного
употребления этого этапа:

| Компонент    | Что добавлено       | Зачем                                       |
| ------------ | ------------------- | ------------------------------------------- |
| `IconButton` | `size: "xs"` (28px) | кнопка «+» в карточке — 28px, сердце — 32px |
| `IconButton` | `tone: "sunken"`    | кнопка «+» — утопленная подложка            |
| `Overline`   | `variant: "panel"`  | третий оверлайн — в ETA-панели              |

`Overline` в рефе имел три разных оверлайна (11px/0.18em/серый,
10px/0.2em/розовый, 10px/0.16em/на панели). Вместо «один компонент +
переопределение margins» — три варианта, отливы у каждого свои.

### Позиционирование маркеров — в CSS DeliveryMap, не в пропсах MapMarker

Проценты позиций (`right: 10%; top: 18%`) — это содержимое иллюстрации, а не
переиспользуемое дизайн-решение. `MapMarker` остался чистым визуальным
примитивом, а `DeliveryMap` позиционирует его обёртками
`.delivery-map__slot--home/courier`. Магических строк в TypeScript нет.

Четыре иллюстративных токена вынесены в `tokens.css`:
`--delivery-map-height: 285px`, `--map-marker-size: 44px`,
`--map-route-angle: -22deg`, `--map-ring-width: 4px`.

### Цвет текста в ETA-панели

Иерархия «заголовок темнее, чем подпись» в рефе держалась на почти неразличимых
оттенках (`#73595a` и `#9b7e7d`, оба ниже AA). Теперь оба уровня — токен
`--content-on-sunken` (5.07:1), и различает их размер и гарнитура: 27px serif
против 11px sans. Токен на одну 11-строчную абзац не заводил.

Маршрут на карте ушёл с `--content-accent` на `--content-accent-strong`: в рефе
он давал 2.55:1.

### Три ошибки в моих тестах, не в коде

1. `Parameters<typeof MenuTab>[0]` — Svelte-компонент не является функцией с
   параметром пропсов. Заменено на `ComponentProps<typeof MenuTab>` из `svelte`
   (идиоматический способ для Svelte 5).
2. `/class="profile-row/g` считал ещё `profile-row__lead` и `profile-row__chip`
   → 9 вместо 3. Ужесточено до `/class="profile-row(?: |")/g`. Заодно ужесточил
   такой же regex в `app.spec.ts` для `nav-item`.
3. `aria-pressed="true"` в `MenuTab` есть не только у сердца, но и у активного
   чипа. Тест переписан на `aria-label` — он проверяет ровно то, что заявляет.

### Сетка на карте — единственное намеренное визуальное добавление

`.map-grid` в рефе был пустым `<div>` без фона и рендерился в **ничего**, хотя
`globals.css` задавал ему `opacity` и `hue-rotate`. Здесь это настоящая сетка на
`--map-grid-line` / `--map-grid-size`. Единственное место, где порт отличается
от рефа визуально; если не нужно — удаляется одним правилом.

Отброшен бессмысленный `filter: hue-rotate(260deg) saturate(1.4)` из тёмной темы
— он красил пустой div.

### Итог

`test` 54/54 · `check` 0/0 · `lint` PASS · `build` OK.

---

## Итоги Этапа 6 (выполнен)

### Ассеты пришлось затянуть с Этапа 7

`adapter-static` валит пререндер на 404 по сосланным статическим файлам:

```
404 GET /dishes/ramen.webp
/dishes/ramen.webp was linked from /
error during build: [Error: Prerendering failed]
```

Без картинок сборка не проходит, а сборка — главная проверка этого этапа.
Поэтому конвертация перенесена сюда:
`pnpm dlx sharp-cli -i … -o … resize 600 --format webp --quality 82`.

**7.57 MB → 181 KB** (`ramen` 44.5, `pizza` 59.9, `dessert` 41.8, `latte` 34.3).
600px ширины — с запасом: карточка рендерится 185px, 2× = 370px.

### Первый настоящий аудит собранного CSS

Раньше токены живут в отрыве от реальности — компоненты не были смонтированы, их
scoped-стили не попадали в бандл. Теперь попали: CSS вырос с 4.3 KB (токены +
reset) до **15.4 KB** (второй файл) + 4.6 KB (токены + reset).

| Проверка                                 | Результат                                                                   |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| Сырые hex в CSS компонентов              | 0 (единственный `#0000` — это Lightning CSS так минифицирует `transparent`) |
| `var(--x)` без объявления в `tokens.css` | **0**                                                                       |
| Объявлено, но не используется            | 4, все — ступени шкалы                                                      |

По результатам аудита удалены три токена, которые были обещаниями без
пользователей: `--ease-snap` (задумывался для rotate-анимации toggle, но там
`--ease-out`), `--nav-height` (выведен только `--content-bottom-pad`),
`--duration-base`. Осталось 4 неиспользуемых — `--space-0`, `--space-3`,
`--space-11`, `--radius-xs` — это **ступени шкал**, дырки в шкале выглядят хуже,
чем лишний шаг.

### Проверка пререндеренного HTML

| Что                                                                                                                                 | Результат                                                                         |
| ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Структура (`app__frame`, `app-header`, `wordmark`, `app__content`, `chip`, `section-header`, `dish-card`, `bottom-nav`, `nav-item`) | всё на месте                                                                      |
| `<svg>` инлайнятся                                                                                                                  | 15 шт., все со `stroke="currentColor"` и `class="icon"` — `defaultClass` работает |
| `<img>` с `alt` из названия блюда                                                                                                   | 4 из 4                                                                            |
| Мета из `layout.tsx` рефа                                                                                                           | title, description, `theme-color` × 2, `color-scheme`                             |
| Остатки `sv`-скаффолда                                                                                                              | только favicon (это Этап 7)                                                       |

Иконок ровно 15: moon + bell (шапка), heart × 4 + plus × 4 (карточки), стрелка
корзины, 4 таба.

`pnpm dev` отдаёт 200 (45.8 KB SSR-разметки).

### `IconButton.onclick` стал опциональным

У bell-уведомления в рефе обработчика нет — кнопка без действия. Сделал проп
опциональным, чтобы не ставить фальшивый no-op. Кнопка-заглушка под уведомления
курьера из `docs/idea.md`; когда появится механика — обработчик подключится.

### Fade-in таба: CSS-keyframes, а не `svelte/transition`

Реф на каждом табе использовал `animate-in fade-in duration-500` из
`tw-animate-css`. Два варианта:

- `svelte/transition` — нативно, но анимация на inline-стилях, и правило
  `prefers-reduced-motion` из `base.css` её **не гасит** (тот бьёт по CSS, а не
  по JS).
- CSS-keyframes — уже гасится существующим правилом в `base.css`
  (`animation-duration: 0.01ms !important`).

Выбран второй. Реализация: `{#key app.tab}` пересоздаёт обёртку `.tab` при смене
таба, поэтому анимация перезапускается — без `{#key}` обёртка переиспользовалась
бы и анимация играла бы только один раз.

### Тест страницы — 8 проверок композиции

`src/routes/page.spec.ts` рендерит `+page.svelte` целиком: шелл собран, старт на
Меню, 4 блюда с ценами, 4 чипа, 4 таба с `aria-current`, цитата пустой корзины,
`data-tone` вместо `bg-[#…`, доступные имена кнопок, title/description в `head`.

### Итог

`test` 62/62 · `check` 0/0 · `lint` PASS · `build` prerender OK · `dev`
HTTP 200.

---

## Итоги Этапа 7 (выполнен)

### Фавикон нарисован, а не взят из рефа

`refs/public/icon-light-32x32.png`, `icon-dark-32x32.png` и `apple-icon.png`
оказались **логотипом v0.app** — прочитав их как изображения, увидел фирменный
знак «v0», а не бренд приложения. `icon.svg` — тоже v0-болванка. Переносить
нечего, знак сделан свой.

### Знак — силуэт домика со светящимся окном

Первая версия была строчной «b» от слова _bite_ — переименование приложения в «В
домике» её отменило. Отрисованы и сравнены четыре варианта:

| Вариант | Идея                                 | Итог                                               |
| ------- | ------------------------------------ | -------------------------------------------------- |
| A       | сплошной силуэт, окно — вырез        | читается сразу, **взята как база**                 |
| B       | инверс A (тёмный фон, светлый домик) | читается, но холоднее                              |
| E       | крыша отдельно от стены, зазор       | **отвергнут**: зазор превращает в «шапку»          |
| A2      | A + розовое окно вместо выреза       | **взята**                                          |
| A3      | арочное окно                         | отвергнут: арка читается как церковь, а не как уют |

Финальный знак: rounded square `#f2e8df` (`--surface-canvas`) → силуэт домика
`#2d2928` (`--content-primary`) → окно `#b88988` (`--content-accent`). Окно
розовое, а не вырез, поэтому читается как тёплый свет в окне — ровно то, что
нужно названию.

Цвета взяты из токенов, а не подобраны на глаз. Один фавикон на обе темы: тёплая
кремовая плитка одинаково читается и на светлом, и на тёмном UI браузера,
поэтому media-пара из рефа не воспроизводилась.

`link` получил `type="image/svg+xml"`. Vite инлайнит SVG как data URI —
дополнительного запроса нет.

### Переименование в «В Домике»

Wordmark, `<title>`, `meta description`, README, тесты и `package.json`.
Структура знака сохранена: первая часть чернилами, вторая акцентным цветом — как
`virtual`/`bite` в рефе. Тег-лайн «private dining» заменён на «уютная доставка»:
он был единственным английским элементом в кириллическом интерфейсе.

Имя пакета `dophamine` → `v-domike` + поле `description`. Транслитерация «В
домике» в slug, который проходит npm-ограничения (строчные, без пробелов).

**Правило именования:** -domike — везде, где имя техническое (slug пакета, имя
каталога). «В Домике» — везде, где имя видно человеку: wordmark, `<title>`,
`meta description`, README, `description` пакета.

**Не переименовано:** каталог репозитория на диске
(`C:\+XBOCTuK\open_source\dophamine`). Имя каталога — физическое действие вне
git; git-remote у репозитория нет, так что переименование безопасно, но это
отдельное решение владельца. Скажите — переименую.

Ссылки на `private dining` и `virtual`/`bite` в этом документе оставлены в тех
местах, где они описывают **реф**, а не наш код: таблица соответствия цветов
(строка с `#a99b98`) и разбор этапа переименования.

### Лицензия MIT

`LICENSE` (стандартный текст, MIT, © 2026 Ku6epXBOCTuK) + поле
`"license": "MIT"` в `package.json`. Владелец взят из `git config`, не придуман.

### README переписан

Вместо шаблона `sv` — назначение проекта со ссылкой на `docs/idea.md` и
`docs/port-plan.md`, таблица команд (с указанием, что `pnpm lint` включает
контрастный гейт), стек с явным «без Tailwind», карта `src/`, раздел **Правила**
— четыре правила, каждое из которых стоило реальной находки:

1. цвет/радиус/тень/длительность — только токеном;
2. стили иконок — только `:global(svg)` на родителе, `class` иконкам не
   передаётся никогда;
3. импорты через `#lib` с расширением `.js`;
4. тёмная тема через `data-theme`, а не класс.

### Проверка, что болванка вычищена

Собранный HTML не содержит ни `Welcome to SvelteKit`, ни `svelte.dev/docs/kit`,
ни `#ff3e00`, ни `svelte-logo`. Фавикон инлайнится как data URI.

### Итог

`test` 62/62 · `check` 0/0 · `lint` PASS · `build` OK.

Остался только Этап 8 — визуальная сверка с рефом, которую без браузера
выполнить нельзя.

---

## Карта файлов

```sh
Изменяются существующие:
├── package.json                    ← + unplugin-icons, @iconify-json/lucide, imports, license
├── vite.config.ts                  ← + Icons(...); vitest упрощён до node-проекта
├── src/app.d.ts                    ← + import "unplugin-icons/types/svelte"
├── src/app.html                    ← lang=ru, data-theme, инлайн-скрипт
├── .vscode/extensions.json         ← + antfu.iconify
├── src/lib/assets/favicon.svg      ← знак «b» вместо логотипа Svelte [Этап 7]
├── README.md                       ← вместо шаблона `sv`              [Этап 7]
└── LICENSE                         ← MIT                               [Этап 7]

Новое:
├── src/lib/styles/{tokens.css, base.css}    ← единственный источник правды
├── src/lib/data/{dishes.ts, profile.ts}
├── src/lib/state/app.svelte.ts               ← юнит-тестируется (10 тестов)
└── src/lib/components/
    ├── ui/        (8)  IconButton Chip Overline TabHeading SectionHeader
    │                  TextButton EmptyState Avatar   [Этап 3 — готово]
    ├── app/       (5)  AppShell AppHeader Wordmark BottomNav NavItem
    │                  [Этап 4 — готово]
    └── features/  (10) DishCard DeliveryMap MapMarker EtaPanel IdentityCard
                       ProfileRow MenuTab OrderTab FavoritesTab ProfileTab
                       [Этап 5 — готово]

Новое в routes/:
├── +layout.ts      ← prerender = true            [Этап 0 — готово]
├── +layout.svelte  ← импорт base.css + tokens.css [Этап 1 — готово]
├── +page.svelte    ← композитор                        [Этап 6 — готово]
├── page.spec.ts     ← 8 проверок композиции             [Этап 6 — готово]
└── *.spec.ts        ← 2 спеки рядом с компонентами

static/dishes/*.webp                ← 4 файла, 181 KB   [Этап 6 — готово]
```

Фактический итог против плана: **6 существующих файлов изменены, 24 новых файла
создано (9 инфраструктура + 23 Svelte-компонента и 5 спеков + 4 webp + LICENSE),
4 файла болванки удалены** (`src/lib/vitest-examples/*` — на Этапе 2).
Отклонения от плана зафиксированы в «Итогах» соответствующих этапов: 3
переименования, 2 сокращения шкалы токенов, 3 удалённых мёртвых токена,
визуальная правка сетки на карте, перенос ассетов с Этапа 7 на Этап 6.

---

## Главные риски

Риски 1–3 закрыты на Этапе 0, см. «Итоги Этапа 0» выше. Остаются:

1. **SvelteKit 3 canary + TS 6** — сборка проходит, но
   deprecation-предупреждение от `adapter-static` про конфиг скаффолда может
   потребовать правки позже.
2. **Свёртка 15 серых в 3 уровня** — единственное место, где тёмная тема будет
   выглядеть иначе рефа. Таблица соответствий в Этапе 1 — для ревью.
3. **Рендер-тесты на `svelte/server`** не проверяют реальный браузерный computed
   style. Визуальная сверка с рефом — ручная, на глаз (Этап 8).

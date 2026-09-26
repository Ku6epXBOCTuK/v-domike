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

| Компонент       | API                                                    | Переиспользование                            |
| --------------- | ------------------------------------------------------ | -------------------------------------------- |
| `IconButton`    | `label`, `size: sm\|md`, `pressed?`, `onclick`         | toggle темы, bell, сердце в карточке         |
| `Chip`          | `label`, `active`, `onclick`                           | 4 категории                                  |
| `Eyebrow`       | `children`                                             | 4 таба + `SectionHeader`                     |
| `TabHeading`    | `eyebrow`, `title` (слот — у Меню две строки + курсив) | 4 таба                                       |
| `SectionHeader` | `overline`, `title`, слот actions                      | 1 (Menu), задаёт паттерн                     |
| `TextButton`    | `variant: inline\|outline`, слот                       | «Корзина →», «Выбрать что-нибудь красивое →» |
| `EmptyState`    | `icon`, `title`                                        | пустое «Любимое»                             |
| `Avatar`        | `initial`                                              | карточка профиля                             |

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
- `Wordmark` — `virtual` + акцентное `bite` + `private dining`.
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

## Карта файлов

```sh
Изменяются существующие:
├── package.json                    ← + unplugin-icons, @iconify-json/lucide, imports
├── vite.config.ts                  ← + Icons({ compiler: "svelte", scale: 1, defaultClass: "icon" })
├── src/app.d.ts                    ← + import "unplugin-icons/types/svelte"
├── src/app.html                    ← lang=ru, data-theme, инлайн-скрипт
├── .vscode/extensions.json         ← + antfu.iconify
└── README.md                       ← вместо шаблона `sv`

Новое:
├── src/lib/styles/{tokens.css, base.css}    ← единственный источник правды
├── src/lib/data/{dishes.ts, profile.ts}
├── src/lib/state/app.svelte.ts               ← юнит-тестируется
└── src/lib/components/
    ├── ui/        (8)  IconButton Chip Eyebrow TabHeading SectionHeader
    │                  TextButton EmptyState Avatar
    ├── app/       (5)  AppShell AppHeader Wordmark BottomNav NavItem
    └── features/  (10) DishCard DeliveryMap MapMarker EtaPanel IdentityCard
                       ProfileRow MenuTab OrderTab FavoritesTab ProfileTab

Новое в routes/:
├── +layout.ts      ← prerender = true            [Этап 0 — готово]
├── +layout.svelte  ← импорт base.css + tokens.css
├── +page.svelte    ← композитор
└── *.spec.ts       ← 2 спеки (state + DishCard)

static/dishes/*.webp                ← 4 файла
```

Итого: **6 существующих файлов изменяются, 9 файлов кода-инфраструктуры
создаются, 23 Svelte-компонента, 2 спеки, 4 webp**; удаляется 5 файлов болванки
(`src/lib/vitest-examples/*` — 4 шт. и `src/lib/assets/favicon.svg`).

---

## Главные риски

Риски 1–3 закрыты на Этапе 0, см. «Итоги Этапа 0» выше. Остаются:

1. **SvelteKit 3 canary + TS 6** — сборка проходит, но
   deprecation-предупреждение от `adapter-static` про конфиг скаффолда может
   потребовать правки позже.
2. **Свёртка 15 серых в 3 уровня** — единственное место, где тёмная тема будет
   выглядеть иначе рефа. Таблица соответствий в Этапе 1 — для ревью.
3. **Рендер-тесты на `svelte/server`** (Этап 8) не проверяют реальный браузерный
   computed style. Визуальная сверка с рефом — ручная, на глаз.

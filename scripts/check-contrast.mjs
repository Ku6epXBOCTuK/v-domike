import { readFileSync } from "node:fs";

const CSS_PATH = new URL("../src/lib/styles/tokens.css", import.meta.url);

const TEXT_MIN = 4.5;
const LARGE_MIN = 3;
const GRAPHIC_MIN = 3;

const PAIRS = [
	// [foreground, background, minimum, note]
	["content-primary", "surface-base", TEXT_MIN, "заголовки, названия блюд"],
	["content-primary", "surface-canvas", TEXT_MIN, "текст страницы"],
	["content-primary", "surface-raised", TEXT_MIN, "строки профиля"],
	["content-primary", "surface-sunken", TEXT_MIN, "текст на утопленной панели"],
	[
		"content-secondary",
		"surface-base",
		TEXT_MIN,
		"eyebrow, detail блюда, inactive nav",
	],
	["content-secondary", "surface-raised", TEXT_MIN, "detail блюда на карточке"],
	[
		"content-secondary",
		"surface-canvas",
		TEXT_MIN,
		"вторичный текст на полотне",
	],
	["content-ui", "surface-base", TEXT_MIN, "chevron, bell, бейдж времени, CTA"],
	["content-ui", "surface-raised", TEXT_MIN, "текст на приподнятой карточке"],
	[
		"content-accent-strong",
		"surface-base",
		TEXT_MIN,
		"wordmark 21px, overline 10px",
	],
	[
		"content-accent-soft",
		"surface-base",
		TEXT_MIN,
		"цена, «Корзина →», toggle темы",
	],
	[
		"content-accent-soft",
		"surface-sunken",
		TEXT_MIN,
		"«+» DishCard, бейдж ETA",
	],
	["content-inverse", "surface-inverse", TEXT_MIN, "активный чип и таб"],
	["content-inverse-muted", "surface-inverse", TEXT_MIN, "Member since"],
	["content-on-sunken", "surface-sunken", TEXT_MIN, "ETA-заголовок"],
	["content-on-sunken-muted", "surface-sunken", TEXT_MIN, "ETA-лейбл 10px"],

	// Крупный текст >= 24px: 34px «Что сегодня», 24px «Маленькие радости»
	["content-accent", "surface-base", LARGE_MIN, "«для души?» 34px курсив"],

	// Нетекстовые: иконки и маршрут на карте, WCAG 1.4.11
	["content-accent", "surface-base", GRAPHIC_MIN, "иконка сердца"],
	["content-accent", "surface-raised", GRAPHIC_MIN, "иконка Home на пине"],
	[
		"content-accent-soft",
		"surface-sunken",
		GRAPHIC_MIN,
		"иконка «+» в DishCard",
	],
	[
		"content-accent-strong",
		"surface-map",
		GRAPHIC_MIN,
		"линия и точка маршрута",
	],
	["content-inverse", "surface-inverse", GRAPHIC_MIN, "иконка курьера"],
	["content-ui", "surface-map", GRAPHIC_MIN, "текст подписи на карте (glass)"],
	["content-ui", "surface-glass", GRAPHIC_MIN, "текст бейджа времени (glass)"],
];

const THEMES = { light: ":root", dark: '[data-theme="dark"]' };

function parseBlock(source, selector) {
	const start = source.indexOf(`${selector} {`);
	if (start === -1)
		throw new Error(`Селектор ${selector} не найден в tokens.css`);
	let depth = 0;
	let end = start;
	for (let i = source.indexOf("{", start); i < source.length; i++) {
		if (source[i] === "{") depth++;
		else if (source[i] === "}") {
			depth--;
			if (depth === 0) {
				end = i;
				break;
			}
		}
	}
	const body = source.slice(start, end);
	const tokens = {};
	for (const line of body.split("\n")) {
		const m = line.match(/^\s*(--[\w-]+)\s*:\s*([^;]+);/);
		if (m) tokens[m[1]] = m[2].trim();
	}
	return tokens;
}

function parseColor(value) {
	const v = value.trim();
	const hex = v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
	if (hex) {
		const h =
			hex[1].length === 3 ? [...hex[1]].map((c) => c + c).join("") : hex[1];
		return [
			parseInt(h.slice(0, 2), 16),
			parseInt(h.slice(2, 4), 16),
			parseInt(h.slice(4, 6), 16),
			1,
		];
	}
	const rgb = v.match(
		/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,/\s]+([\d.]+))?\s*\)$/i,
	);
	if (rgb) {
		return [+rgb[1], +rgb[2], +rgb[3], rgb[4] === undefined ? 1 : +rgb[4]];
	}
	throw new Error(`Не понимаю цвет: ${value}`);
}

function composite(fg, bg) {
	const a = fg[3];
	return [
		fg[0] * a + bg[0] * (1 - a),
		fg[1] * a + bg[1] * (1 - a),
		fg[2] * a + bg[2] * (1 - a),
		1,
	];
}

function luminance([r, g, b]) {
	const f = (c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(fg, bg) {
	const a = luminance(fg);
	const b = luminance(bg);
	const [hi, lo] = a > b ? [a, b] : [b, a];
	return (hi + 0.05) / (lo + 0.05);
}

const source = readFileSync(CSS_PATH, "utf8");
const parsed = Object.fromEntries(
	Object.entries(THEMES).map(([name, sel]) => [name, parseBlock(source, sel)]),
);

let failed = 0;
let checked = 0;
const rows = [];

for (const [fgName, bgName, min, note] of PAIRS) {
	for (const theme of Object.keys(THEMES)) {
		const tokens = parsed[theme];
		const fgRaw = tokens[`--${fgName}`];
		const bgRaw = tokens[`--${bgName}`];
		if (!fgRaw || !bgRaw) {
			rows.push({
				theme,
				bg: bgName,
				fg: fgName,
				ratio: NaN,
				min,
				note: `токен не найден (${!fgRaw ? fgName : bgName})`,
			});
			failed++;
			continue;
		}
		// Полупрозрачные поверхности композитим над their own base-родителем,
		// потому что фактический фон под ними — соседняя поверхность.
		let bg = parseColor(bgRaw);
		if (bg[3] < 1) {
			const under =
				bgName === "surface-glass" ? "surface-base" : "surface-raised";
			bg = composite(bg, parseColor(tokens[`--${under}`]));
		}
		let fg = parseColor(fgRaw);
		if (fg[3] < 1) fg = composite(fg, bg);
		const ratio = contrast(fg, bg);
		const ok = ratio >= min;
		if (!ok) failed++;
		checked++;
		rows.push({ theme, bg: bgName, fg: fgName, ratio, min, note, ok });
	}
}

const width = Math.max(...rows.map((r) => r.bg.length + r.fg.length));
for (const r of rows) {
	const mark = r.ok ? "PASS" : "FAIL";
	console.log(
		`${mark}  ${r.theme.padEnd(5)}  ${(r.bg + " / " + r.fg).padEnd(width)}  ` +
			`${r.ratio.toFixed(2).padStart(5)}:1  (min ${r.min})  ${r.note}`,
	);
}

// Тона блюд — не поверхности, а подложка под mix-blend-mode: multiply у фотографии.
// Умножение на тёмный цвет гасит снимок примерно до 23% яркости, поэтому токен
// обязан оставаться светлым в обеих темах. Ловим возврат тёмных значений.
console.log("");
const darkTones = Object.keys(parsed.dark).filter((name) =>
	name.startsWith("--tone-"),
);
if (darkTones.length > 0) {
	console.error("FAIL  --tone-* переопределены в тёмной теме.");
	for (const name of darkTones) {
		console.error(
			`        ${name}: ${parsed.light[name]} -> ${parsed.dark[name]}` +
				"   фото блюда погаснет",
		);
	}
	failed++;
} else {
	console.log(
		"PASS  --tone-* в тёмной теме не переопределены (multiply-подложка должна быть светлой)",
	);
}

// Инверсные токены обязаны МЕНЯТЬ РОЛЬ между темами. «Выделенная кнопка в тёмной
// теме светлая» — это инвариант, а не разовое совпадение, поэтому проверяем явно.
// Пара взаимодополняющая и потому флипает в противоположные стороны:
// фон тёмный -> светлый, текст на нём светлый -> тёмный.
console.log("");
const MUST_FLIP = [
	{
		name: "surface-inverse",
		from: "dark",
		to: "light",
		note: "фон активного чипа и таба, пина курьера",
	},
	{
		name: "content-inverse",
		from: "light",
		to: "dark",
		note: "текст на инверсной поверхности",
	},
];
const DARK_MAX = 0.35;
const LIGHT_MIN = 0.6;
const isDark = (l) => l < DARK_MAX;
const isLight = (l) => l > LIGHT_MIN;

for (const { name, from, to, note } of MUST_FLIP) {
	const l = luminance(parseColor(parsed.light[`--${name}`]));
	const d = luminance(parseColor(parsed.dark[`--${name}`]));
	const ok =
		(from === "dark" ? isDark(l) : isLight(l)) &&
		(to === "dark" ? isDark(d) : isLight(d));
	if (!ok) failed++;
	console.log(
		`${ok ? "PASS" : "FAIL"}  --${name.padEnd(16)} ` +
			`L ${l.toFixed(2)} -> ${d.toFixed(2)}  ` +
			`(ждём ${from} -> ${to})  ${note}`,
	);
}

console.log("");
console.log(`Проверено пар: ${checked}, провалов: ${failed}`);

if (failed > 0) {
	console.error("");
	console.error(
		`Провалов: ${failed}. Светлая тема — только значения из :root.`,
	);
	process.exit(1);
}

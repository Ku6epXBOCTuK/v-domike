/*
 * Иконки PWA и манифест.
 *
 *   node scripts/make-icons.mjs        pnpm icons
 *
 * Набор временный: рисуется из растрового refs/icon.jpeg, потому что
 * выровненного SVG ещё нет — см. docs/backlog.md, «Иконку приложения надо
 * переделать». Когда вектор будет, скрипт переписывается на рендер SVG: имена
 * файлов и манифест останутся теми же, перегенерация — та же команда.
 *
 * Размеры диктуют платформы, а не вкус: Android просит 192 и 512, iOS берёт
 * только PNG и 180. Маскабельным отдаётся тот же 512 — рисунок идёт до краёв,
 * а существенная часть лежит в центральных 80%, маска ничего важного не
 * срезает. Прозрачности нет ни в одном файле: iOS композитит иконку на белом.
 *
 * Цвета манифеста читаются из tokens.css, а не вписаны: полоса состояния
 * телефона должна совпадать с фоном приложения, и после правки темы достаточно
 * перегенерировать. Правь theme_color руками в манифесте — они затрутся.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STATIC = join(ROOT, "static");
const SOURCE = join(ROOT, "refs", "icon.jpeg");
const TOKENS = join(ROOT, "src", "lib", "styles", "tokens.css");

const ICONS = [
	// 512 и 192 — JPEG: PNG этой иллюстрации весит 200 КБ и почти не жмётся
	// хостингом, а рисуется на домашнем экране втрое меньше. iOS оставлен на
	// PNG — там JPEG не гарантирован.
	{ file: "icon-512.jpg", size: 512, quality: 92 },
	{ file: "icon-192.jpg", size: 192, quality: 92 },
	{ file: "apple-touch-icon.png", size: 180 },
];

/** Поверхность под шапкой: телефон красит ею полосу состояния. */
function surfaceBase(theme) {
	const source = readFileSync(TOKENS, "utf8");
	const selector = theme === "dark" ? '[data-theme="dark"]' : ":root";
	const start = source.indexOf(`${selector} {`);
	if (start === -1) throw new Error(`в tokens.css нет блока ${selector}`);
	const body = source.slice(start, source.indexOf("}", start));
	const token = body.match(/--surface-base:\s*([^;]+);/);
	if (!token) throw new Error(`в блоке ${selector} нет --surface-base`);
	return token[1].trim();
}

const manifest = {
	name: "В Домике",
	short_name: "В Домике",
	description: "Уютный симулятор доставки блюд",
	lang: "ru",
	// Пути относительные: приложение живёт и в корне домена, и в подкаталоге
	// (github.io/repo). Абсолютный "/" увёл бы установленное приложение с
	// сайта на корень домена, где его нет.
	start_url: "./",
	scope: "./",
	display: "standalone",
	background_color: surfaceBase("light"),
	theme_color: [
		{ media: "(prefers-color-scheme: light)", color: surfaceBase("light") },
		{ media: "(prefers-color-scheme: dark)", color: surfaceBase("dark") },
	],
	icons: [
		{
			src: "icon-192.jpg",
			sizes: "192x192",
			type: "image/jpeg",
			purpose: "any",
		},
		{
			src: "icon-512.jpg",
			sizes: "512x512",
			type: "image/jpeg",
			purpose: "any",
		},
		{
			src: "icon-512.jpg",
			sizes: "512x512",
			type: "image/jpeg",
			purpose: "maskable",
		},
	],
};

writeFileSync(
	join(STATIC, "manifest.webmanifest"),
	`${JSON.stringify(manifest, null, "\t")}\n`,
);
process.stdout.write("static/manifest.webmanifest\n");

const source = `data:image/jpeg;base64,${readFileSync(SOURCE).toString("base64")}`;
const browser = await chromium.launch();

try {
	for (const { file, size, quality } of ICONS) {
		const page = await browser.newPage({
			viewport: { width: size, height: size },
		});
		await page.setContent(
			`<style>html,body{margin:0}img{display:block;width:100%;height:100%}</style><img src="${source}" alt="" />`,
		);
		await page.waitForFunction(() => document.images[0]?.complete);
		await page.screenshot({
			path: join(STATIC, file),
			...(quality ? { type: "jpeg", quality } : {}),
		});
		await page.close();
		process.stdout.write(`static/${file} ${size}×${size}\n`);
	}
} finally {
	await browser.close();
}

/*
 * Иконки PWA и манифест — временный набор из refs/, почему такой и что заменяем:
 * в docs/backlog.md, «Иконку приложения надо переделать». Правки в
 * static/manifest.webmanifest руками перетрутся.
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
	// 512 и 192 — JPEG: PNG этой иллюстрации весил 200 КБ. iOS оставлен на PNG.
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
	// Относительные пути: приложение лежит в подкаталоге /v-domike/.
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

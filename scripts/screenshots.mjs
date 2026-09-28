import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

import {
	BASE,
	OUT,
	THEME_KEY,
	ensureBuild,
	serve,
	settle,
} from "./static-server.mjs";

const WIDTH = 390;
const HEIGHT = 920;

const PAGES = [
	{ id: "menu", path: `${BASE}/` },
	{ id: "order", path: `${BASE}/order` },
	{ id: "favorites", path: `${BASE}/favorites` },
	{ id: "profile", path: `${BASE}/profile` },
];

async function openOrder(page, origin) {
	await page.goto(`${origin}${BASE}/`);
	await settle(page);

	const add = page.getByRole("button", { name: /^Добавить / });
	await add.nth(0).click();
	await add.nth(1).click();

	await page.getByRole("link", { name: "Заказ" }).click();
	await settle(page);
}

async function shoot(context, origin, theme, { id, path }) {
	const page = await context.newPage();

	if (id === "order") {
		await openOrder(page, origin);
	} else {
		await page.goto(`${origin}${path}`);
		await settle(page);
	}

	const applied = await page.evaluate(
		(key) => ({
			onPage: document.documentElement.dataset.theme,
			stored: localStorage.getItem(key),
		}),
		THEME_KEY,
	);

	if (applied.onPage !== applied.stored) {
		throw new Error(
			`тема не применилась: ${applied.onPage} вместо ${applied.stored}`,
		);
	}

	await page.evaluate(() => scrollTo(0, 0));
	await page.screenshot({
		path: join(OUT, `${id}-${theme}.png`),
		animations: "disabled",
		caret: "hide",
	});
	await page.close();
}

ensureBuild();

mkdirSync(OUT, { recursive: true });
const { server, port } = await serve();
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();

try {
	for (const theme of ["light", "dark"]) {
		const context = await browser.newContext({
			viewport: { width: WIDTH, height: HEIGHT },
			deviceScaleFactor: 2,
			reducedMotion: "reduce",
		});
		await context.addInitScript(
			([key, value]) => localStorage.setItem(key, value),
			[THEME_KEY, theme],
		);

		for (const target of PAGES) {
			await shoot(context, origin, theme, target);
			process.stdout.write(`docs/images/${target.id}-${theme}.png\n`);
		}

		await context.close();
	}
} finally {
	await browser.close();
	server.close();
}

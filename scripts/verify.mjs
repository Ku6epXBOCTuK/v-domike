import AxeBuilder from "@axe-core/playwright";
import { chromium } from "playwright";

import {
	BASE,
	THEME_KEY,
	ensureBuild,
	serve,
	settle,
} from "./static-server.mjs";

const WIDTH = 390;
const HEIGHT = 920;

const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

async function withDishes(page, origin, path) {
	await page.goto(`${origin}${BASE}/`);
	await settle(page);
	const add = page.getByRole("button", { name: /^Добавить / });
	await add.nth(0).click();
	await add.nth(1).click();
	await settle(page);
	await page.goto(`${origin}${BASE}${path}`);
	await settle(page);
}

async function withFavorites(page, origin, path) {
	await page.goto(`${origin}${BASE}/`);
	await settle(page);
	const heart = page.getByRole("button", { name: /в любимое/ });
	await heart.nth(0).click();
	await heart.nth(1).click();
	await settle(page);
	await page.goto(`${origin}${BASE}${path}`);
	await settle(page);
}

async function withOrder(page, origin) {
	await page.goto(`${origin}${BASE}/`);
	await settle(page);
	const add = page.getByRole("button", { name: /^Добавить / });
	await add.nth(0).click();
	await add.nth(1).click();
	await settle(page);
	await page.getByRole("link", { name: "Заказ" }).click();
	await settle(page);
}

const SCENES = [
	{ id: "меню", path: "/" },
	{
		id: "меню с избранным",
		path: "/",
		setup: (page, origin) => withFavorites(page, origin, "/"),
	},
	{ id: "корзина пустая", path: "/cart" },
	{
		id: "корзина с блюдами",
		path: "/cart",
		setup: (page, origin) => withDishes(page, origin, "/cart"),
	},
	{ id: "избранное пустое", path: "/favorites" },
	{
		id: "избранное с блюдами",
		path: "/favorites",
		setup: (page, origin) => withFavorites(page, origin, "/favorites"),
	},
	{ id: "профиль", path: "/profile" },
	{ id: "история", path: "/profile/history" },
	{ id: "уведомления", path: "/profile/notifications" },
	{ id: "заказ", path: "/order", setup: withOrder },
	{ id: "скелетоны", path: "/skeletons" },
];

function report(scene, theme, violations) {
	for (const violation of violations) {
		console.error(
			`FAIL  ${theme} / ${scene}  ${violation.id}  ${violation.impact ?? ""}`,
		);
		console.error(`      ${violation.help}`);
		for (const node of violation.nodes) {
			console.error(`      ${node.target.join(" ")}`);
			console.error(
				`      ${node.failureSummary?.replace(/\s+/g, " ").trim() ?? ""}`,
			);
		}
	}
}

ensureBuild();
const { server, port } = await serve();
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();

let failed = 0;
let checked = 0;

try {
	for (const theme of ["light", "dark"]) {
		for (const scene of SCENES) {
			const context = await browser.newContext({
				viewport: { width: WIDTH, height: HEIGHT },
				reducedMotion: "reduce",
			});
			await context.addInitScript(
				([key, value]) => localStorage.setItem(key, value),
				[THEME_KEY, theme],
			);

			const page = await context.newPage();
			await page.goto(`${origin}${BASE}${scene.path}`);
			await settle(page);
			if (scene.setup) await scene.setup(page, origin);
			await settle(page);

			const { violations } = await new AxeBuilder({ page })
				.withTags(TAGS)
				.analyze();

			checked++;
			failed += violations.length;
			report(scene.id, theme, violations);
			process.stdout.write(
				`${violations.length ? "FAIL" : "ok  "}  ${theme} / ${scene.id}\n`,
			);

			await context.close();
		}
	}
} finally {
	await browser.close();
	server.close();
}

console.log("");
console.log(`Экранов проверено: ${checked}, нарушений: ${failed}`);

if (failed > 0) {
	console.error("axe-core нашёл нарушения: отчёт выше.");
	process.exit(1);
}

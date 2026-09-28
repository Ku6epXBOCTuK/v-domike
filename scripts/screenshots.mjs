import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BUILD = join(ROOT, "build");
const OUT = join(ROOT, "docs", "images");
const THEME_KEY = "vb-theme";
const skipBuild = process.argv.includes("--skip-build");

const WIDTH = 390;
const HEIGHT = 920;
const BASE = "/v-domike";

const PAGES = [
	{ id: "menu", path: `${BASE}/` },
	{ id: "order", path: `${BASE}/order` },
	{ id: "favorites", path: `${BASE}/favorites` },
	{ id: "profile", path: `${BASE}/profile` },
];

const TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".svg": "image/svg+xml",
	".webp": "image/webp",
	".png": "image/png",
	".txt": "text/plain; charset=utf-8",
	".ico": "image/x-icon",
};

function isFile(file) {
	return existsSync(file) && statSync(file).isFile();
}

function build() {
	const result = spawnSync("pnpm", ["build"], {
		cwd: ROOT,
		shell: true,
		stdio: "inherit",
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}

function resolve(pathname) {
	const clean = pathname
		.replace(BASE, "")
		.replace(/^\/+/, "")
		.replace(/\/+$/, "");
	return [
		join(BUILD, clean),
		join(BUILD, `${clean}.html`),
		join(BUILD, clean, "index.html"),
	].find(isFile);
}

function serve() {
	const server = createServer((req, res) => {
		const { pathname } = new URL(req.url, "http://localhost");
		const file = resolve(pathname);

		if (!file) {
			res.writeHead(404).end("not found");
			return;
		}

		res.writeHead(200, {
			"content-type": TYPES[extname(file)] ?? "application/octet-stream",
			"cache-control": "no-store",
		});
		createReadStream(file).pipe(res);
	});

	return new Promise((done) => {
		server.listen(0, "127.0.0.1", () =>
			done({ server, port: server.address().port }),
		);
	});
}

async function settle(page) {
	await page.waitForLoadState("networkidle");
	await page.evaluate(async () => {
		await document.fonts.ready;
		await Promise.all(
			[...document.images]
				.filter((img) => !img.complete)
				.map((img) => new Promise((done) => (img.onload = img.onerror = done))),
		);
	});
	await page.waitForTimeout(150);
}

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

if (!skipBuild || !existsSync(BUILD)) build();
if (!existsSync(BUILD)) throw new Error("нет build/ — сначала pnpm build");

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

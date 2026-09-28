import { readFileSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

import {
	BASE,
	ROOT,
	THEME_KEY,
	ensureBuild,
	serve,
	settle,
} from "./static-server.mjs";

const STATIC = join(ROOT, "static");
const SOURCE = join(ROOT, "refs", "icon.jpeg");
const TOKENS = join(ROOT, "src", "lib", "styles", "tokens.css");

const WIDTH = 1200;
const HEIGHT = 630;
const SCALE = 2;

function token(name) {
	const found = readFileSync(TOKENS, "utf8").match(
		new RegExp(`--${name}:([^;]+);`),
	);
	if (!found) throw new Error(`в tokens.css нет --${name}`);
	return found[1].trim();
}
function markup(origin) {
	const icon = `data:image/jpeg;base64,${readFileSync(SOURCE).toString("base64")}`;

	return `<!doctype html>
<html lang="ru">
	<head>
		<meta charset="utf-8" />
		<style>
			* { margin: 0; box-sizing: border-box; }
			body {
				width: ${WIDTH}px;
				height: ${HEIGHT}px;
				overflow: hidden;
				background:
					radial-gradient(
						circle at 12% 6%,
						${token("surface-canvas-glow")} 0,
						transparent 42%
					),
					${token("surface-canvas")};
				color: ${token("content-primary")};
				font-family: ${token("font-sans")};
			}
			.card {
				display: flex;
				align-items: center;
				gap: 72px;
				height: 100%;
				padding: 0 80px;
			}
			.brand {
				flex: 1;
				min-width: 0;
			}
			.brand__icon {
				width: 176px;
				height: 176px;
				border-radius: 42px;
			}
			.brand__name {
				margin-top: 40px;
				font-family: ${token("font-display")};
				font-size: 82px;
				line-height: 1;
				letter-spacing: -0.04em;
			}
			.brand__name span { color: ${token("content-accent-strong")}; }
			.brand__tag {
				margin-top: 20px;
				color: ${token("content-secondary")};
				font-size: 21px;
				letter-spacing: 0.25em;
				text-transform: uppercase;
			}
			.phone {
				width: 392px;
				height: ${HEIGHT}px;
				overflow: hidden;
				border: 1px solid ${token("border-strong")};
				border-radius: 40px;
				background: ${token("surface-base")};
				box-shadow: 0 30px 70px rgb(64 45 37 / 0.18);
			}
			iframe {
				display: block;
				width: 390px;
				height: 844px;
				border: 0;
			}
		</style>
	</head>
	<body>
		<div class="card">
			<div class="brand">
				<img class="brand__icon" src="${icon}" alt="" />
				<p class="brand__name">В<span>Домике</span></p>
				<p class="brand__tag">уютная доставка</p>
			</div>
			<div class="phone">
				<iframe src="${origin}${BASE}/" title=""></iframe>
			</div>
		</div>
	</body>
</html>`;
}

ensureBuild();

const { server, port } = await serve();
const origin = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();

try {
	const context = await browser.newContext({
		viewport: { width: WIDTH, height: HEIGHT },
		deviceScaleFactor: SCALE,
		reducedMotion: "reduce",
	});
	await context.addInitScript(
		([key, value]) => localStorage.setItem(key, value),
		[THEME_KEY, "light"],
	);

	const page = await context.newPage();
	await page.setContent(markup(origin), { waitUntil: "load" });
	await settle(page);
	await page.waitForTimeout(300);
	await page.screenshot({
		path: join(STATIC, "og.jpg"),
		type: "jpeg",
		quality: 88,
	});
	await context.close();
	process.stdout.write(`static/og.jpg ${WIDTH * SCALE}×${HEIGHT * SCALE}\n`);
} finally {
	await browser.close();
	server.close();
}

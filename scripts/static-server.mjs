import { spawnSync } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = fileURLToPath(new URL("..", import.meta.url));
export const BUILD = join(ROOT, "build");
export const OUT = join(ROOT, "docs", "images");
export const BASE = "/v-domike";
export const THEME_KEY = "vb-theme";

const TYPES = {
	".html": "text/html; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".json": "application/json; charset=utf-8",
	".webmanifest": "application/manifest+json",
	".svg": "image/svg+xml",
	".webp": "image/webp",
	".png": "image/png",
	".jpg": "image/jpeg",
	".ico": "image/x-icon",
	".txt": "text/plain; charset=utf-8",
};

export const skipBuild = process.argv.includes("--skip-build");

export function ensureBuild() {
	if (skipBuild && existsSync(BUILD)) return;
	const result = spawnSync("pnpm", ["build"], {
		cwd: ROOT,
		shell: true,
		stdio: "inherit",
	});
	if (result.status !== 0) process.exit(result.status ?? 1);
}

export function serve() {
	const server = createServer((req, res) => {
		const { pathname } = new URL(req.url, "http://localhost");
		const clean = pathname
			.replace(BASE, "")
			.replace(/^\/+/, "")
			.replace(/\/+$/, "");
		const file = [
			join(BUILD, clean),
			join(BUILD, `${clean}.html`),
			join(BUILD, clean, "index.html"),
		].find((try_) => existsSync(try_) && statSync(try_).isFile());

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

export async function settle(page) {
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

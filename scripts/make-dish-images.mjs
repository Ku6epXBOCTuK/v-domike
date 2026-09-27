/*
 * Снимки блюд: плейсхолдер и приведение фотографий к формату приложения.
 *
 *   pnpm images
 *
 * Владелец кладёт снимки в refs/dishes/ под именем блюда — `borsh.jpg`,
 * `tiramisu.png` — и запускает команду. Скрипт режет фото по центру в 600×682,
 * кодирует webp, кладёт в static/dishes/ и проставляет `image` в dishes.json.
 * Расширение любое из тех, что Chromium открывает. Исходники не трогает: тот же
 * файл можно перезалить, если кадр не понравился.
 *
 * Рисуем Chromium'ом, а не sharp: sharp в проекте нет, а playwright уже стоит
 * ради иконок, OG и скриншотов.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "static", "dishes");
const SOURCE = join(ROOT, "refs", "dishes");
const MENU = join(ROOT, "src", "lib", "data", "dishes.json");

const W = 600;
const H = 682;
const QUALITY = 0.8;

const MIME = {
	".avif": "image/avif",
	".gif": "image/gif",
	".jpeg": "image/jpeg",
	".jpg": "image/jpeg",
	".png": "image/png",
	".webp": "image/webp",
};

/*
 * Плейсхолдер — купол над блюдом, обведённый тонкой линией. Прозрачный и
 * домножается на тон блюда, поэтому у карточек без снимка остаётся свой цвет,
 * а не одинаковая серая плашка. Рисунок держим в среднем квадрате 600×600:
 * миниатюра в корзине кадрирует квадрат и не должна срезать купол.
 */
const PLACEHOLDER = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <g fill="none" stroke="#7a5a44" stroke-opacity="0.55" stroke-width="18" stroke-linecap="round">
    <path d="M150 401a150 150 0 0 1 300 0" />
    <path d="M124 401h352" />
  </g>
  <circle cx="300" cy="236" r="13" fill="#7a5a44" fill-opacity="0.55" />
</svg>`;

const menu = JSON.parse(readFileSync(MENU, "utf8"));
const byId = new Map(menu.dishes.map((dish) => [dish.id, dish]));

mkdirSync(OUT, { recursive: true });
const dropped = readdirSync(SOURCE, { withFileTypes: true });
const photos = dropped
	.filter((entry) => entry.isFile() && MIME[extname(entry.name).toLowerCase()])
	.map((entry) => ({
		id: entry.name.replace(/\.[^.]+$/, ""),
		file: join(SOURCE, entry.name),
		mime: MIME[extname(entry.name).toLowerCase()],
	}))
	.sort((a, b) => a.id.localeCompare(b.id));

// Молча пропущенный файл — это снимок, который не доедет до приложения.
for (const entry of dropped) {
	if (entry.isFile() && !entry.name.startsWith(".")) {
		const ext = extname(entry.name).toLowerCase();
		if (ext !== ".md" && !MIME[ext]) {
			process.stderr.write(
				`${join(SOURCE, entry.name)}: не картинка, формат не открыть\n`,
			);
		}
	}
}

const unknown = photos.filter(({ id }) => !byId.has(id));
if (unknown.length) {
	for (const { id, file } of unknown) {
		process.stderr.write(`${file}: нет блюда с id «${id}» в dishes.json\n`);
	}
	process.stderr.write(
		`\nИмя файла = id блюда. Подсказка: pnpm check:dishes печатает блюда без снимка.\n`,
	);
	process.exit(1);
}

function save(file, dataUrl) {
	writeFileSync(file, Buffer.from(dataUrl.split(",")[1], "base64"));
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<style>html,body{margin:0}</style>`);

async function encode(source, { fill }) {
	return page.evaluate(
		async ({ source, fill, w, h, quality }) => {
			const img = new Image();
			img.src = source;
			await img.decode();

			const canvas = document.createElement("canvas");
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext("2d");
			if (fill) {
				ctx.fillStyle = fill;
				ctx.fillRect(0, 0, w, h);
			}

			// Тот же object-fit: cover, что и в карточке, — иначе фото на экране
			// отличалось бы от того, что положил скрипт.
			const scale = Math.max(w / img.width, h / img.height);
			const dw = img.width * scale;
			const dh = img.height * scale;
			ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);

			return canvas.toDataURL("image/webp", quality);
		},
		{ source, fill, w: W, h: H, quality: QUALITY },
	);
}

try {
	save(
		join(OUT, "placeholder.webp"),
		await encode(
			`data:image/svg+xml;base64,${Buffer.from(PLACEHOLDER).toString("base64")}`,
			{ fill: null },
		),
	);
	process.stdout.write(`static/dishes/placeholder.webp ${W}×${H}\n`);

	for (const { id, file, mime } of photos) {
		const source = `data:${mime};base64,${readFileSync(file).toString("base64")}`;
		save(join(OUT, `${id}.webp`), await encode(source, { fill: "#fff" }));

		const dish = byId.get(id);
		const had = Boolean(dish.image);
		dish.image = `dishes/${id}.webp`;
		process.stdout.write(
			`static/dishes/${id}.webp ${had ? "заменён" : "новый"}\n`,
		);
	}

	writeFileSync(MENU, `${JSON.stringify(menu, null, "\t")}\n`);
} finally {
	await browser.close();
}

if (!photos.length) {
	process.stdout.write(
		`\nrefs/dishes пуст. Клади туда фото под именем блюда: borsh.jpg\n`,
	);
}
process.stdout.write("Блюда без снимка: pnpm check:dishes\n");

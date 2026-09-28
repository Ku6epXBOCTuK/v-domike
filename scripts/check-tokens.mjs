import { readFileSync } from "node:fs";
import { join } from "node:path";

import { ROOT } from "./static-server.mjs";

const CSS_PATH = join(ROOT, "src", "lib", "styles", "tokens.css");

const THEMES = { light: ":root", dark: '[data-theme="dark"]' };

function parseBlock(source, selector, from = 0) {
	const start = source.indexOf(`${selector} {`, from);
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
		];
	}
	throw new Error(`Не понимаю цвет: ${value}`);
}

function luminance([r, g, b]) {
	const f = (c) => {
		const s = c / 255;
		return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

const css = readFileSync(CSS_PATH, "utf8");
const parsed = Object.fromEntries(
	Object.entries(THEMES).map(([name, sel]) => [name, parseBlock(css, sel)]),
);

let failed = 0;

const darkTones = Object.keys(parsed.dark).filter((name) =>
	name.startsWith("--tone-"),
);
if (darkTones.length > 0) {
	console.error("FAIL  --tone-* переопределены в тёмной теме.");
	for (const name of darkTones) {
		console.error(
			`        ${name}: ${parsed.light[name]} -> ${parsed.dark[name]}   фото блюда погаснет`,
		);
	}
	failed++;
} else {
	console.log(
		"PASS  --tone-* в тёмной теме не переопределены (multiply-подложка должна быть светлой)",
	);
}

const MUST_FLIP = [
	{ name: "surface-inverse", from: "dark", to: "light" },
	{ name: "content-inverse", from: "light", to: "dark" },
];

for (const { name, from, to } of MUST_FLIP) {
	const light = luminance(parseColor(parsed.light[`--${name}`]));
	const dark = luminance(parseColor(parsed.dark[`--${name}`]));
	const ok =
		(from === "dark" ? light < 0.35 : light > 0.6) &&
		(to === "dark" ? dark < 0.35 : dark > 0.6);
	if (!ok) failed++;
	console.log(
		`${ok ? "PASS" : "FAIL"}  --${name.padEnd(16)} L ${light.toFixed(2)} -> ${dark.toFixed(2)}` +
			`  (ждём ${from} -> ${to})`,
	);
}

if (failed > 0) {
	console.error("");
	console.error(
		`Провалов: ${failed}. Светлая тема — только значения из :root.`,
	);
	process.exit(1);
}

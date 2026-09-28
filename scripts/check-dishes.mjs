import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DATA = join(ROOT, "src", "lib", "data", "dishes.json");
const STATIC = join(ROOT, "static");

const TONES = ["warm", "blush", "cream", "butter"];
const FIELDS = [
	"id",
	"name",
	"detail",
	"price",
	"image",
	"tone",
	"eta",
	"category",
];
const ETA = /^\d+–\d+ мин$/;
const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const menu = JSON.parse(readFileSync(DATA, "utf8"));
const problems = [];
const missing = [];
const ids = new Set();
const names = new Set();

const idsInMenu = new Set(menu.categories.map((item) => item.id));

for (const item of menu.categories) {
	if (!item.label) problems.push(`${item.id}: нет подписи`);
}

if (!idsInMenu.has("all")) problems.push('нет категории "all"');

for (const dish of menu.dishes) {
	const at = `${dish.id || "без id"}`;

	for (const field of FIELDS) {
		if (dish[field] === undefined) problems.push(`${at}: нет поля ${field}`);
	}
	for (const field of Object.keys(dish)) {
		if (!FIELDS.includes(field)) problems.push(`${at}: лишнее поле ${field}`);
	}

	if (ids.has(dish.id)) problems.push(`${at}: id уже встречается`);
	ids.add(dish.id);
	if (!ID.test(dish.id)) problems.push(`${at}: id не латиница в kebab-case`);

	if (names.has(dish.name)) problems.push(`${at}: название уже встречается`);
	names.add(dish.name);

	if (!dish.detail.includes("·"))
		problems.push(`${at}: состав без разделителя`);
	if (dish.price % 10 !== 0)
		problems.push(`${at}: цена ${dish.price} не кратна 10`);
	if (!TONES.includes(dish.tone))
		problems.push(`${at}: тон ${dish.tone} неизвестен`);
	if (!ETA.test(dish.eta))
		problems.push(`${at}: eta «${dish.eta}» не вида «15–20 мин»`);
	if (!idsInMenu.has(dish.category)) {
		problems.push(`${at}: категория ${dish.category} не объявлена`);
	}

	if (!dish.image) missing.push(at);
	else if (!existsSync(join(STATIC, dish.image)))
		problems.push(`${at}: файла ${dish.image} нет`);
}

const perCategory = menu.categories
	.filter((item) => item.id !== "all")
	.map(
		(item) =>
			`${item.label}: ${menu.dishes.filter((dish) => dish.category === item.id).length}`,
	);

console.log(
	`Блюд: ${menu.dishes.length}. По категориям — ${perCategory.join(", ")}`,
);

if (missing.length > 0) {
	console.log(`\nНет снимка (${missing.length}): ${missing.join(", ")}`);
}

if (problems.length > 0) {
	console.error(`\nПроблем с меню: ${problems.length}`);
	for (const problem of problems) console.error(`  ${problem}`);
	process.exit(1);
}

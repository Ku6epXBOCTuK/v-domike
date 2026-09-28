import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MENU = join(ROOT, "src", "lib", "data", "dishes.json");
const OUT = join(ROOT, "refs", "dishes-review.md");

const menu = JSON.parse(readFileSync(MENU, "utf8"));
const sections = menu.categories.filter((category) => category.id !== "all");

const text =
	`# Ревью фоток\n\n` +
	sections
		.map((category) => {
			const rows = menu.dishes
				.filter((dish) => dish.category === category.id)
				.map((dish) => `- [ ] ${dish.name}`);
			return `## ${category.label}\n\n${rows.join("\n")}\n`;
		})
		.join("\n");

writeFileSync(OUT, text);
process.stdout.write(`refs/dishes-review.md: ${menu.dishes.length}\n`);

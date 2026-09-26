import { beforeEach, describe, expect, it } from "vitest";

import { categories, dishes } from "#lib/data/dishes.js";
import { createAppState, THEME_STORAGE_KEY } from "./app.svelte.js";

function installDom(initialTheme = "light") {
	const doc = {
		documentElement: { dataset: { theme: initialTheme as string } },
	};
	const store = new Map<string, string>();
	const localStorage = {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => {
			store.set(key, value);
		},
	};
	Object.assign(globalThis, { document: doc, localStorage });
	return { doc, store };
}

describe("createAppState", () => {
	beforeEach(() => {
		installDom();
	});

	it("стартует на табе Меню с пустой корзиной и одним избранным", () => {
		const app = createAppState();

		expect(app.tab).toBe("menu");
		expect(app.isCartEmpty).toBe(true);
		expect(app.cartCount).toBe(0);
		expect(app.favoriteIds).toEqual(["latte"]);
	});

	it("фильтрует visibleDishes по категории, «Всё» не фильтрует", () => {
		const app = createAppState();

		expect(app.visibleDishes).toHaveLength(dishes.length);

		app.category = "drinks";
		expect(app.visibleDishes.map((d) => d.id)).toEqual(["latte"]);

		app.category = "warming";
		expect(app.visibleDishes.map((d) => d.id)).toEqual(["ramen", "pizza"]);

		app.category = "sweets";
		expect(app.visibleDishes.map((d) => d.id)).toEqual(["dessert"]);
	});

	it("имеет по одной категории на каждый id из categories", () => {
		const seen = new Set(dishes.map((d) => d.category));
		const declared = new Set(
			categories.filter((c) => c.id !== "all").map((c) => c.id),
		);

		expect([...seen].sort()).toEqual([...declared].sort());
	});

	it("add() кладёт блюдо в корзину и допускает дубли", () => {
		const app = createAppState();

		app.add("ramen");
		app.add("ramen");

		expect(app.cartCount).toBe(2);
		expect(app.cart.map((d) => d.id)).toEqual(["ramen", "ramen"]);
		expect(app.cart[0]).toBe(dishes[0]);
	});

	it("add() с неизвестным id не меняет корзину", () => {
		const app = createAppState();

		app.add("nope");

		expect(app.cartCount).toBe(0);
	});

	it("toggleFavorite() добавляет и убирает, не плодя дубли", () => {
		const app = createAppState();

		app.toggleFavorite("ramen");
		expect(app.favoriteIds).toEqual(["latte", "ramen"]);

		app.toggleFavorite("latte");
		expect(app.favoriteIds).toEqual(["ramen"]);

		app.toggleFavorite("ramen");
		expect(app.favoriteIds).toEqual([]);
	});

	it("favoriteDishes выводится из favoriteIds и идёт в порядке каталога", () => {
		const app = createAppState();

		app.toggleFavorite("pizza");
		app.toggleFavorite("ramen");

		expect(app.favoriteIds).toEqual(["latte", "pizza", "ramen"]);
		expect(app.favoriteDishes.map((d) => d.id)).toEqual([
			"ramen",
			"latte",
			"pizza",
		]);
	});

	it("toggleTheme() переключает тему и пишет её в DOM и localStorage", () => {
		const { doc, store } = installDom();
		const app = createAppState();

		expect(app.theme).toBe("light");

		app.toggleTheme();
		expect(app.theme).toBe("dark");
		expect(doc.documentElement.dataset.theme).toBe("dark");
		expect(store.get(THEME_STORAGE_KEY)).toBe("dark");

		app.toggleTheme();
		expect(app.theme).toBe("light");
		expect(doc.documentElement.dataset.theme).toBe("light");
		expect(store.get(THEME_STORAGE_KEY)).toBe("light");
	});

	it("читает стартовую тему из data-theme, который ставит app.html", () => {
		installDom("dark");
		const app = createAppState();

		expect(app.theme).toBe("dark");
	});

	it("выживает, когда localStorage кидает (приватный режим)", () => {
		installDom();
		Object.assign(globalThis, {
			localStorage: {
				getItem: () => null,
				setItem: () => {
					throw new Error("QuotaExceededError");
				},
			},
		});
		const app = createAppState();

		app.toggleTheme();

		expect(app.theme).toBe("dark");
	});
});

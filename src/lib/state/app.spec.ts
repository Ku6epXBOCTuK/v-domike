import { beforeEach, describe, expect, it } from "vitest";

import { categories, dishes } from "#lib/data/dishes.js";
import {
	createAppState,
	CART_STORAGE_KEY,
	TABS,
	THEME_STORAGE_KEY,
} from "./app.svelte.js";

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

	it("стартует с категорией «всё», пустой корзиной и одним избранным", () => {
		const app = createAppState();

		expect(app.category).toBe("all");
		expect(app.isCartEmpty).toBe(true);
		expect(app.cartCount).toBe(0);
		expect(app.favoriteIds).toEqual(["latte"]);
	});

	it("TABS покрывает четыре маршрута и совпадает с роутами", () => {
		expect(TABS.map((t) => t.path)).toEqual([
			"/",
			"/order",
			"/favorites",
			"/profile",
		]);
		expect(TABS.map((t) => t.label)).toEqual([
			"Меню",
			"Заказ",
			"Любимое",
			"Профиль",
		]);
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

	it("корзина переживает перезагрузку: в хранилище id, обратно — ссылки на каталог", () => {
		const { store } = installDom();
		const app = createAppState();

		app.add("ramen");
		app.add("latte");
		app.add("ramen");

		expect(store.get(CART_STORAGE_KEY)).toBe('["ramen","latte","ramen"]');

		// Новый инстанс — это перезагрузка страницы: модуль создан заново.
		const reloaded = createAppState();

		expect(reloaded.cart.map((d) => d.id)).toEqual(["ramen", "latte", "ramen"]);
		expect(reloaded.cart[0]).toBe(dishes.find((d) => d.id === "ramen"));
		expect(reloaded.isCartEmpty).toBe(false);
	});

	it("выкидывает из хранилища всё, чего нет в каталоге", () => {
		const { store } = installDom();
		store.set(CART_STORAGE_KEY, '["ramen","нет-такого",42,null,["ramen"]]');

		const app = createAppState();

		expect(app.cart.map((d) => d.id)).toEqual(["ramen"]);
	});

	it("битое значение в хранилище даёт пустую корзину, а не падение", () => {
		const { store } = installDom();
		store.set(CART_STORAGE_KEY, "{не json");

		expect(createAppState().isCartEmpty).toBe(true);

		store.set(CART_STORAGE_KEY, '{"ramen":1}');
		expect(createAppState().isCartEmpty).toBe(true);
	});

	it("add() переживает приватный режим: корзина есть, записи нет", () => {
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

		app.add("ramen");

		expect(app.cart.map((d) => d.id)).toEqual(["ramen"]);
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

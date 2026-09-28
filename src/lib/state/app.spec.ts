import { beforeEach, describe, expect, it } from "vitest";

import { categories, dishes } from "#lib/data/dishes.js";
import {
	createAppState,
	CART_STORAGE_KEY,
	COOK_MS,
	DELIVER_MS,
	FAVORITES_STORAGE_KEY,
	orderPhase,
	ORDER_STORAGE_KEY,
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
		removeItem: (key: string) => {
			store.delete(key);
		},
	};
	Object.assign(globalThis, { document: doc, localStorage });
	return { doc, store };
}

describe("createAppState", () => {
	beforeEach(() => {
		installDom();
	});

	it("стартует с категорией «всё» и пустыми корзиной и избранным", () => {
		const app = createAppState();

		expect(app.category).toBe("all");
		expect(app.isCartEmpty).toBe(true);
		expect(app.cartCount).toBe(0);
		expect(app.favoriteIds).toEqual([]);
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

		for (const category of ["soups", "pasta", "desserts", "drinks"] as const) {
			app.category = category;

			expect(app.visibleDishes.length).toBeGreaterThan(0);
			expect(app.visibleDishes.every((d) => d.category === category)).toBe(
				true,
			);
		}
	});

	it("имеет по одной категории на каждый id из categories", () => {
		const seen = new Set(dishes.map((d) => d.category));
		const declared = new Set(
			categories.filter((c) => c.id !== "all").map((c) => c.id),
		);

		expect([...seen].sort()).toEqual([...declared].sort());
	});

	it("add() увеличивает количество, remove() уменьшает и убирает на нуле", () => {
		const app = createAppState();

		app.add("ramen");
		app.add("ramen");
		app.add("latte");

		expect(app.cartLines.map((l) => [l.dish.id, l.count])).toEqual([
			["ramen", 2],
			["latte", 1],
		]);
		expect(app.cartCount).toBe(3);

		app.remove("ramen");
		expect(app.cartLines.map((l) => [l.dish.id, l.count])).toEqual([
			["ramen", 1],
			["latte", 1],
		]);

		app.remove("ramen");
		expect(app.cartLines.map((l) => l.dish.id)).toEqual(["latte"]);
		expect(app.isCartEmpty).toBe(false);
	});

	it("add() с неизвестным id не меняет корзину", () => {
		const app = createAppState();

		app.add("nope");

		expect(app.cartCount).toBe(0);
	});

	it("корзина переживает перезагрузку, в хранилище id и количество", () => {
		const { store } = installDom();
		const app = createAppState();

		app.add("ramen");
		app.add("ramen");
		app.add("latte");

		expect(store.get(CART_STORAGE_KEY)).toBe(
			'[{"id":"ramen","count":2},{"id":"latte","count":1}]',
		);

		const reloaded = createAppState();

		expect(reloaded.cartLines.map((l) => [l.dish.id, l.count])).toEqual([
			["ramen", 2],
			["latte", 1],
		]);
		expect(reloaded.cartLines[0].dish).toBe(
			dishes.find((d) => d.id === "ramen"),
		);
	});

	it("старый формат корзины пересчитывается в количества, мусор отбрасывается", () => {
		const { store } = installDom();
		store.set(CART_STORAGE_KEY, '["ramen","ramen","latte","нет-такого",42]');

		const app = createAppState();

		expect(app.cartLines.map((l) => [l.dish.id, l.count])).toEqual([
			["ramen", 2],
			["latte", 1],
		]);
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
				removeItem: () => {},
			},
		});
		const app = createAppState();

		app.add("ramen");

		expect(app.cartLines.map((l) => l.dish.id)).toEqual(["ramen"]);
	});

	it("placeOrder() переносит состав в заказ, чистит корзину, итог считается по каталогу", () => {
		const { store } = installDom();
		const app = createAppState();

		app.add("ramen");
		app.add("ramen");
		app.add("latte");
		app.placeOrder();

		expect(app.isCartEmpty).toBe(true);
		expect(store.get(CART_STORAGE_KEY)).toBe("[]");
		expect(app.orderLines.map((l) => [l.dish.id, l.count])).toEqual([
			["ramen", 2],
			["latte", 1],
		]);
		expect(app.orderTotal).toBe(420 * 2 + 280);

		app.clearOrder();

		expect(app.order).toBe(null);
		expect(store.get(ORDER_STORAGE_KEY)).toBe(undefined);
	});

	it("orderPhase: сначала кухня, потом курьер, потом доставлено", () => {
		const placedAt = 1_000_000;

		expect(orderPhase(placedAt, placedAt)).toBe("cooking");
		expect(orderPhase(placedAt, placedAt + COOK_MS - 1)).toBe("cooking");
		expect(orderPhase(placedAt, placedAt + COOK_MS)).toBe("delivering");
		expect(orderPhase(placedAt, placedAt + COOK_MS + DELIVER_MS - 1)).toBe(
			"delivering",
		);
		expect(orderPhase(placedAt, placedAt + COOK_MS + DELIVER_MS)).toBe(
			"delivered",
		);
		expect(orderPhase(placedAt, placedAt + COOK_MS + DELIVER_MS + 60_000)).toBe(
			"delivered",
		);
	});

	it("toggleFavorite() добавляет и убирает, не плодя дубли", () => {
		const app = createAppState();

		app.toggleFavorite("ramen");
		expect(app.favoriteIds).toEqual(["ramen"]);

		app.toggleFavorite("pizza");
		expect(app.favoriteIds).toEqual(["ramen", "pizza"]);

		app.toggleFavorite("ramen");
		expect(app.favoriteIds).toEqual(["pizza"]);
	});

	it("favoriteDishes выводится из favoriteIds и идёт в порядке каталога", () => {
		const app = createAppState();

		app.toggleFavorite("pizza");
		app.toggleFavorite("ramen");

		expect(app.favoriteIds).toEqual(["pizza", "ramen"]);
		expect(app.favoriteDishes.map((d) => d.id)).toEqual(["ramen", "pizza"]);
	});

	it("избранное переживает перезагрузку", () => {
		const { store } = installDom();
		const app = createAppState();

		app.toggleFavorite("ramen");
		app.toggleFavorite("pizza");
		app.toggleFavorite("ramen");

		expect(store.get(FAVORITES_STORAGE_KEY)).toBe('["pizza"]');

		expect(createAppState().favoriteIds).toEqual(["pizza"]);
	});

	it("снятая отметка не возвращается после перезагрузки", () => {
		const { store } = installDom();
		const app = createAppState();

		app.toggleFavorite("latte");
		app.toggleFavorite("latte");
		expect(store.get(FAVORITES_STORAGE_KEY)).toBe("[]");

		const reloaded = createAppState();

		expect(reloaded.favoriteIds).toEqual([]);
		expect(reloaded.favoriteDishes).toEqual([]);
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

import { dishes, type CategoryId, type Dish } from "#lib/data/dishes.js";

export const TABS = [
	{ id: "menu", path: "/", label: "Меню" },
	{ id: "order", path: "/order", label: "Заказ" },
	{ id: "favorites", path: "/favorites", label: "Любимое" },
	{ id: "profile", path: "/profile", label: "Профиль" },
] as const;

export type Tab = (typeof TABS)[number]["id"];

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "vb-theme";

export const CART_STORAGE_KEY = "vb-cart";

export const FAVORITES_STORAGE_KEY = "vb-favorites";

export const ORDER_STORAGE_KEY = "vb-order";

/* Хранится id и количество, а не сам Dish: цена и ETA берутся из каталога и
   потому не могут устареть. Порядок строк — порядок добавления, как в baskets. */
export type CartLine = { id: string; count: number };

/* То же, но уже развёрнутое в каталог — так это видно на экране. */
export type CartEntry = { dish: Dish; count: number };

/* Оформленный заказ — снимок корзины на момент оформления. Корзина после
   оформления пустая, поэтому состав заказа живёт здесь. */
export type PlacedOrder = { lines: CartLine[]; placedAt: number };

export type OrderPhase = "cooking" | "delivering" | "delivered";

/* Фазы заказа: сорок процентов на кухню, остальное курьеру. */
export const COOK_MS = 4 * 60 * 1000;

export const DELIVER_MS = 6 * 60 * 1000;

const catalog = new Map(dishes.map((dish) => [dish.id, dish]));

function readStoredTheme(): Theme {
	if (typeof document === "undefined") return "light";
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function persistTheme(theme: Theme) {
	if (typeof document === "undefined") return;
	document.documentElement.dataset.theme = theme;
	try {
		localStorage.setItem(THEME_STORAGE_KEY, theme);
	} catch {
		// Приватный режим или переполненное хранилище — тема живёт только в DOM.
	}
}

/*
 * Раньше корзина лежала списком id, где повтор означал количество: ["ramen",
 * "ramen"] — это две рамэна. Такой формат пересчитывается в строки, а всё, чего
 * нет в каталоге, отбрасывается: между версиями блюда могли исчезнуть.
 */
function readStoredCart(): CartLine[] {
	if (typeof document === "undefined") return [];
	let parsed: unknown;
	try {
		parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
	} catch {
		// Приватный режим или битое значение — начинаем с пустой корзины.
		return [];
	}
	if (!Array.isArray(parsed)) return [];

	const lines: CartLine[] = [];
	for (const item of parsed) {
		const asString = typeof item === "string";
		const asObject = typeof item === "object" && item !== null;
		const id = asString
			? (item as string)
			: asObject
				? (item as { id?: unknown }).id
				: undefined;
		const count = asObject ? (item as { count?: unknown }).count : 1;
		if (
			typeof id !== "string" ||
			!catalog.has(id) ||
			typeof count !== "number" ||
			count < 1
		) {
			continue;
		}
		const line = lines.find((entry) => entry.id === id);
		if (line) line.count += count;
		else lines.push({ id, count });
	}
	return lines;
}

function persistCart(cart: CartLine[]) {
	if (typeof document === "undefined") return;
	try {
		localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
	} catch {
		// Приватный режим или переполненное хранилище — корзина живёт до перезагрузки.
	}
}

function readStoredFavorites(): string[] {
	if (typeof document === "undefined") return [];
	try {
		const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
		if (raw === null) return [];
		const ids: unknown = JSON.parse(raw);
		if (!Array.isArray(ids)) return [];
		return ids
			.filter((id): id is string => typeof id === "string")
			.filter((id) => catalog.has(id));
	} catch {
		// Приватный режим или битое значение — просто пустое избранное.
		return [];
	}
}

function persistFavorites(ids: string[]) {
	if (typeof document === "undefined") return;
	try {
		localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
	} catch {
		// Приватный режим или переполненное хранилище — избранное живёт до перезагрузки.
	}
}

function readStoredOrder(): PlacedOrder | null {
	if (typeof document === "undefined") return null;
	try {
		const parsed: unknown = JSON.parse(
			localStorage.getItem(ORDER_STORAGE_KEY) ?? "null",
		);
		if (typeof parsed !== "object" || parsed === null) return null;
		const { lines, placedAt } = parsed as Partial<PlacedOrder>;
		if (!Array.isArray(lines) || typeof placedAt !== "number") return null;
		const known = lines.filter(
			(line): line is CartLine =>
				typeof line?.id === "string" &&
				catalog.has(line.id) &&
				typeof line.count === "number" &&
				line.count > 0,
		);
		return known.length > 0 ? { lines: known, placedAt } : null;
	} catch {
		// Приватный режим или битое значение — заказа нет.
		return null;
	}
}

function persistOrder(order: PlacedOrder | null) {
	if (typeof document === "undefined") return;
	try {
		if (order) localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
		else localStorage.removeItem(ORDER_STORAGE_KEY);
	} catch {
		// Приватный режим или переполненное хранилище — заказ живёт до перезагрузки.
	}
}

/* Фаза выводится из часов, а не из таймера в состоянии: заказ переживает
   перезагрузку и закрытую вкладку, а рассинхронизации быть не может. */
export function orderPhase(placedAt: number, now: number): OrderPhase {
	const since = now - placedAt;
	if (since < COOK_MS) return "cooking";
	if (since < COOK_MS + DELIVER_MS) return "delivering";
	return "delivered";
}

function toLines(lines: CartLine[]): CartEntry[] {
	return lines.flatMap((line) => {
		const dish = catalog.get(line.id);
		return dish ? [{ dish, count: line.count }] : [];
	});
}

function totalOf(lines: CartLine[]): number {
	return toLines(lines).reduce(
		(sum, line) => sum + line.dish.price * line.count,
		0,
	);
}

export function createAppState() {
	let category = $state<CategoryId>("all");
	let cart = $state<CartLine[]>(readStoredCart());
	let favoriteIds = $state<string[]>(readStoredFavorites());
	let theme = $state<Theme>(readStoredTheme());
	let order = $state<PlacedOrder | null>(readStoredOrder());

	/* Любая мутация корзины и заказа обязана заканчиваться persist — иначе
	   хранилище разойдётся с тем, что на экране. */
	function add(id: string) {
		if (!catalog.has(id)) return;
		const line = cart.find((entry) => entry.id === id);
		if (line) line.count += 1;
		else cart.push({ id, count: 1 });
		persistCart(cart);
	}

	function remove(id: string) {
		const line = cart.find((entry) => entry.id === id);
		if (!line) return;
		if (line.count > 1) line.count -= 1;
		else cart = cart.filter((entry) => entry.id !== id);
		persistCart(cart);
	}

	function placeOrder() {
		if (cart.length === 0) return;
		order = { lines: cart.map((line) => ({ ...line })), placedAt: Date.now() };
		cart = [];
		persistOrder(order);
		persistCart(cart);
	}

	function clearOrder() {
		order = null;
		persistOrder(order);
	}

	function toggleFavorite(id: string) {
		favoriteIds = favoriteIds.includes(id)
			? favoriteIds.filter((item) => item !== id)
			: [...favoriteIds, id];
		persistFavorites(favoriteIds);
	}

	function setTheme(next: Theme) {
		theme = next;
		persistTheme(next);
	}

	return {
		get category() {
			return category;
		},
		set category(value: CategoryId) {
			category = value;
		},

		get theme() {
			return theme;
		},

		get cartLines() {
			return toLines(cart);
		},

		get cartCount() {
			return cart.reduce((sum, line) => sum + line.count, 0);
		},

		get cartTotal() {
			return totalOf(cart);
		},

		get isCartEmpty() {
			return cart.length === 0;
		},

		get order() {
			return order;
		},

		get orderLines() {
			return order ? toLines(order.lines) : [];
		},

		get orderTotal() {
			return order ? totalOf(order.lines) : 0;
		},

		get favoriteIds() {
			return favoriteIds;
		},

		get visibleDishes() {
			return category === "all"
				? dishes
				: dishes.filter((dish) => dish.category === category);
		},

		get favoriteDishes() {
			return dishes.filter((dish) => favoriteIds.includes(dish.id));
		},

		add,
		remove,
		placeOrder,
		clearOrder,
		toggleFavorite,
		setTheme,

		toggleTheme() {
			setTheme(theme === "dark" ? "light" : "dark");
		},
	};
}

export type AppState = ReturnType<typeof createAppState>;

/*
 * Синглтон приложения. Один на все роуты: SvelteKit перехватывает клик по
 * внутренней ссылке и делает клиентскую навигацию, поэтому модуль не
 * перезагружается и корзина с избранным переживают переход между страницами.
 * Перезагрузку страницы переживают все: тема, корзина, избранное и оформленный
 * заказ читаются из localStorage.
 *
 * createAppState() экспортируется отдельно, чтобы тесты работали на свежих
 * экземплярах и не делили состояние.
 */
export const app: AppState = createAppState();

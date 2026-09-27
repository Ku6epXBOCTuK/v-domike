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
 * В хранилище лежат только id, а не объекты блюд: корзина ссылается на каталог,
 * поэтому цена и ETA в ней не могут устареть. Всё, чего нет в каталоге, тихо
 * отбрасывается — между версиями блюда могли переехать или исчезнуть.
 */
function readStoredCart(): Dish[] {
	if (typeof document === "undefined") return [];
	try {
		const raw = localStorage.getItem(CART_STORAGE_KEY);
		if (!raw) return [];
		const ids: unknown = JSON.parse(raw);
		if (!Array.isArray(ids)) return [];
		return ids
			.filter((id): id is string => typeof id === "string")
			.map((id) => catalog.get(id))
			.filter((dish): dish is Dish => Boolean(dish));
	} catch {
		// Приватный режим или битое значение — начинаем с пустой корзины.
		return [];
	}
}

function persistCart(cart: Dish[]) {
	if (typeof document === "undefined") return;
	try {
		localStorage.setItem(
			CART_STORAGE_KEY,
			JSON.stringify(cart.map((d) => d.id)),
		);
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

export function createAppState() {
	let category = $state<CategoryId>("all");
	const cart = $state<Dish[]>(readStoredCart());
	let favoriteIds = $state<string[]>(readStoredFavorites());
	let theme = $state<Theme>(readStoredTheme());

	/* Любая мутация корзины обязана заканчиваться persistCart — иначе id из
	   хранилища разойдутся с тем, что на экране. */
	function add(id: string) {
		const dish = catalog.get(id);
		if (!dish) return;
		cart.push(dish);
		persistCart(cart);
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

		get cart() {
			return cart;
		},

		get cartCount() {
			return cart.length;
		},

		get favoriteIds() {
			return favoriteIds;
		},

		get isCartEmpty() {
			return cart.length === 0;
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
 * Перезагрузку страницы переживают все три: тема, корзина и избранное читаются
 * из localStorage.
 *
 * createAppState() экспортируется отдельно, чтобы тесты работали на свежих
 * экземплярах и не делили состояние.
 */
export const app: AppState = createAppState();

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

export function createAppState() {
	let category = $state<CategoryId>("all");
	const cart = $state<Dish[]>([]);
	let favoriteIds = $state<string[]>(["latte"]);
	let theme = $state<Theme>(readStoredTheme());

	function add(id: string) {
		const dish = catalog.get(id);
		if (dish) cart.push(dish);
	}

	function toggleFavorite(id: string) {
		favoriteIds = favoriteIds.includes(id)
			? favoriteIds.filter((item) => item !== id)
			: [...favoriteIds, id];
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
 *
 * createAppState() экспортируется отдельно, чтобы тесты работали на свежих
 * экземплярах и не делили состояние.
 */
export const app: AppState = createAppState();

export type DishTone = "warm" | "blush" | "cream" | "butter";

export type CategoryId = "all" | "warming" | "sweets" | "drinks";
export type DishCategory = Exclude<CategoryId, "all">;

export type Dish = {
	id: string;
	name: string;
	detail: string;
	price: number;
	image: string;
	tone: DishTone;
	eta: string;
	category: DishCategory;
};

export const categories: { id: CategoryId; label: string }[] = [
	{ id: "all", label: "Всё" },
	{ id: "warming", label: "Согревающие" },
	{ id: "sweets", label: "Сладкое" },
	{ id: "drinks", label: "Напитки" },
];

export const dishes: Dish[] = [
	{
		id: "ramen",
		name: "Нежный рамён",
		detail: "мисо · яйцо · нори",
		price: 420,
		image: "/dishes/ramen.webp",
		tone: "warm",
		eta: "15–20 мин",
		category: "warming",
	},
	{
		id: "latte",
		name: "Розовый матча",
		detail: "клубника · овсяное молоко",
		price: 280,
		image: "/dishes/latte.webp",
		tone: "blush",
		eta: "5–10 мин",
		category: "drinks",
	},
	{
		id: "dessert",
		name: "Клубничный торт",
		detail: "сливки · ваниль · ягоды",
		price: 350,
		image: "/dishes/dessert.webp",
		tone: "cream",
		eta: "15–20 мин",
		category: "sweets",
	},
	{
		id: "pizza",
		name: "Пицца из печи",
		detail: "моцарелла · базилик",
		price: 590,
		image: "/dishes/pizza.webp",
		tone: "butter",
		eta: "15–20 мин",
		category: "warming",
	},
];

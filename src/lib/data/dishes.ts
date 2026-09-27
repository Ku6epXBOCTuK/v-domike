import { asset } from "$app/paths";
import type { AssetPath } from "$app/types";

import data from "./dishes.json";

export type DishTone = "warm" | "blush" | "cream" | "butter";

export type CategoryId = "all" | "soups" | "pasta" | "desserts" | "drinks";
export type DishCategory = Exclude<CategoryId, "all">;

export type Category = { id: CategoryId; label: string };

/*
 * Форма блюда объявлена здесь, а проверяет её scripts/check-dishes.mjs:
 * импорт JSON типизируется как `string` на любое поле, поэтому состав типов
 * компилятор подтвердить не может.
 */
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

export const categories = data.categories as Category[];

export const dishes = data.dishes as Dish[];

export const dishImage = (file: string) => asset(file as AssetPath);

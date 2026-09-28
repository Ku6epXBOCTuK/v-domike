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

/*
 * Плейсхолдер лежит в static/, поэтому AssetPath его знает так же, как любой
 * снимок. Прозрачный и домножается на тон блюда: у карточки без фотографии
 * остаётся свой цвет, а не одинаковая плашка.
 */
const PLACEHOLDER: AssetPath = "dishes/placeholder.webp";

export const dishImage = (file: string) =>
	asset((file || PLACEHOLDER) as AssetPath);

/*
 * Уменьшенная копия лежит рядом: `-450`. Её пишет pnpm images, поэтому файла
 * может не быть — тогда srcset пуст и карточка берёт обычный. Пути собираются
 * через asset(): написанный руками srcset пререндер разрешил бы относительно
 * текущего маршрута, а не базы.
 */
export const dishSrcset = (file: string) => {
	if (!file) return undefined;
	const small = file.replace(/\.webp$/, "-450.webp") as AssetPath;
	return `${asset(small)} 450w, ${asset(file as AssetPath)} 600w`;
};

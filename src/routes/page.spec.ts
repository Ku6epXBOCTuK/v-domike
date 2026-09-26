import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import { dishes } from "#lib/data/dishes.js";

import Page from "./+page.svelte";

const body = render(Page, { props: {} }).body;

describe("+page.svelte", () => {
	it("собирает шелл: фрейм, шапка со wordmark, контент, плавающий навгарь", () => {
		expect(body).toContain("<main");
		expect(body).toContain("app__frame");
		expect(body).toContain("app-header");
		expect(body).toContain(">bite</span>");
		expect(body).toContain("app__content");
		expect(body).toContain("bottom-nav");
	});

	it("стартует на табе Меню", () => {
		expect(body).toContain("Добрый вечер, Аня");
		expect(body).toContain("Маленькие радости");
		expect(body).not.toContain("Примерное прибытие");
	});

	it("показывает все блюда и все четыре категории", () => {
		for (const dish of dishes) {
			expect(body).toContain(dish.name);
			expect(body).toContain(`${dish.price} coins`);
		}
		expect(body.match(/class="chip(?: |")/g)?.length).toBe(4);
	});

	it("отдаёт четыре таба в навигации с активным Меню", () => {
		expect(body.match(/class="nav-item(?: |")/g)?.length).toBe(4);
		expect(body).toContain('aria-current="page"');
	});

	it("рисует цитату про пустую корзину и не рисует бейдж заказа", () => {
		expect(body).toContain("Еда — это язык");
		expect(body).not.toContain("nav-item__badge");
	});

	it("проставляет tone блюда через data-tone, а не классом Tailwind", () => {
		for (const dish of dishes) {
			expect(body).toContain(`data-tone="${dish.tone}"`);
		}
		expect(body).not.toContain("bg-[#");
	});

	it("передаёт доступные имена кнопкам шапки", () => {
		expect(body).toContain("Включить кавайную тёмную тему");
		expect(body).toContain('aria-label="Уведомления"');
	});

	it("ставит title и description в head", () => {
		const { head } = render(Page, { props: {} });
		expect(head).toContain("VirtualBite — уют рядом");
		expect(head).toContain("Виртуальная доставка уютных блюд");
	});
});

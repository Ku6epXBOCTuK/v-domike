import type { ComponentProps } from "svelte";
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import IconHeart from "~icons/lucide/heart";
import { dishes, type CategoryId } from "#lib/data/dishes.js";
import { profileLinks } from "#lib/data/profile.js";

import DeliveryMap from "./DeliveryMap.svelte";
import DishCard from "./DishCard.svelte";
import EtaPanel from "./EtaPanel.svelte";
import FavoritesTab from "./FavoritesTab.svelte";
import IdentityCard from "./IdentityCard.svelte";
import MapMarker from "./MapMarker.svelte";
import MenuTab from "./MenuTab.svelte";
import OrderTab from "./OrderTab.svelte";
import ProfileRow from "./ProfileRow.svelte";
import ProfileTab from "./ProfileTab.svelte";

const noop = () => {};

function hasClass(body: string, name: string) {
	return new RegExp(`class="(?:[^"]* )?${name}(?: |")`).test(body);
}

const ramen = dishes[0];
const latte = dishes[1];

describe("DishCard", () => {
	it("рендерит имя, деталь, цену и ETA из данных", () => {
		const { body } = render(DishCard, {
			props: { dish: ramen, favorite: false, onFavorite: noop, onAdd: noop },
		});

		expect(body).toContain(ramen.name);
		expect(body).toContain(ramen.detail);
		expect(body).toContain(`${ramen.price} coins`);
		expect(body).toContain(ramen.eta);
	});

	it("мапит tone в data-tone, а не в класс Tailwind", () => {
		for (const dish of dishes) {
			const { body } = render(DishCard, {
				props: { dish, favorite: false, onFavorite: noop, onAdd: noop },
			});
			expect(body).toContain(`data-tone="${dish.tone}"`);
		}
	});

	it("даёт картинке alt из названия блюда", () => {
		const { body } = render(DishCard, {
			props: { dish: ramen, favorite: false, onFavorite: noop, onAdd: noop },
		});

		expect(body).toContain(`alt="${ramen.name}"`);
		expect(body).toContain(ramen.image);
	});

	it("переключает aria-label и aria-pressed сердца по favorite", () => {
		const off = render(DishCard, {
			props: { dish: ramen, favorite: false, onFavorite: noop, onAdd: noop },
		});
		expect(off.body).toContain(`Добавить ${ramen.name} в любимое`);
		expect(off.body).toContain('aria-pressed="false"');

		const on = render(DishCard, {
			props: { dish: ramen, favorite: true, onFavorite: noop, onAdd: noop },
		});
		expect(on.body).toContain(`Убрать ${ramen.name} из любимого`);
		expect(on.body).toContain('aria-pressed="true"');
	});

	it("подписи кнопок содержат название блюда", () => {
		const { body } = render(DishCard, {
			props: { dish: latte, favorite: false, onFavorite: noop, onAdd: noop },
		});

		expect(body).toContain(`aria-label="Добавить ${latte.name}"`);
	});
});

describe("MapMarker", () => {
	it("подписан через role=img и aria-label", () => {
		const { body } = render(MapMarker, {
			props: { variant: "courier", icon: IconHeart, label: "Курьер Минсу" },
		});

		expect(body).toContain('role="img"');
		expect(body).toContain('aria-label="Курьер Минсу"');
		expect(body).toContain('data-variant="courier"');
	});
});

describe("DeliveryMap", () => {
	it("рисует сетку, маршрут, точку, оба маркера и подпись", () => {
		const { body } = render(DeliveryMap, {});

		expect(hasClass(body, "delivery-map__grid")).toBe(true);
		expect(hasClass(body, "delivery-map__route")).toBe(true);
		expect(hasClass(body, "delivery-map__dot")).toBe(true);
		expect(body).toContain('data-variant="home"');
		expect(body).toContain('data-variant="courier"');
		expect(body).toContain("Курьер Минсу уже близко");
	});
});

describe("EtaPanel", () => {
	it("рендерит оверлайн, значение и пояснение", () => {
		const { body } = render(EtaPanel, {});

		expect(body).toContain("Примерное прибытие");
		expect(body).toContain("через 3 минуты");
		expect(body).toContain("Можно выдохнуть и никуда не спешить.");
		expect(body).toContain('data-variant="panel"');
	});
});

describe("IdentityCard", () => {
	it("рендерит данные профиля", () => {
		const { body } = render(IdentityCard, {});

		expect(body).toContain("Аня");
		expect(body).toContain("Member since 2024");
		expect(body).toContain(">А<");
	});
});

describe("ProfileRow", () => {
	it("рендерит подпись для каждой строки профиля", () => {
		for (const link of profileLinks) {
			const { body } = render(ProfileRow, {
				props: { label: link.label, icon: link.icon },
			});
			expect(body).toContain(link.label);
			expect(body).toContain("<button");
		}
	});
});

describe("MenuTab", () => {
	function props(over: Partial<ComponentProps<typeof MenuTab>> = {}) {
		return {
			dishes,
			category: "all" as CategoryId,
			favoriteIds: ["latte"],
			cartIsEmpty: true,
			onCategory: noop,
			onFavorite: noop,
			onAdd: noop,
			onOpenOrder: noop,
			...over,
		};
	}

	it("рендерит все четыре категории-чипа", () => {
		const { body } = render(MenuTab, { props: props() });
		expect(body.match(/class="chip/g)?.length).toBe(4);
	});

	it("помечает выбранную категорию единственной активной", () => {
		const { body } = render(MenuTab, { props: props({ category: "drinks" }) });
		expect(body.match(/data-active="true"/g)?.length).toBe(1);
	});

	it("показывает цитату только при пустой корзине", () => {
		const empty = render(MenuTab, { props: props({ cartIsEmpty: true }) });
		expect(empty.body).toContain("Еда — это язык");

		const full = render(MenuTab, { props: props({ cartIsEmpty: false }) });
		expect(full.body).not.toContain("Еда — это язык");
	});

	it("помечает избранное по favoriteIds", () => {
		const { body } = render(MenuTab, { props: props() });
		expect(body).toContain(`aria-label="Убрать ${latte.name} из любимого"`);
		expect(body).toContain(`aria-label="Добавить ${ramen.name} в любимое"`);
	});
});

describe("OrderTab", () => {
	it("всегда показывает карту и ETA-панель", () => {
		const { body } = render(OrderTab, {
			props: { cartIsEmpty: true, onOpenMenu: noop },
		});

		expect(hasClass(body, "delivery-map")).toBe(true);
		expect(body).toContain("через 3 минуты");
	});

	it("показывает CTA в меню только при пустой корзине", () => {
		const empty = render(OrderTab, {
			props: { cartIsEmpty: true, onOpenMenu: noop },
		});
		expect(empty.body).toContain("Выбрать что-нибудь красивое");

		const full = render(OrderTab, {
			props: { cartIsEmpty: false, onOpenMenu: noop },
		});
		expect(full.body).not.toContain("Выбрать что-нибудь красивое");
	});
});

describe("FavoritesTab", () => {
	it("рендерит сетку, когда есть избранное", () => {
		const { body } = render(FavoritesTab, {
			props: { dishes: [latte], onFavorite: noop, onAdd: noop },
		});

		expect(hasClass(body, "favorites__grid")).toBe(true);
		expect(body).toContain(latte.name);
		expect(body).not.toContain("Здесь пока тихо");
	});

	it("показывает пустое состояние, когда избранного нет", () => {
		const { body } = render(FavoritesTab, {
			props: { dishes: [], onFavorite: noop, onAdd: noop },
		});

		expect(body).toContain("Здесь пока тихо");
		expect(hasClass(body, "favorites__grid")).toBe(false);
	});
});

describe("ProfileTab", () => {
	it("рендерит карточку и все строки навигации", () => {
		const { body } = render(ProfileTab, {});

		expect(body).toContain("Member since 2024");
		expect(body.match(/class="profile-row(?: |")/g)?.length).toBe(
			profileLinks.length,
		);
	});
});

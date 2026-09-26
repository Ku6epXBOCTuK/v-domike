import { createRawSnippet } from "svelte";
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import IconHouse from "~icons/lucide/house";

import AppHeader from "./AppHeader.svelte";
import AppShell from "./AppShell.svelte";
import BottomNav from "./BottomNav.svelte";
import NavItem from "./NavItem.svelte";
import Wordmark from "./Wordmark.svelte";

const slot = (text: string) =>
	createRawSnippet(() => ({ render: () => `<span>${text}</span>` }));

const noop = () => {};

/** Svelte дописывает scope-хэш в class, поэтому сравниваем по имени класса,
 *  а не по точному значению атрибута. */
function hasClass(body: string, name: string) {
	return new RegExp(`class="(?:[^"]* )?${name}(?: |")`).test(body);
}

describe("AppShell", () => {
	it("рендерит все три слота в порядке header → content → nav", () => {
		const { body } = render(AppShell, {
			props: {
				header: slot("HDR"),
				children: slot("CONTENT"),
				nav: slot("NAV"),
			},
		});

		const h = body.indexOf("HDR");
		const c = body.indexOf("CONTENT");
		const n = body.indexOf("NAV");

		expect(h).toBeGreaterThan(-1);
		expect(h).toBeLessThan(c);
		expect(c).toBeLessThan(n);
	});

	it("оборачивает в main > div и кладёт nav внутрь фрейма", () => {
		const { body } = render(AppShell, {
			props: {
				header: slot("HDR"),
				children: slot("CONTENT"),
				nav: slot("NAV"),
			},
		});

		expect(body).toContain("<main");
		expect(hasClass(body, "app")).toBe(true);
		expect(hasClass(body, "app__frame")).toBe(true);
		expect(hasClass(body, "app__content")).toBe(true);
	});
});

describe("AppHeader", () => {
	it("рендерит brand и actions", () => {
		const { body } = render(AppHeader, {
			props: { brand: slot("BRAND"), actions: slot("ACTIONS") },
		});

		expect(body).toContain("BRAND");
		expect(body).toContain("ACTIONS");
		expect(hasClass(body, "app-header__actions")).toBe(true);
	});
});

describe("Wordmark", () => {
	it("рендерит virtualbite с акцентом на «bite»", () => {
		const { body } = render(Wordmark, { props: { onselect: noop } });

		expect(hasClass(body, "wordmark")).toBe(true);
		expect(hasClass(body, "wordmark__name")).toBe(true);
		expect(hasClass(body, "wordmark__accent")).toBe(true);
		expect(body).toContain(">bite</span>");
		expect(body).toContain("private dining");
	});

	it("это кнопка с type=button, а не ссылка", () => {
		const { body } = render(Wordmark, { props: { onselect: noop } });

		expect(body).toContain("<button");
		expect(body).toContain('type="button"');
	});
});

describe("NavItem", () => {
	it("помечает активный пункт через aria-current=page", () => {
		const on = render(NavItem, {
			props: { label: "Меню", icon: IconHouse, active: true, onselect: noop },
		});
		expect(on.body).toContain('aria-current="page"');
		expect(on.body).toContain('data-active="true"');

		const off = render(NavItem, {
			props: { label: "Меню", icon: IconHouse, active: false, onselect: noop },
		});
		expect(off.body).not.toContain("aria-current");
	});

	it("рисует бейдж только при badge", () => {
		const withBadge = render(NavItem, {
			props: {
				label: "Заказ",
				icon: IconHouse,
				active: true,
				badge: true,
				onselect: noop,
			},
		});
		expect(withBadge.body).toContain("nav-item__badge");

		const without = render(NavItem, {
			props: { label: "Заказ", icon: IconHouse, active: true, onselect: noop },
		});
		expect(without.body).not.toContain("nav-item__badge");
	});
});

describe("BottomNav", () => {
	it("рендерит все четыре таба с подписями", () => {
		const { body } = render(BottomNav, {
			props: { active: "menu", onselect: noop },
		});

		for (const label of ["Меню", "Заказ", "Любимое", "Профиль"]) {
			expect(body).toContain(label);
		}
		expect(body.match(/class="nav-item/g)?.length).toBe(4);
	});

	it("ставит aria-current ровно на активный таб", () => {
		const { body } = render(BottomNav, {
			props: { active: "favorites", onselect: noop },
		});

		expect(body.match(/aria-current="page"/g)?.length).toBe(1);
		expect(body).toContain('data-active="true"');
	});

	it("вешает бейдж только на переданный таб", () => {
		const { body } = render(BottomNav, {
			props: { active: "menu", badgeOn: "order", onselect: noop },
		});

		expect(body.match(/nav-item__badge/g)?.length).toBe(1);
	});

	it("без badgeOn не рисует бейдж вовсе", () => {
		const { body } = render(BottomNav, {
			props: { active: "menu", onselect: noop },
		});

		expect(body).not.toContain("nav-item__badge");
	});
});

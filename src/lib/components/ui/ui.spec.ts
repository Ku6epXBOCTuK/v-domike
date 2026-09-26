import { createRawSnippet } from "svelte";
import { render } from "svelte/server";
import { describe, expect, it } from "vitest";

import IconHeart from "~icons/lucide/heart";

import Avatar from "./Avatar.svelte";
import Chip from "./Chip.svelte";
import EmptyState from "./EmptyState.svelte";
import IconButton from "./IconButton.svelte";
import Overline from "./Overline.svelte";
import SectionHeader from "./SectionHeader.svelte";
import TabHeading from "./TabHeading.svelte";
import TextButton from "./TextButton.svelte";

const icon = createRawSnippet(() => ({
	render: () => `<svg class="icon" viewBox="0 0 24 24"></svg>`,
}));

const noop = () => {};

describe("Chip", () => {
	it("передаёт label и состояние active в aria-pressed", () => {
		const on = render(Chip, {
			props: { label: "Всё", active: true, onclick: noop },
		});
		expect(on.body).toContain("Всё");
		expect(on.body).toContain('aria-pressed="true"');
		expect(on.body).toContain('data-active="true"');

		const off = render(Chip, {
			props: { label: "Напитки", active: false, onclick: noop },
		});
		expect(off.body).toContain('aria-pressed="false"');
	});

	it("всегда рендерится как button с type=button", () => {
		const { body } = render(Chip, {
			props: { label: "Всё", active: true, onclick: noop },
		});
		expect(body).toContain("<button");
		expect(body).toContain('type="button"');
	});
});

describe("Avatar", () => {
	it("рендерит инициал", () => {
		const { body } = render(Avatar, { props: { initial: "А" } });
		expect(body).toContain("А");
		expect(body).toContain("avatar");
	});
});

describe("Overline", () => {
	it("дефолтно muted, accent-вариант меняет разметку", () => {
		const muted = render(Overline, { props: { children: icon } });
		expect(muted.body).toContain('data-variant="muted"');

		const accent = render(Overline, {
			props: { variant: "accent", children: icon },
		});
		expect(accent.body).toContain('data-variant="accent"');
	});
});

describe("TabHeading", () => {
	it("без accent рендерит один h1 с плоским заголовком", () => {
		const { body } = render(TabHeading, {
			props: { eyebrow: "Твой заказ", title: "В пути" },
		});
		expect(body).toContain("<h1");
		expect(body).toContain("В пути");
		expect(body).not.toContain("<br");
	});

	it("с accent ставит <br> и курсивный span", () => {
		const { body } = render(TabHeading, {
			props: {
				eyebrow: "Добрый вечер, Аня",
				title: "Что сегодня",
				accent: "для души?",
			},
		});
		expect(body).toContain("<br");
		expect(body).toContain("для души?");
		expect(body).toContain("tab-heading__accent");
	});
});

describe("SectionHeader", () => {
	it("рендерит overline, h2 и слот действий", () => {
		const { body } = render(SectionHeader, {
			props: {
				overline: "Curated for you",
				title: "Маленькие радости",
				children: icon,
			},
		});
		expect(body).toContain("<h2");
		expect(body).toContain("Маленькие радости");
		expect(body).toContain('data-variant="accent"');
		expect(body).toContain("<svg");
	});

	it("без overline не рендерит лишний <p>", () => {
		const { body } = render(SectionHeader, {
			props: { title: "Только заголовок", children: icon },
		});
		expect(body).toContain("Только заголовок");
		expect(body).not.toContain("overline");
	});
});

describe("IconButton", () => {
	it("проставляет aria-label, tone и size", () => {
		const { body } = render(IconButton, {
			props: {
				label: "Уведомления",
				tone: "plain",
				size: "md",
				onclick: noop,
				children: icon,
			},
		});
		expect(body).toContain('aria-label="Уведомления"');
		expect(body).toContain('data-tone="plain"');
		expect(body).toContain('data-size="md"');
	});

	it("рисует точку только при dot", () => {
		const withDot = render(IconButton, {
			props: { label: "Уведомления", dot: true, onclick: noop, children: icon },
		});
		expect(withDot.body).toContain("icon-button__dot");

		const without = render(IconButton, {
			props: { label: "Уведомления", onclick: noop, children: icon },
		});
		expect(without.body).not.toContain("icon-button__dot");
	});

	it("pressed выставляет aria-pressed и omits его когда не задан", () => {
		const pressed = render(IconButton, {
			props: {
				label: "Добавить в любимое",
				pressed: true,
				onclick: noop,
				children: icon,
			},
		});
		expect(pressed.body).toContain('aria-pressed="true"');

		const plain = render(IconButton, {
			props: { label: "Уведомления", onclick: noop, children: icon },
		});
		expect(plain.body).not.toContain("aria-pressed");
	});
});

describe("TextButton", () => {
	it("рендерит <a> при href и <button> без него", () => {
		const link = render(TextButton, {
			props: { href: "/menu", children: icon },
		});
		expect(link.body).toContain("<a");
		expect(link.body).toContain('href="/menu"');

		const button = render(TextButton, {
			props: { onclick: noop, children: icon },
		});
		expect(button.body).toContain("<button");
		expect(button.body).toContain('type="button"');
	});

	it("дефолтный variant — inline", () => {
		const { body } = render(TextButton, {
			props: { onclick: noop, children: icon },
		});
		expect(body).toContain('data-variant="inline"');
	});
});

describe("EmptyState", () => {
	it("рендерит переданную иконку и заголовок", () => {
		const { body } = render(EmptyState, {
			props: { icon: IconHeart, title: "Здесь пока тихо" },
		});
		expect(body).toContain("Здесь пока тихо");
		expect(body).toContain("<svg");
	});
});

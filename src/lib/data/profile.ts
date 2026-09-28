import type { RouteId } from "$app/types";

export type ProfileLinkIcon = "clock" | "bell";

export type ProfileLink = {
	id: string;
	label: string;
	icon: ProfileLinkIcon;
	href: RouteId;
};

export const profile = {
	initial: "А",
	name: "Аня",
	memberSince: "В Домике с 2024",
};

export const profileLinks: ProfileLink[] = [
	{
		id: "history",
		label: "История заказов",
		icon: "clock",
		href: "/profile/history",
	},
	{
		id: "notifications",
		label: "Настроить уведомления",
		icon: "bell",
		href: "/profile/notifications",
	},
];

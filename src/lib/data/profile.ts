export type ProfileLinkIcon = "clock" | "pin" | "bell";

export type ProfileLink = {
	id: string;
	label: string;
	icon: ProfileLinkIcon;
};

export const profile = {
	initial: "А",
	name: "Аня",
	memberSince: "Member since 2024",
};

export const profileLinks: ProfileLink[] = [
	{ id: "history", label: "История заказов", icon: "clock" },
	{ id: "address", label: "Адрес для курьера", icon: "pin" },
	{ id: "notifications", label: "Настроить уведомления", icon: "bell" },
];

"use client";

import { useState } from "react";
import Image from "next/image";
import {
	ArrowRight,
	Bell,
	Clock3,
	Heart,
	Home,
	MapPin,
	Moon,
	Navigation,
	Plus,
	Sun,
	UserRound,
} from "lucide-react";

type Tab = "menu" | "order" | "favorites" | "profile";
type Dish = {
	name: string;
	detail: string;
	price: number;
	image: string;
	tone: string;
	category: string;
};

const dishes: Dish[] = [
	{
		name: "Нежный рамён",
		detail: "мисо · яйцо · нори",
		price: 420,
		image: "/ramen.png",
		tone: "bg-[#f0e4df]",
		category: "Согревающие",
	},
	{
		name: "Розовый матча",
		detail: "клубника · овсяное молоко",
		price: 280,
		image: "/latte.png",
		tone: "bg-[#eee4e7]",
		category: "Напитки",
	},
	{
		name: "Клубничный торт",
		detail: "сливки · ваниль · ягоды",
		price: 350,
		image: "/dessert.png",
		tone: "bg-[#f2e5e1]",
		category: "Сладкое",
	},
	{
		name: "Пицца из печи",
		detail: "моцарелла · базилик",
		price: 590,
		image: "/pizza.png",
		tone: "bg-[#eee5d9]",
		category: "Согревающие",
	},
];
const categories = ["Всё", "Согревающие", "Сладкое", "Напитки"];

export default function Page() {
	const [tab, setTab] = useState<Tab>("menu");
	const [category, setCategory] = useState("Всё");
	const [cart, setCart] = useState<Dish[]>([]);
	const [favorites, setFavorites] = useState<string[]>(["Розовый матча"]);
	const [darkMode, setDarkMode] = useState(false);
	const add = (dish: Dish) => setCart((items) => [...items, dish]);
	const toggle = (name: string) =>
		setFavorites((items) =>
			items.includes(name)
				? items.filter((item) => item !== name)
				: [...items, name],
		);
	return (
		<main
			className={`theme-page min-h-screen px-3 py-3 sm:px-10 sm:py-8 ${darkMode ? "theme-dark" : ""}`}
		>
			<div className="theme-shell mx-auto flex min-h-[calc(100vh-24px)] max-w-[430px] flex-col overflow-hidden rounded-[30px] border shadow-[0_30px_100px_rgba(64,45,37,0.15)] sm:min-h-[850px]">
				<header className="flex items-center justify-between px-6 pb-2 pt-6">
					<button onClick={() => setTab("menu")} className="text-left">
						<span className="font-serif text-[21px] tracking-[-0.04em]">
							virtual<span className="text-[#b88988]">bite</span>
						</span>
						<span className="ml-2 text-[9px] uppercase tracking-[0.25em] text-[#a99b98]">
							private dining
						</span>
					</button>
					<div className="flex items-center gap-2">
						<button
							aria-label={
								darkMode
									? "Включить светлую тему"
									: "Включить кавайную тёмную тему"
							}
							onClick={() => setDarkMode((value) => !value)}
							className="theme-toggle flex size-10 items-center justify-center rounded-full border"
						>
							<span className="sr-only">
								{darkMode ? "Светлая тема" : "Тёмная тема"}
							</span>
							{darkMode ? (
								<Sun className="size-[16px]" />
							) : (
								<Moon className="size-[16px]" />
							)}
						</button>
						<button
							aria-label="Уведомления"
							className="relative flex size-10 items-center justify-center rounded-full border border-[#e9dfdc] text-[#867775]"
						>
							<Bell className="size-[16px]" />
							<span className="absolute right-2.5 top-2 size-1.5 rounded-full bg-[#b88988]" />
						</button>
					</div>
				</header>
				<section className="flex-1 px-6 pb-24 pt-7">
					{tab === "menu" && (
						<Menu
							category={category}
							setCategory={setCategory}
							cart={cart}
							add={add}
							favorites={favorites}
							toggle={toggle}
							setTab={setTab}
						/>
					)}
					{tab === "order" && <Order cart={cart} setTab={setTab} />}
					{tab === "favorites" && (
						<Favorites favorites={favorites} toggle={toggle} add={add} />
					)}
					{tab === "profile" && <Profile />}
				</section>
				<nav className="theme-nav fixed bottom-3 left-1/2 z-10 flex w-[calc(100%-24px)] max-w-[406px] -translate-x-1/2 items-center justify-around rounded-[22px] border px-2 py-2 shadow-[0_12px_35px_rgba(64,45,37,0.14)] backdrop-blur sm:bottom-8">
					<Nav
						active={tab === "menu"}
						icon={Home}
						label="Меню"
						onClick={() => setTab("menu")}
					/>
					<Nav
						active={tab === "order"}
						icon={Navigation}
						label="Заказ"
						onClick={() => setTab("order")}
						badge={cart.length > 0}
					/>
					<Nav
						active={tab === "favorites"}
						icon={Heart}
						label="Любимое"
						onClick={() => setTab("favorites")}
					/>
					<Nav
						active={tab === "profile"}
						icon={UserRound}
						label="Профиль"
						onClick={() => setTab("profile")}
					/>
				</nav>
			</div>
		</main>
	);
}

function Menu({
	category,
	setCategory,
	cart,
	add,
	favorites,
	toggle,
	setTab,
}: {
	category: string;
	setCategory: (v: string) => void;
	cart: Dish[];
	add: (d: Dish) => void;
	favorites: string[];
	toggle: (n: string) => void;
	setTab: (t: Tab) => void;
}) {
	const visible =
		category === "Всё"
			? dishes
			: dishes.filter((dish) => dish.category === category);
	return (
		<div className="animate-in fade-in duration-500">
			<div className="mb-8">
				<p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#a89691]">
					Добрый вечер, Аня
				</p>
				<h1 className="font-serif text-[34px] leading-[0.98] tracking-[-0.05em]">
					Что сегодня
					<br />
					<i className="font-normal text-[#b88988]">для души?</i>
				</h1>
			</div>
			<div className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
				{categories.map((item) => (
					<button
						key={item}
						onClick={() => setCategory(item)}
						className={`whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] tracking-wide transition ${category === item ? "bg-[#2d2928] text-[#fffaf8]" : "border border-[#e8dfdb] bg-transparent text-[#968985]"}`}
					>
						{item}
					</button>
				))}
			</div>
			<div className="mb-4 flex items-end justify-between border-b border-[#e8dfdb] pb-3">
				<div>
					<p className="text-[10px] uppercase tracking-[0.2em] text-[#b88988]">
						Curated for you
					</p>
					<h2 className="mt-1 font-serif text-[24px] tracking-[-0.03em]">
						Маленькие радости
					</h2>
				</div>
				<button
					onClick={() => setTab("order")}
					className="flex items-center gap-1 text-[11px] text-[#9f7778]"
				>
					Корзина <ArrowRight className="size-3.5" />
				</button>
			</div>
			<div className="grid grid-cols-2 gap-x-3 gap-y-5">
				{visible.map((dish, i) => (
					<DishCard
						key={dish.name}
						dish={dish}
						index={i}
						favorite={favorites.includes(dish.name)}
						onFavorite={() => toggle(dish.name)}
						onAdd={() => add(dish)}
					/>
				))}
			</div>
			{cart.length === 0 && (
				<p className="mt-7 text-center font-serif text-[13px] italic text-[#aa9a95]">
					«Еда — это язык, на котором забота говорит без слов.»
				</p>
			)}
		</div>
	);
}

function DishCard({
	dish,
	index,
	favorite,
	onFavorite,
	onAdd,
}: {
	dish: Dish;
	index: number;
	favorite: boolean;
	onFavorite: () => void;
	onAdd: () => void;
}) {
	return (
		<article className="group">
			<div
				className={`relative aspect-[0.88] overflow-hidden rounded-[22px] ${dish.tone}`}
			>
				<Image
					src={dish.image}
					alt={dish.name}
					fill
					className="object-cover mix-blend-multiply transition duration-700 group-hover:scale-105"
					sizes="(max-width: 430px) 42vw, 185px"
				/>
				<button
					aria-label={`${favorite ? "Убрать из" : "Добавить в"} любимое`}
					onClick={onFavorite}
					className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-[#fffaf8]/85 text-[#b88988] backdrop-blur"
				>
					<Heart className={`size-3.5 ${favorite ? "fill-current" : ""}`} />
				</button>
				<span className="absolute bottom-2.5 left-2.5 rounded-full bg-[#fffaf8]/85 px-2.5 py-1 text-[9px] tracking-wide text-[#766967] backdrop-blur">
					{index % 2 === 0 ? "15–20 мин" : "5–10 мин"}
				</span>
			</div>
			<div className="px-1 pt-3">
				<div className="flex items-start justify-between gap-1">
					<div>
						<h3 className="font-serif text-[16px] leading-tight">
							{dish.name}
						</h3>
						<p className="mt-1 truncate text-[10px] tracking-wide text-[#aa9d98]">
							{dish.detail}
						</p>
					</div>
					<button
						aria-label={`Добавить ${dish.name}`}
						onClick={onAdd}
						className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#eee2df] text-[#a67677]"
					>
						<Plus className="size-3.5" />
					</button>
				</div>
				<p className="mt-2 text-[11px] font-medium tracking-wide text-[#a67677]">
					{dish.price} coins
				</p>
			</div>
		</article>
	);
}

function Order({ cart, setTab }: { cart: Dish[]; setTab: (t: Tab) => void }) {
	return (
		<div className="animate-in fade-in duration-500">
			<p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#a89691]">
				Твой заказ
			</p>
			<h1 className="mb-7 font-serif text-[34px] tracking-[-0.05em]">В пути</h1>
			<div className="map-card relative mb-5 h-[285px] overflow-hidden rounded-[25px] bg-[#e8e1dd]">
				<div className="map-grid absolute inset-0 opacity-40" />
				<div className="route-line absolute left-[20%] top-[68%] h-px w-[65%] rotate-[-22deg] bg-[#b88988]" />
				<div className="route-dot absolute left-[20%] top-[68%] size-3 rounded-full bg-[#b88988] ring-4 ring-[#eededb]" />
				<div className="home-pin absolute right-[10%] top-[18%] flex size-11 items-center justify-center rounded-full bg-[#fffaf8] text-[#b88988] shadow-lg">
					<Home className="size-4" />
				</div>
				<div className="courier absolute left-[49%] top-[46%] flex size-11 items-center justify-center rounded-2xl bg-[#2d2928] text-white shadow-xl">
					<Navigation className="size-4" />
				</div>
				<div className="absolute bottom-4 left-4 rounded-xl bg-[#fffaf8]/90 px-3 py-2 text-[10px] text-[#796c69] backdrop-blur">
					Курьер Минсу уже близко
				</div>
			</div>
			<div className="rounded-[22px] bg-[#f0e3e0] p-5">
				<p className="text-[10px] uppercase tracking-[0.16em] text-[#a77b7c]">
					Примерное прибытие
				</p>
				<div className="mt-2 flex items-end justify-between">
					<h2 className="font-serif text-[27px] text-[#73595a]">
						через 3 минуты
					</h2>
					<Clock3 className="mb-1 size-5 text-[#a77b7c]" />
				</div>
				<p className="mt-3 text-[11px] leading-relaxed text-[#9b7e7d]">
					Ваш заказ бережно везут.
					<br />
					Можно выдохнуть и никуда не спешить.
				</p>
			</div>
			{cart.length === 0 && (
				<button
					onClick={() => setTab("menu")}
					className="mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-[#e8dfdb] py-3 text-xs text-[#927d79]"
				>
					Выбрать что-нибудь красивое <ArrowRight className="size-3.5" />
				</button>
			)}
		</div>
	);
}

function Favorites({
	favorites,
	toggle,
	add,
}: {
	favorites: string[];
	toggle: (n: string) => void;
	add: (d: Dish) => void;
}) {
	const saved = dishes.filter((d) => favorites.includes(d.name));
	return (
		<div className="animate-in fade-in duration-500">
			<p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#a89691]">
				Твои сохранённые
			</p>
			<h1 className="mb-7 font-serif text-[34px] tracking-[-0.05em]">
				Любимое
			</h1>
			{saved.length ? (
				<div className="grid grid-cols-2 gap-3">
					{saved.map((dish, i) => (
						<DishCard
							key={dish.name}
							dish={dish}
							index={i}
							favorite
							onFavorite={() => toggle(dish.name)}
							onAdd={() => add(dish)}
						/>
					))}
				</div>
			) : (
				<div className="rounded-[24px] bg-[#f0e3e0] p-7 text-center">
					<Heart className="mx-auto mb-3 size-6 text-[#b88988]" />
					<p className="font-serif text-lg">З��есь пока тихо</p>
				</div>
			)}
		</div>
	);
}

function Profile() {
	return (
		<div className="animate-in fade-in duration-500">
			<p className="mb-3 text-[11px] uppercase tracking-[0.18em] text-[#a89691]">
				Твоё пространство
			</p>
			<h1 className="mb-7 font-serif text-[34px] tracking-[-0.05em]">
				Профиль
			</h1>
			<div className="mb-5 flex items-center gap-4 rounded-[24px] bg-[#2d2928] p-5 text-[#fffaf8]">
				<div className="flex size-14 items-center justify-center rounded-full border border-[#c8a6a4] font-serif text-xl">
					А
				</div>
				<div>
					<p className="font-serif text-lg">Аня</p>
					<p className="mt-1 text-[10px] tracking-wide text-[#cbb8b5]">
						Member since 2024
					</p>
				</div>
			</div>
			{["История заказов", "Адрес для курьера", "Настроить уведомления"].map(
				(item, i) => (
					<button
						key={item}
						className="mb-2 flex w-full items-center justify-between rounded-2xl border border-[#e8dfdb] bg-[#fffdfa] p-4 text-left text-xs"
					>
						<span className="flex items-center gap-3">
							<span className="flex size-8 items-center justify-center rounded-xl bg-[#f0e3e0] text-[#a67677]">
								{i === 0 ? (
									<Clock3 className="size-4" />
								) : i === 1 ? (
									<MapPin className="size-4" />
								) : (
									<Bell className="size-4" />
								)}
							</span>
							{item}
						</span>
						<ArrowRight className="size-4 text-[#b9aaa5]" />
					</button>
				),
			)}
		</div>
	);
}

function Nav({
	active,
	icon: Icon,
	label,
	onClick,
	badge,
}: {
	active: boolean;
	icon: typeof Home;
	label: string;
	onClick: () => void;
	badge?: boolean;
}) {
	return (
		<button
			onClick={onClick}
			className={`relative flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[10px] transition ${active ? "bg-[#2d2928] text-[#fffaf8]" : "text-[#aaa09c]"}`}
		>
			<Icon className="size-[16px]" />
			<span>{label}</span>
			{badge && (
				<span className="absolute right-2 top-0.5 size-1.5 rounded-full bg-[#b88988]" />
			)}
		</button>
	);
}

export type PastOrder = {
	id: string;
	dishId: string;
	when: string;
	note: string;
};

/* Блюда хранятся ссылкой на каталог. Цен нет намеренно: деньги в этом
   приложении не показываются, см. design.md. */
export const pastOrders: PastOrder[] = [
	{
		id: "ramen-1",
		dishId: "ramen",
		when: "вчера вечером",
		note: "Минсу довёз и ушёл тихо",
	},
	{
		id: "latte-1",
		dishId: "latte",
		when: "в прошлый понедельник",
		note: "Допила за чаем",
	},
	{
		id: "pizza-1",
		dishId: "pizza",
		when: "на прошлой неделе",
		note: "Пицца, и вечер удался",
	},
	{
		id: "dessert-1",
		dishId: "dessert",
		when: "неделю назад",
		note: "Торт пережил дорогу",
	},
];

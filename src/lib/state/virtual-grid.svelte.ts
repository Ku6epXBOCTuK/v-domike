/*
 * Окно отрисовки меню: в DOM живут только ряды у экрана, а место остальных
 * держит распорка. Полная сетка из 365 карточек стоила ~2 с главного потока при
 * открытии и ~6 с на прокрутке 20 000 px — при живых фото, где каждый ряд ещё и
 * умножается на тон.
 *
 * Высота ряда не константа: название занимает от одной до трёх строк. Меряем
 * отрисованные ряды, остальные считаем по среднему — разброс 259–309 px, то
 * есть оценка ошибается меньше чем на один ряд.
 */

const INITIAL_ROWS = 4;

/* Запас снизу важнее запаса сверху: фото качаются по сети, и если ряд появится
   за 300 px до экрана, человек увидит плейсхолдер. */
const OVERSCAN = 1200;
const FALLBACK_ROW_HEIGHT = 300;

export class VirtualGrid {
	first = $state(0);
	last = $state(INITIAL_ROWS);
	topSpacer = $state(0);
	bottomSpacer = $state(0);

	#columns: number;
	#rows = 0;
	#gap = 0;
	#heights: (number | undefined)[] = [];
	#average = FALLBACK_ROW_HEIGHT;

	constructor(columns: number) {
		this.#columns = columns;
	}

	get firstItem() {
		return this.first * this.#columns;
	}

	get visibleCount() {
		return (this.last - this.first) * this.#columns;
	}

	reset(rows: number) {
		this.#rows = rows;
		this.#heights = [];
		this.#average = FALLBACK_ROW_HEIGHT;
		this.first = 0;
		this.last = Math.min(INITIAL_ROWS, Math.max(rows, 1));
		this.#place();
	}

	/** Ширина изменилась — прошлые замеры больше не годятся. */
	forget() {
		this.#heights = [];
		this.#average = FALLBACK_ROW_HEIGHT;
		this.#place();
	}

	setGap(gap: number) {
		this.#gap = gap;
		this.#place();
	}

	/** Элементы окна идут в DOM по порядку, поэтому ряд считается по позиции. */
	measure(items: ArrayLike<HTMLElement>, firstItem: number) {
		for (let i = 0; i < items.length; i++) {
			const row = Math.floor((firstItem + i) / this.#columns);
			const height = items[i].getBoundingClientRect().height;
			if (row < this.#rows && height > 0) {
				this.#heights[row] = Math.max(this.#heights[row] ?? 0, height);
			}
		}

		let sum = 0;
		let known = 0;
		for (const height of this.#heights) {
			if (height) {
				sum += height;
				known++;
			}
		}
		if (known) this.#average = sum / known;
		this.#place();
	}

	update(gridTop: number, scrollY: number, viewport: number) {
		const offsets = this.#offsets();
		/* Отступ окна в координатах сетки. Запас с обеих сторон: сверху он
		   нужен, чтобы при возврате назад не ждать, снизу — чтобы фото начали
		   качаться до того, как ряд доедет до экрана. */
		const start = scrollY - gridTop;
		const from = start - OVERSCAN;
		const to = start + viewport + OVERSCAN;

		let first = 0;
		while (first < this.#rows - 1 && offsets[first + 1] <= from) first++;
		let last = first;
		while (last < this.#rows && offsets[last] <= to) last++;

		first = Math.min(first, Math.max(this.#rows - 1, 0));
		last = Math.min(Math.max(last, first + 1), this.#rows);

		if (first !== this.first || last !== this.last) {
			this.first = first;
			this.last = last;
		}
		this.#place();
	}

	#place() {
		const offsets = this.#offsets();
		this.topSpacer = offsets[this.first];
		this.bottomSpacer = offsets[this.#rows] - offsets[this.last];
	}

	#offsets() {
		const offsets = new Array<number>(this.#rows + 1);
		offsets[0] = 0;
		for (let row = 0; row < this.#rows; row++) {
			offsets[row + 1] =
				offsets[row] + (this.#heights[row] ?? this.#average) + this.#gap;
		}
		return offsets;
	}
}

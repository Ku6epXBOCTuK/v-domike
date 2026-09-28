<script lang="ts">
	/*
	 * Заглушка карточки на время гидрации: повторяет пропорции DishCard
	 * (фото 0.88, две строки текста и короткая строка цены), чтобы при
	 * появлении реальной карточки страница не дёрнулась.
	 */
</script>

<div class="skeleton-card">
	<div class="skeleton-card__photo sheen"></div>
	<div class="skeleton-card__name sheen"></div>
	<div class="skeleton-card__detail sheen"></div>
	<div class="skeleton-card__price sheen"></div>
</div>

<style>
	.skeleton-card {
		display: flex;
		flex-direction: column;
	}

	.skeleton-card__photo {
		aspect-ratio: 0.88;
		border-radius: var(--radius-lg);
		background-color: var(--surface-sunken);
	}

	.skeleton-card__name,
	.skeleton-card__detail,
	.skeleton-card__price {
		margin-inline: var(--space-2);
		border-radius: var(--radius-pill);
		background-color: var(--surface-sunken);
	}

	.skeleton-card__name {
		width: 60%;
		height: 14px;
		margin-top: var(--space-5);
	}

	.skeleton-card__detail {
		width: 40%;
		height: 8px;
		margin-top: var(--space-3);
	}

	.skeleton-card__price {
		width: 28%;
		height: 10px;
		margin-top: var(--space-5);
	}
</style>

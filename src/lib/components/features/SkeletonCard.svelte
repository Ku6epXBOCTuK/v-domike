<script lang="ts">
	/*
	 * Заглушка карточки на время гидрации: повторяет пропорции DishCard
	 * (фото 0.88, две строки текста и короткая строка цены), чтобы при
	 * появлении реальной карточки страница не дёрнулась.
	 */
</script>

<div class="skeleton-card">
	<div class="skeleton-card__photo"></div>
	<div class="skeleton-card__name"></div>
	<div class="skeleton-card__detail"></div>
	<div class="skeleton-card__price"></div>
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

	/* Блик — стекло поверх подложки, ровно как подписи на карте и бейдж
	   времени на фото. В тёмной теме стекло темнее подложки и тоже читается
	   как движение. Разбавлено, иначе блок наполовину стирается. */
	.skeleton-card__photo::after,
	.skeleton-card__name::after,
	.skeleton-card__detail::after,
	.skeleton-card__price::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(
			90deg,
			transparent,
			color-mix(in srgb, var(--surface-glass) 45%, transparent),
			transparent
		);
		content: "";
		transform: translateX(-100%);
		animation: skeleton-sheen var(--duration-slow) var(--ease-out) infinite;
	}

	.skeleton-card__photo,
	.skeleton-card__name,
	.skeleton-card__detail,
	.skeleton-card__price {
		position: relative;
		overflow: hidden;
	}

	@keyframes skeleton-sheen {
		to {
			transform: translateX(100%);
		}
	}
</style>

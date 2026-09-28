/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { version } from "$app/env";
import { assets, immutable, prerendered } from "$app/manifest";

const sw = self as unknown as ServiceWorkerGlobalScope;

const base = new URL(sw.registration.scope).pathname.replace(/\/$/, "");

const CACHE = `v-domike-${version}`;

const PHOTOS = "dishes/";
const PLACEHOLDER = `${PHOTOS}placeholder.webp`;

const paths = [...immutable, ...assets, ...prerendered].map(
	({ path }) => `${base}/${path.replace(/^\//, "")}`,
);

const SHELL = paths.filter(
	(path) => !path.startsWith(`${base}/${PHOTOS}`) || path.endsWith(PLACEHOLDER),
);

const isPhoto = (url: URL) =>
	url.origin === sw.location.origin &&
	url.pathname.startsWith(`${base}/${PHOTOS}`);

sw.addEventListener("install", (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(SHELL))
			.then(() => sw.skipWaiting()),
	);
});

sw.addEventListener("activate", (event) => {
	event.waitUntil(
		(async () => {
			for (const key of await caches.keys()) {
				if (key !== CACHE) await caches.delete(key);
			}
			await sw.clients.claim();
		})(),
	);
});

sw.addEventListener("fetch", (event) => {
	if (event.request.method !== "GET") return;

	const photo = isPhoto(new URL(event.request.url));

	event.respondWith(
		(async () => {
			const cached = await caches.match(event.request, { ignoreSearch: true });
			if (cached) return cached;
			if (!photo) return fetch(event.request);

			try {
				const response = await fetch(event.request);
				if (!response.ok) throw new Error(`${response.status}`);
				const cache = await caches.open(CACHE);
				await cache.put(event.request, response.clone());
				return response;
			} catch {
				// подменять плейсхолдером нельзя: офлайн должен отличаться от «снимка нет»
				return Response.error();
			}
		})(),
	);
});

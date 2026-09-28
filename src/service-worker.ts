/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { version } from "$app/env";
import { assets, immutable, prerendered } from "$app/manifest";

const sw = self as unknown as ServiceWorkerGlobalScope;

const base = new URL(sw.registration.scope).pathname.replace(/\/$/, "");

const CACHE = `v-domike-${version}`;

const SHELL = [...immutable, ...assets, ...prerendered].map(
	({ path }) => `${base}/${path.replace(/^\//, "")}`,
);

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

	event.respondWith(
		(async () => {
			const cached = await caches.match(event.request, { ignoreSearch: true });
			return cached ?? fetch(event.request);
		})(),
	);
});

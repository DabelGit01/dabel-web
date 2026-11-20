"use client";

import { useEffect, useState } from "react";

/**
 * Tiny stale-while-revalidate cache for the public JSON endpoints.
 * - Data fetched once is kept in memory for the whole visit, so navigating
 *   between pages renders instantly (no skeleton flash).
 * - Cached data is still refreshed quietly in the background on each mount.
 * - In-flight requests are shared, so many components asking for the same URL
 *   trigger one network call.
 */
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

function load(url: string): Promise<unknown> {
	const pending = inflight.get(url);
	if (pending) return pending;
	const p = fetch(url)
		.then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
		.then((d) => {
			cache.set(url, d);
			return d;
		})
		.finally(() => inflight.delete(url));
	inflight.set(url, p);
	return p;
}

/** Warm the cache ahead of navigation (fire-and-forget). */
export function prefetchApi(urls: string[]) {
	for (const u of urls) if (!cache.has(u)) load(u).catch(() => {});
}

export const PUBLIC_ENDPOINTS = [
	"/api/public/site-meta",
	"/api/public/offers",
	"/api/public/offices",
	"/api/public/contacts",
	"/api/public/socials",
	"/api/public/team",
	"/api/public/certifications",
	"/api/public/blog",
	"/api/public/blog-categories",
];

function resolve<T>(d: unknown, fallback?: T): T | undefined {
	const empty = d == null || (Array.isArray(d) && d.length === 0);
	return (empty && fallback !== undefined ? fallback : d) as T | undefined;
}

/** Fetch a public JSON endpoint on the client, with loading state and a fallback on error/empty. */
export function useApi<T>(url: string, fallback?: T) {
	const hit = cache.has(url);
	const [data, setData] = useState<T | undefined>(() => (hit ? resolve(cache.get(url), fallback) : undefined));
	const [loading, setLoading] = useState(!hit);

	useEffect(() => {
		let alive = true;
		load(url)
			.then((d) => alive && setData(resolve(d, fallback)))
			.catch(() => alive && !cache.has(url) && fallback !== undefined && setData(fallback))
			.finally(() => alive && setLoading(false));
		return () => {
			alive = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return { data, loading };
}

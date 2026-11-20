"use client";

import { useEffect, useState } from "react";
import { DabelMark } from "@/components/brand/DabelLogo";

export const INTRO_EVENT = "dabel:intro-done";
const WORD = "DABEL RESOURCES".split("");
const DURATION = 2600;
const DURATION_REDUCED = 1500;

/**
 * Inline, pre-paint script: marks the document when the intro has already
 * played this session so the loader never flashes on reloads.
 * `?intro=1` forces a replay (handy for demos).
 */
export const introScript = `try{if(/[?&]intro=1/.test(location.search)){sessionStorage.removeItem('dabel-intro')}else if(sessionStorage.getItem('dabel-intro')){document.documentElement.dataset.intro='seen'}}catch(e){}`;

export function isIntroDone() {
	if (typeof document === "undefined") return false;
	return document.documentElement.dataset.intro === "seen";
}

export function Preloader() {
	const [phase, setPhase] = useState<"run" | "exit" | "gone">("run");
	const [pct, setPct] = useState(0);
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		if (isIntroDone()) {
			setPhase("gone");
			return;
		}
		// Reduced-motion visitors still get the splash, as a short calm fade (no sliding curtains).
		const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		setReduced(isReduced);
		// Time is measured from page navigation start (performance.now() === 0), not from
		// hydration, so a slow JS download shortens the remaining intro instead of adding to it.
		const target = isReduced ? DURATION_REDUCED : DURATION;
		const DURATION_ = Math.max(700, target - performance.now());
		document.documentElement.style.overflow = "hidden";
		let raf = 0;
		const tick = (t: number) => {
			const p = Math.min(1, t / (target - 300));
			setPct(Math.round(p * 100));
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);

		const exit = window.setTimeout(() => {
			setPhase("exit");
			document.documentElement.style.overflow = "";
			document.documentElement.dataset.intro = "seen";
			try {
				sessionStorage.setItem("dabel-intro", "1");
			} catch {}
			window.dispatchEvent(new Event(INTRO_EVENT));
		}, DURATION_);
		const gone = window.setTimeout(() => setPhase("gone"), DURATION_ + 1300);

		return () => {
			cancelAnimationFrame(raf);
			clearTimeout(exit);
			clearTimeout(gone);
			document.documentElement.style.overflow = "";
		};
	}, []);

	if (phase === "gone") return null;

	return (
		<div className="intro" data-phase={phase} data-reduced={reduced || undefined} aria-hidden="true">
			<div className="intro-panel intro-panel--brand" />
			<div className="intro-panel intro-panel--navy">
				<DabelMark tone="onDark" animated className="h-[118px] w-[142px]" />
				<div className="intro-word">
					{WORD.map((ch, i) => (
						<span
							// biome-ignore lint/suspicious/noArrayIndexKey: static letters
							key={i}
							style={{ animationDelay: `${1 + i * 0.035}s` }}
						>
							{ch === " " ? " " : ch}
						</span>
					))}
				</div>
				<div className="intro-sub">VENTURES LIMITED</div>
				<div className="intro-pct">{String(pct).padStart(3, "0")}</div>
				<div className="intro-track">
					<i style={{ width: `${pct}%` }} />
				</div>
			</div>
		</div>
	);
}

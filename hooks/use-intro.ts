"use client";

import { useEffect, useState } from "react";
import { INTRO_EVENT, isIntroDone } from "@/components/site/Preloader";

/** True once the intro loader has finished (or was skipped this session). */
export function useIntroDone() {
	const [done, setDone] = useState(false);

	useEffect(() => {
		if (isIntroDone()) {
			// small delay so entrance transitions actually run after hydration
			const t = window.setTimeout(() => setDone(true), 60);
			return () => clearTimeout(t);
		}
		const onDone = () => setDone(true);
		window.addEventListener(INTRO_EVENT, onDone);
		return () => window.removeEventListener(INTRO_EVENT, onDone);
	}, []);

	return done;
}

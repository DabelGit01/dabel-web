"use client";

import { useEffect } from "react";

/**
 * Marks <body> while any admin route is mounted so the admin theme layer in
 * globals.css (incl. dark-mode remapping) also reaches portaled dialogs/menus.
 */
export function AdminScope() {
	useEffect(() => {
		document.body.classList.add("admin-scope");
		return () => document.body.classList.remove("admin-scope");
	}, []);
	return null;
}

"use client";

import { createContext, useContext } from "react";
import { type Content, mergeContent, type SectionKey } from "@/lib/content";

const ContentContext = createContext<Content>(mergeContent([]));

/** Provided once by app/(site)/layout.tsx with server-loaded, admin-edited content. */
export function ContentProvider({ value, children }: { value: Content; children: React.ReactNode }) {
	return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** Editable text for one section, e.g. `const c = useContent("homeOffers")`. */
export function useContent<K extends SectionKey>(section: K): Content[K] {
	return useContext(ContentContext)[section];
}

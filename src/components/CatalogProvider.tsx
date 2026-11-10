"use client";

import { createContext, useContext, type ReactNode } from "react";
import { applyCatalog, EMPTY_CATALOG, type Catalog } from "@/lib/catalog-shared";
import { registerThemes, type Theme } from "@/lib/themes";

const CatalogContext = createContext<Catalog>(EMPTY_CATALOG);

/**
 * Gives pickers what the admin has hidden, locked, created and uploaded.
 * `siteTheme` is the site's own theme when it is a builder theme that may no
 * longer be published (it must still render in the editor).
 */
export function CatalogProvider({ catalog, siteTheme, children }: { catalog: Catalog; siteTheme?: Theme; children: ReactNode }) {
  if (siteTheme) registerThemes([siteTheme], () => false);
  applyCatalog(catalog);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);

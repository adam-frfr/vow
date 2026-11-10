"use client";

import { createContext, useContext, type ReactNode } from "react";
import { registerArt } from "@/lib/assets";
import { EMPTY_CATALOG, type Catalog } from "@/lib/catalog-shared";

const CatalogContext = createContext<Catalog>(EMPTY_CATALOG);

/** Gives pickers what the admin has hidden and uploaded. */
export function CatalogProvider({ catalog, children }: { catalog: Catalog; children: ReactNode }) {
  registerArt(catalog.art);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);

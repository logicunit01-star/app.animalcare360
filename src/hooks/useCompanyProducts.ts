"use client";

import { useCallback, useEffect, useState } from "react";
import { getUser } from "@/lib/auth";
import type { CompanyProduct } from "@/lib/company";
import { getCompanyInfo, getCompanyProducts } from "@/lib/company";

async function resolveCompanyCid(): Promise<number | undefined> {
  const session = getUser();
  if (!session?.username) return undefined;
  if (session.cid) return session.cid;

  const company = await getCompanyInfo(session.username, session.accessToken);
  return company.CID || undefined;
}

export function useCompanyProducts(cid: number | undefined) {
  const [products, setProducts] = useState<CompanyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const session = getUser();
      let resolvedCid = cid ?? session?.cid;

      if (!resolvedCid) {
        resolvedCid = await resolveCompanyCid();
      }

      if (!resolvedCid) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const list = await getCompanyProducts(resolvedCid, session?.accessToken);
      setProducts(list);
    } catch (err) {
      setProducts([]);
      setError(err instanceof Error ? err.message : "Unable to load your applications.");
    } finally {
      setLoading(false);
    }
  }, [cid]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return { products, loading, error, reload: loadProducts };
}

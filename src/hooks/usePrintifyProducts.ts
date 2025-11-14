import { useEffect, useMemo, useState } from "react";
import { fetchLivePrintifyProducts } from "@/lib/printify/client";
import {
  getStaticCatalogProducts,
  mergeProducts,
  type PrintifyRuntimeProduct
} from "@/lib/printify";
import type { PrintifyProduct } from "@/lib/printify/types";

interface UsePrintifyProductsOptions {
  fetchLimit?: number;
}

export function usePrintifyProducts(
  { fetchLimit = 12 }: UsePrintifyProductsOptions = {}
) {
  const [liveProducts, setLiveProducts] = useState<PrintifyProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const staticProducts = useMemo(() => getStaticCatalogProducts(), []);

  const mergedProducts: PrintifyRuntimeProduct[] = useMemo(() => {
    return mergeProducts(staticProducts, liveProducts);
  }, [staticProducts, liveProducts]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const products = await fetchLivePrintifyProducts(fetchLimit);
        if (!cancelled) {
          setLiveProducts(products);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("[Printify] Unable to fetch live products:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fetchLimit]);

  return {
    staticProducts,
    liveProducts,
    mergedProducts,
    loading
  };
}



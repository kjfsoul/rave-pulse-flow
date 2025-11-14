import type { PrintifyProduct } from "./types"
import { PRINTIFY_CATALOG } from "./products"

export interface PrintifyRuntimeProduct extends PrintifyProduct {
  source: "static" | "live"
}

export const PRINTIFY_STORE_BASE = "https://edm-shuffle.printify.me"

export function getStaticCatalogProducts(): PrintifyProduct[] {
  return Object.values(PRINTIFY_CATALOG.products || {})
}

export function mergeProducts(
  staticProducts: PrintifyProduct[],
  liveProducts: PrintifyProduct[]
): PrintifyRuntimeProduct[] {
  const mergedMap = new Map<string, PrintifyRuntimeProduct>()

  staticProducts.forEach((product) => {
    mergedMap.set(product.id, { ...product, source: "static" })
  })

  liveProducts.forEach((product) => {
    mergedMap.set(product.id, { ...product, source: "live" })
  })

  return Array.from(mergedMap.values()).sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

export function formatCurrency(priceInCents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2
  }).format(priceInCents / 100)
}

export function getProductUrl(product: PrintifyProduct, storeBase = PRINTIFY_STORE_BASE): string {
  if (product.externalId) {
    return `${storeBase}/product/${product.externalId}`
  }
  return storeBase
}

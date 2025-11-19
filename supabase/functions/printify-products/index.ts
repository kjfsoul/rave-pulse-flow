/**
 * Supabase Edge Function: printify-products
 *
 * Resolves the EDM Shuffle Printify shop ID automatically. Preference order:
 *   1. PRINTIFY_STORE_ID env variable (if supplied)
 *   2. First shop whose title contains "edm" (case-insensitive)
 *
 * The endpoint always returns products from that single storefront, ignoring
 * any store overrides sent by the client.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

const PRINTIFY_API = "https://api.printify.com/v1"
const STORE_TITLE_KEYWORD = "edm"
const DEFAULT_STORE_ID = 24437349

interface PrintifyListResponse<T> {
  current_page: number
  last_page: number
  data: T[]
}

interface PrintifyShopSummary {
  id: number
  title: string
}

interface PrintifyVariant {
  id: number
  title: string
  price: number
  is_enabled: boolean
  is_available: boolean
}

interface PrintifyImage {
  id: number | string
  src: string
  position: number
}

interface PrintifyProduct {
  id: string
  title: string
  description: string
  tags: string[]
  images: PrintifyImage[]
  variants: PrintifyVariant[]
  visible: boolean
  updated_at: string
  created_at: string
  external?: {
    id: string | null
  } | null
}

function authHeaders(disableCache = false) {
  const token = Deno.env.get("PRINTIFY_API_TOKEN")
  if (!token) return undefined
  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`
  }
  const init: RequestInit = disableCache
    ? { headers, cf: { cacheTtl: 0 } }
    : { headers }
  return init
}

async function resolveStoreId(): Promise<number> {
  const init = authHeaders(true)
  if (!init) {
    throw new Error("PRINTIFY_API_TOKEN is not configured")
  }

  const envStore = Deno.env.get("PRINTIFY_STORE_ID")
  if (envStore) {
    const parsed = Number(envStore)
    if (!Number.isFinite(parsed)) {
      throw new Error(`PRINTIFY_STORE_ID must be numeric. Received: ${envStore}`)
    }
    return parsed
  }

  const response = await fetch(`${PRINTIFY_API}/shops.json`, init)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Printify API error (${response.status}): ${text}`)
  }

  const payload = (await response.json()) as { data: PrintifyShopSummary[] }
  const matches = payload.data.filter((shop) => shop.title.toLowerCase().includes(STORE_TITLE_KEYWORD))

  if (matches.length === 0) {
    throw new Error(`No Printify shops found with title containing "${STORE_TITLE_KEYWORD}"`)
  }
  if (matches.length > 1) {
    console.warn(
      `Multiple Printify shops matched keyword "${STORE_TITLE_KEYWORD}". Falling back to EDM Shuffle store (${DEFAULT_STORE_ID}).`
    )
    return DEFAULT_STORE_ID
  }

  return matches[0].id
}

async function fetchProducts(
  shopId: number,
  limit = 12
): Promise<PrintifyProduct[]> {
  const init = authHeaders(true)
  if (!init) {
    throw new Error("PRINTIFY_API_TOKEN is not configured")
  }

  let page = 1
  const perPage = Math.min(Math.max(limit, 1), 50)
  const results: PrintifyProduct[] = []

  while (results.length < limit) {
    const response = await fetch(
      `${PRINTIFY_API}/shops/${shopId}/products.json?page=${page}&limit=${perPage}`,
      init
    )
    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Printify API error (${response.status}): ${text}`)
    }

    const payload = (await response.json()) as PrintifyListResponse<PrintifyProduct>
    if (!payload?.data?.length) break

    results.push(...payload.data)

    if (payload.current_page >= payload.last_page) break
    page += 1
  }

  return results
    .filter((product) => product.visible && product.external?.id)
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, limit)
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    let limit = Number(url.searchParams.get("limit") || "12")

    if (req.method === "POST") {
      const body = await req.json().catch(() => ({})) as { limit?: number }
      if (body?.limit) {
        limit = Number(body.limit)
      }
    }

    if (!Number.isFinite(limit)) {
      limit = 12
    }
    limit = Math.min(Math.max(Math.trunc(limit), 1), 50)

    const storeId = await resolveStoreId()
    const products = await fetchProducts(storeId, limit)

    return new Response(
      JSON.stringify({
        storeId,
        products
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60"
        }
      }
    )
  } catch (error) {
    console.error("Printify products function error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to fetch Printify products",
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      }
    )
  }
})

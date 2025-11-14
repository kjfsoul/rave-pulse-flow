#!/usr/bin/env tsx

/**
 * Sync all Printify products for the EDM Shuffle store.
 *
 * Usage:
 *   PRINTIFY_API_KEY=sk_xxx npm run sync:printify
 *
 * The script resolves the correct store by checking the PRINTIFY_STORE_ID env
 * var first. If absent, it fetches the Printify shop list and selects the
 * single store whose title contains "edm" (case-insensitive). This guarantees
 * we only ever sync the EDM Shuffle storefront even when the ID changes.
 *
 * NOTE: Unlike the Mystic Arcana workflow, this EDM Shuffle variant deliberately
 * persists only products that are visible AND have an external ID (i.e. they are
 * published to a storefront). Hidden or draft items are skipped so the site only
 * ever ships with currently live merch.
 */

import "dotenv/config"
import { mkdir, writeFile, rm } from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"
import type {
  PrintifyCatalog,
  PrintifyProduct,
  PrintifyProductImage,
  PrintifyProductOption,
  PrintifyProductVariant,
  PrintifyApiProductResponse
} from "../src/lib/printify/types"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SYNC_API_KEY = process.env.PRINTIFY_API_KEY
const RUNTIME_API_TOKEN = process.env.PRINTIFY_API_TOKEN
const AUTH_TOKEN = SYNC_API_KEY || RUNTIME_API_TOKEN
const API_BASE = "https://api.printify.com/v1"
const STORE_TITLE_KEYWORD = "edm"
const DEFAULT_STORE_ID = 24437349

if (!AUTH_TOKEN) {
  console.error("❌ Missing Printify credentials. Set PRINTIFY_API_KEY (preferred for sync script) or PRINTIFY_API_TOKEN.")
  process.exit(1)
}

function slugify(title: string, id: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
  const safeBase = base || "product"
  return `${safeBase}-${id}`
}

interface PrintifyShopSummary {
  id: number
  title: string
}

async function printifyFetch<T>(resource: string): Promise<T> {
  const res = await fetch(`${API_BASE}${resource}`, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
      "Content-Type": "application/json"
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Printify API error (${res.status}): ${text}`)
  }

  return res.json() as Promise<T>
}

async function resolveStoreId(): Promise<number> {
  const envStore = process.env.PRINTIFY_STORE_ID || process.env.PRINTIFY_SHOP_ID
  if (envStore) {
    const parsed = Number(envStore)
    if (!Number.isFinite(parsed)) {
      throw new Error(`PRINTIFY_STORE_ID must be a number. Received: ${envStore}`)
    }
    return parsed
  }

  const shopsResponse = await printifyFetch<PrintifyShopSummary[] | { data: PrintifyShopSummary[] }>("/shops.json")
  const shopList = Array.isArray(shopsResponse) ? shopsResponse : shopsResponse.data || []
  const matches = shopList.filter((shop) => shop.title.toLowerCase().includes(STORE_TITLE_KEYWORD))

  if (matches.length === 0) {
    throw new Error(`No Printify shops found with title containing "${STORE_TITLE_KEYWORD}"`)
  }
  if (matches.length > 1) {
    const preferred =
      matches.find((shop) => shop.id === DEFAULT_STORE_ID) ||
      matches.find((shop) => /pop-up/i.test(shop.title))
    if (preferred) {
      console.log(`ℹ️ Multiple shops matched "${STORE_TITLE_KEYWORD}". Falling back to ${preferred.title} (${preferred.id}).`)
      return preferred.id
    }
    throw new Error(
      `Multiple Printify shops matched keyword "${STORE_TITLE_KEYWORD}". Set PRINTIFY_STORE_ID explicitly.`
    )
  }

  return matches[0]?.id ?? DEFAULT_STORE_ID
}

async function fetchAllProducts(storeId: number): Promise<PrintifyApiProductResponse[]> {
  const perPage = 50
  let page = 1
  const items: PrintifyApiProductResponse[] = []

  while (true) {
    const data = await printifyFetch<{
      data: PrintifyApiProductResponse[]
      current_page: number
      last_page: number
    }>(`/shops/${storeId}/products.json?page=${page}&limit=${perPage}`)

    if (!data?.data?.length) break
    items.push(...data.data)

    if (data.current_page >= data.last_page) break
    page += 1
  }

  return items
}

function normaliseOptions(options: PrintifyProductOption[]): Record<string, PrintifyProductOption> {
  const record: Record<string, PrintifyProductOption> = {}
  options.forEach((option) => {
    const key = option.name || option.type || `option_${option.position ?? Object.keys(record).length}`
    record[key] = option
  })
  return record
}

function transformProduct(apiProduct: PrintifyApiProductResponse): PrintifyProduct {
  const variants: PrintifyProductVariant[] = apiProduct.variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    title: variant.title,
    price: variant.price,
    available: variant.is_available,
    isEnabled: variant.is_enabled,
    options: {}
  }))

  const images: PrintifyProductImage[] = apiProduct.images.map((image) => ({
    id: String(image.id),
    src: image.src,
    position: image.position
  }))

  const prices = variants.filter((variant) => variant.price > 0).map((variant) => variant.price)
  const minPrice = prices.length ? Math.min(...prices) : 0
  const maxPrice = prices.length ? Math.max(...prices) : 0

  let featuredImage: string | undefined
  images
    .sort((a, b) => a.position - b.position)
    .slice(0, 1)
    .forEach((image) => {
      featuredImage = image.src
    })

  return {
    id: apiProduct.id,
    title: apiProduct.title,
    description: apiProduct.description,
    tags: apiProduct.tags,
    options: normaliseOptions(apiProduct.options),
    variants,
    images,
    createdAt: apiProduct.created_at,
    updatedAt: apiProduct.updated_at,
    visible: apiProduct.visible,
    externalId: apiProduct.external?.id || null,
    printProviderId: apiProduct.print_provider_id,
    blueprintId: apiProduct.blueprint_id,
    userData: apiProduct.user_data ?? null,
    featuredImage,
    priceRange: {
      min: minPrice,
      max: maxPrice,
      currency: "USD"
    }
  }
}

async function ensureDir(dirPath: string) {
  await mkdir(dirPath, { recursive: true })
}

async function downloadImage(url: string, outPath: string): Promise<void> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to download image: ${url} (${res.status})`)
  }
  await ensureDir(path.dirname(outPath))
  const arrayBuffer = await res.arrayBuffer()
  await writeFile(outPath, Buffer.from(arrayBuffer))
}

async function main() {
  console.log("🔄 Syncing Printify products for EDM Shuffle...\n")

  const storeId = await resolveStoreId()
  console.log(`🏪 Using Printify store ID: ${storeId}`)

  const apiProducts = await fetchAllProducts(storeId)
  if (apiProducts.length === 0) {
    console.warn("⚠️ No products found for the Printify store.")
  }

  const transformed = apiProducts.map(transformProduct)
  const filtered = transformed.filter((product) => {
    if (!product.visible) {
      console.warn(`🚫 Skipping ${product.title} (${product.id}) – not published/visible.`)
      return false
    }
    if (!product.externalId) {
      console.warn(`🚫 Skipping ${product.title} (${product.id}) – no external ID (not published to a storefront).`)
      return false
    }
    return true
  })

  const published = filtered
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 7)

  const productsRecord: Record<string, PrintifyProduct> = {}

  for (const product of published) {
    productsRecord[product.id] = product
  }

  const imagesDir = path.join(__dirname, "..", "public", "images", "printify")
  await rm(imagesDir, { recursive: true, force: true })
  await ensureDir(imagesDir)

  const concurrency = 5
  const queue: Array<() => Promise<void>> = []

  published.forEach((product) => {
    const productSlug = slugify(product.title, product.id)
    product.images
      .sort((a, b) => a.position - b.position)
      .slice(0, 4)
      .forEach((image, index) => {
        queue.push(async () => {
          const extension = path.extname(new URL(image.src).pathname) || ".jpg"
          const suffix = index === 0 ? "main" : `angle${index}`
          const filename = `${productSlug}-${suffix}${extension}`
          const outPath = path.join(imagesDir, filename)
          try {
            await downloadImage(image.src, outPath)
            image.preview = `/images/printify/${filename}`
            if (!product.featuredImage) {
              product.featuredImage = image.preview
            }
          } catch (error) {
            console.warn(`⚠️ Failed to download image for ${product.id}: ${(error as Error).message}`)
          }
        })
      })
  })

  async function runQueue() {
    const workers = Array.from({ length: concurrency }).map(async () => {
      while (queue.length) {
        const task = queue.shift()
        if (!task) break
        await task()
      }
    })
    await Promise.all(workers)
  }

  await runQueue()

  const catalog: PrintifyCatalog = {
    generatedAt: new Date().toISOString(),
    products: productsRecord,
    storeId
  }

  const catalogFile = path.join(__dirname, "..", "src", "lib", "printify", "products.ts")
  const fileContent = [
    '// Auto-generated by scripts/sync-printify.ts',
    '// Do not edit manually.',
    '',
    "import type { PrintifyCatalog } from './types'",
    '',
    `export const PRINTIFY_CATALOG: PrintifyCatalog = ${JSON.stringify(catalog, null, 2)}`
  ].join('\n');

  await writeFile(catalogFile, fileContent)

  console.log(`✅ Synced ${published.length} published products.`)
  console.log(`🖼️ Images saved to ${imagesDir}`)
  console.log(`📝 Catalog updated: ${catalogFile}`)
}

main().catch((error) => {
  console.error("❌ Sync failed:", error)
  process.exit(1)
})

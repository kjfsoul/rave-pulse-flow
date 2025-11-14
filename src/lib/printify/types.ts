export interface PrintifyProductImage {
  id: string
  src: string
  position: number
  preview?: string
  isDefault?: boolean
}

export interface PrintifyProductVariant {
  id: number
  sku: string
  title: string
  price: number
  available: boolean
  isEnabled: boolean
  options: Record<string, string | number | boolean>
}

export interface PrintifyProductOptionValue {
  id: number
  title: string
}

export interface PrintifyProductOption {
  name?: string
  type?: string
  values?: PrintifyProductOptionValue[]
  position?: number
  // Allow additional metadata fields from Printify
  [key: string]: unknown
}

export interface PrintifyProduct {
  id: string
  title: string
  description: string
  tags: string[]
  options: Record<string, PrintifyProductOption>
  variants: PrintifyProductVariant[]
  images: PrintifyProductImage[]
  createdAt: string
  updatedAt: string
  visible: boolean
  externalId?: string | null
  printProviderId?: number
  blueprintId?: number
  userData?: Record<string, unknown> | null
  // Precomputed fields from sync script
  featuredImage?: string
  priceRange?: {
    min: number
    max: number
    currency: string
  }
}

export interface PrintifyCatalog {
  generatedAt: string
  storeId: number
  products: Record<string, PrintifyProduct>
}

export interface PrintifyApiProductResponse {
  id: string
  title: string
  description: string
  tags: string[]
  options: PrintifyProductOption[]
  variants: Array<{
    id: number
    sku: string
    title: string
    price: number
    is_enabled: boolean
    is_default: boolean
    is_available: boolean
  }>
  images: Array<{
    id: number
    src: string
    position: number
  }>
  created_at: string
  updated_at: string
  visible: boolean
  external: {
    id: string | null
    handle: string | null
    sku: string | null
  } | null
  print_provider_id: number
  blueprint_id: number
  user_data?: Record<string, unknown> | null
}

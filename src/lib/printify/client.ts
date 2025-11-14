import { supabase } from "@/lib/supabase"
import { PrintifyProduct } from "./types"

interface EdgeFunctionResponse {
  storeId: number
  products: PrintifyProduct[]
  error?: string
  details?: string
}

export async function fetchLivePrintifyProducts(limit = 12): Promise<PrintifyProduct[]> {
  try {
    const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>("printify-products", {
      body: { limit }
    })

    if (error) {
      console.error("[Printify] Edge function error:", error)
      return []
    }

    if (!data || data.error) {
      console.error("[Printify] Edge function returned error:", data?.details || data?.error)
      return []
    }

    return data.products ?? []
  } catch (err) {
    console.error("[Printify] Failed to fetch products:", err)
    return []
  }
}

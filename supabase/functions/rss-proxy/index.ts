/**
 * Supabase Edge Function: rss-proxy
 *
 * Proxies RSS feed requests to bypass CORS restrictions.
 * Fetches XML from target URL and returns it as text/xml with proper CORS headers.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          error: "Method not allowed",
          message: "Only POST requests are supported"
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      )
    }

    // Parse request body
    const body = await req.json().catch(() => ({})) as { url?: string }

    if (!body?.url) {
      return new Response(
        JSON.stringify({
          error: "Missing URL",
          message: "Please provide a 'url' field in the request body"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      )
    }

    const targetUrl = body.url

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(targetUrl)
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid URL",
          message: "The provided URL is not valid"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      )
    }

    // Only allow http/https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return new Response(
        JSON.stringify({
          error: "Invalid protocol",
          message: "Only HTTP and HTTPS URLs are allowed"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      )
    }

    // Fetch the RSS feed
    const feedResponse = await fetch(targetUrl, {
      headers: {
        "User-Agent": "EDM-Shuffle-RSS-Proxy/1.0",
        "Accept": "application/rss+xml, application/xml, text/xml, */*"
      }
    })

    if (!feedResponse.ok) {
      return new Response(
        JSON.stringify({
          error: "Failed to fetch RSS feed",
          message: `HTTP ${feedResponse.status}: ${feedResponse.statusText}`,
          url: targetUrl
        }),
        {
          status: feedResponse.status,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      )
    }

    // Get the XML content
    const xmlContent = await feedResponse.text()

    // Return the XML with proper headers
    return new Response(xmlContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300" // Cache for 5 minutes
      }
    })
  } catch (error) {
    console.error("RSS proxy function error:", error)
    return new Response(
      JSON.stringify({
        error: "Internal server error",
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

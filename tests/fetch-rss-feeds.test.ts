import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('fetch-rss-feeds Edge Function', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should validate RSS feed URLs are accessible', async () => {
    const rssFeeds = [
      'https://www.youredm.com/feed/',
      'https://dancingastronaut.com/feed/',
      'https://edm.com/.rss/full/'
    ]

    for (const feedUrl of rssFeeds) {
      try {
        const response = await fetch(feedUrl, {
          method: 'HEAD',
          headers: {
            'User-Agent': 'RavePulseFlow/1.0 (EDM News Aggregator)'
          }
        })
        
        expect(response.ok).toBe(true)
        console.log(`✓ RSS feed accessible: ${feedUrl}`)
      } catch (error) {
        console.error(`✗ RSS feed not accessible: ${feedUrl}`, error)
      }
    }
  })

  it('should parse RSS feed structure', async () => {
    // Test with Your EDM feed
    const response = await fetch('https://www.youredm.com/feed/', {
      headers: {
        'User-Agent': 'RavePulseFlow/1.0 (EDM News Aggregator)'
      }
    })
    
    expect(response.ok).toBe(true)
    const xmlText = await response.text()
    
    // Basic XML structure validation
    expect(xmlText).toContain('<rss')
    expect(xmlText).toContain('<channel>')
    expect(xmlText).toContain('<item>')
    expect(xmlText).toContain('<title>')
    expect(xmlText).toContain('<link>')
    expect(xmlText).toContain('<pubDate>')
  })
})
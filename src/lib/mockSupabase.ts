// Mock Supabase client for demo purposes
// This allows the RSS feed to work without requiring a real Supabase connection

interface MockResponse {
  data: any;
  error: any;
}

class MockSupabaseClient {
  from(table: string) {
    return {
      select: (columns: string) => ({
        order: (column: string, options?: any) => ({
          limit: (count: number) => ({
            then: (callback: (result: MockResponse) => void) => {
              // Simulate network delay
              setTimeout(() => {
                if (table === 'live_feed') {
                  // Return mock RSS feed data
                  callback({
                    data: [
                      {
                        id: 'mock-1',
                        title: 'Tomorrowland 2025 Lineup Revealed',
                        description: 'The iconic festival announces its first wave of artists including David Guetta and Martin Garrix.',
                        link: 'https://tomorrowland.com/news',
                        source: 'Tomorrowland',
                        category: 'festival',
                        pub_date: new Date(Date.now() - 1800000).toISOString(),
                        guid: 'mock-guid-1',
                        author: 'Festival Team',
                        tags: ['festival', 'lineup'],
                        read_time: 2,
                        sentiment: 'positive',
                        priority: 5,
                        trending: true,
                        featured: true
                      },
                      {
                        id: 'mock-2',
                        title: 'Deadmau5 New Album Drops',
                        description: 'The Canadian producer releases his latest work featuring innovative sound design.',
                        link: 'https://deadmau5.com/releases',
                        source: 'EDM.com',
                        category: 'music',
                        pub_date: new Date(Date.now() - 3600000).toISOString(),
                        guid: 'mock-guid-2',
                        author: 'Music Editor',
                        tags: ['deadmau5', 'album'],
                        read_time: 3,
                        sentiment: 'positive',
                        priority: 4
                      }
                    ],
                    error: null
                  });
                } else {
                  callback({
                    data: null,
                    error: { message: 'Table not found in mock data' }
                  });
                }
              }, 500); // 500ms delay to simulate network
            }
          })
        })
      }),
      functions: {
        invoke: (functionName: string) => ({
          then: (callback: (result: MockResponse) => void) => {
            setTimeout(() => {
              if (functionName === 'fetch-rss-feeds') {
                callback({
                  data: { success: true, itemsUpserted: 2, sources: ['Mock Source 1', 'Mock Source 2'] },
                  error: null
                });
              } else {
                callback({
                  data: null,
                  error: { message: 'Function not found in mock data' }
                });
              }
            }, 300);
          }
        })
      }
    };
  }
}

export const mockSupabase = new MockSupabaseClient();

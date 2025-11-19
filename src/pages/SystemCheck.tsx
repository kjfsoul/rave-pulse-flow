import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Database, Zap, FolderOpen, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface CheckResult {
  name: string;
  status: 'checking' | 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

/**
 * System Health Dashboard
 *
 * Verifies connection to remote Supabase instance and checks:
 * - Database tables (tracks, festival_submissions)
 * - Edge Functions (rss-proxy, freesound-search, printify-products)
 * - Storage buckets (tracks)
 */
export default function SystemCheck() {
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkDatabase = async (): Promise<CheckResult> => {
    try {
      // Try to query tracks table
      const { data, error } = await supabase
        .from('tracks')
        .select('id')
        .limit(1);

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation') || error.code === '42P01') {
          return {
            name: 'Database Tables',
            status: 'fail',
            message: 'tracks table does not exist',
            details: 'Migration has not been run. Run: npx supabase db push',
          };
        }
        throw error;
      }

      // Try to query festival_submissions table
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('festival_submissions')
        .select('id')
        .limit(1);

      if (submissionsError) {
        if (submissionsError.message.includes('does not exist') || submissionsError.message.includes('relation') || submissionsError.code === '42P01') {
          return {
            name: 'Database Tables',
            status: 'fail',
            message: 'festival_submissions table does not exist',
            details: 'Migration has not been run. Run: npx supabase db push',
          };
        }
        throw submissionsError;
      }

      return {
        name: 'Database Tables',
        status: 'pass',
        message: 'tracks and festival_submissions tables exist',
        details: 'All required tables are available',
      };
    } catch (error) {
      return {
        name: 'Database Tables',
        status: 'fail',
        message: 'Database connection failed',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const checkStorage = async (): Promise<CheckResult> => {
    try {
      // First try to access the bucket directly (this is more reliable with anon key)
      // This works even if listBuckets() requires admin permissions
      const { data: testFiles, error: accessError } = await supabase.storage
        .from('tracks')
        .list('', {
          limit: 1,
          offset: 0,
        });

      if (accessError) {
        // Check if it's a permissions error vs bucket doesn't exist
        const errorMessage = accessError.message?.toLowerCase() || '';
        const errorCode = String(accessError.code || '').toLowerCase();

        if (
          errorMessage.includes('bucket not found') ||
          errorMessage.includes('does not exist') ||
          errorMessage.includes('404') ||
          errorCode === '404' ||
          errorMessage.includes('not_found')
        ) {
          // Try listBuckets as a secondary check (in case direct access failed for other reasons)
          const { data: buckets } = await supabase.storage.listBuckets();
          const bucketNames = buckets?.map((b) => b.name).join(', ') || 'none';

          return {
            name: 'Storage Buckets',
            status: 'fail',
            message: 'tracks bucket does not exist',
            details: `Create bucket in Supabase Dashboard: Storage > Buckets > New bucket (name: tracks, set to Public). Found buckets: ${bucketNames}`,
          };
        }

        // Other permission errors - bucket likely exists but we can't access it
        // This could be a permissions issue, but we'll treat it as a warning
        return {
          name: 'Storage Buckets',
          status: 'warning',
          message: 'tracks bucket may exist but access is restricted',
          details: `Error: ${accessError.message}. Check bucket permissions in Supabase Dashboard. The bucket should allow public access for uploads.`,
        };
      }

      // Successfully accessed bucket - it exists and is accessible!
      return {
        name: 'Storage Buckets',
        status: 'pass',
        message: 'tracks bucket exists and is accessible',
        details: `Bucket is accessible. ${testFiles?.length || 0} files in root directory.`,
      };
    } catch (error) {
      // Fallback: try listBuckets if direct access fails unexpectedly
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const tracksBucket = buckets?.find((bucket) => bucket.name === 'tracks');

        if (tracksBucket) {
          return {
            name: 'Storage Buckets',
            status: 'warning',
            message: 'tracks bucket exists but direct access failed',
            details: `Bucket found via listBuckets but direct access failed: ${error instanceof Error ? error.message : String(error)}`,
          };
        }
      } catch (listError) {
        // Ignore listBuckets errors
      }

      return {
        name: 'Storage Buckets',
        status: 'fail',
        message: 'Storage check failed',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const checkFunction = async (functionName: string): Promise<CheckResult> => {
    try {
      // Test function by calling it with a minimal payload
      const testPayload: Record<string, unknown> = {};

      if (functionName === 'rss-proxy') {
        testPayload.url = 'https://example.com/rss.xml';
      } else if (functionName === 'freesound-search') {
        testPayload.query = 'test';
      } else if (functionName === 'printify-products') {
        // printify-products can be called with GET or POST, test with minimal POST
      }

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: Object.keys(testPayload).length > 0 ? testPayload : undefined,
      });

      if (error) {
        // Check if it's a CORS error (function might be deployed but misconfigured)
        if (error.message.includes('CORS') || error.message.includes('cors')) {
          return {
            name: `Function: ${functionName}`,
            status: 'warning',
            message: 'Function exists but CORS may be misconfigured',
            details: error.message,
          };
        }

        // Check if function doesn't exist (404-like error)
        if (error.message.includes('not found') || error.message.includes('404')) {
          return {
            name: `Function: ${functionName}`,
            status: 'fail',
            message: 'Function not deployed',
            details: `Run: npx supabase functions deploy ${functionName} --no-verify-jwt`,
          };
        }

        // For some functions, certain errors are expected (e.g., invalid API key)
        // We'll treat these as "function exists but needs configuration"
        if (functionName === 'freesound-search' && error.message.includes('Freesound API')) {
          return {
            name: `Function: ${functionName}`,
            status: 'warning',
            message: 'Function deployed but FREESOUND_API_KEY may be missing',
            details: 'Set FREESOUND_API_KEY in Supabase Dashboard > Settings > Edge Functions > Secrets',
          };
        }

        return {
          name: `Function: ${functionName}`,
          status: 'warning',
          message: 'Function responded with error',
          details: error.message,
        };
      }

      return {
        name: `Function: ${functionName}`,
        status: 'pass',
        message: 'Function is deployed and responding',
        details: 'Function call successful',
      };
    } catch (error) {
      // Network errors or other issues
      if (error instanceof Error && error.message.includes('fetch')) {
        return {
          name: `Function: ${functionName}`,
          status: 'fail',
          message: 'Function not reachable',
          details: `Function may not be deployed. Run: npx supabase functions deploy ${functionName} --no-verify-jwt`,
        };
      }

      return {
        name: `Function: ${functionName}`,
        status: 'fail',
        message: 'Function check failed',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const checkSupabaseConnection = async (): Promise<CheckResult> => {
    try {
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const expectedUrl = `https://uzudveyglwouuofiaapq.supabase.co`;

      if (!supabaseUrl) {
        return {
          name: 'Supabase Connection',
          status: 'fail',
          message: 'VITE_SUPABASE_URL not set',
          details: 'Add VITE_SUPABASE_URL to .env.local',
        };
      }

      if (!supabaseUrl.includes('uzudveyglwouuofiaapq')) {
        return {
          name: 'Supabase Connection',
          status: 'warning',
          message: 'Connected to different Supabase project',
          details: `Current: ${supabaseUrl}, Expected: ${expectedUrl}`,
        };
      }

      // Try a simple query to verify connection
      const { error } = await supabase.from('profiles').select('id').limit(1);

      if (error && !error.message.includes('does not exist')) {
        throw error;
      }

      return {
        name: 'Supabase Connection',
        status: 'pass',
        message: `Connected to ${supabaseUrl}`,
        details: 'Remote Supabase instance is reachable',
      };
    } catch (error) {
      return {
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Connection failed',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  };

  const runAllChecks = async () => {
    setIsChecking(true);
    setChecks([
      { name: 'Supabase Connection', status: 'checking', message: 'Checking...' },
      { name: 'Database Tables', status: 'checking', message: 'Checking...' },
      { name: 'Storage Buckets', status: 'checking', message: 'Checking...' },
      { name: 'Function: rss-proxy', status: 'checking', message: 'Checking...' },
      { name: 'Function: freesound-search', status: 'checking', message: 'Checking...' },
      { name: 'Function: printify-products', status: 'checking', message: 'Checking...' },
    ]);

    try {
      const results: CheckResult[] = [];

      // Run checks in parallel
      const [
        connectionCheck,
        dbCheck,
        storageCheck,
        rssProxyCheck,
        freesoundCheck,
        printifyCheck,
      ] = await Promise.all([
        checkSupabaseConnection(),
        checkDatabase(),
        checkStorage(),
        checkFunction('rss-proxy'),
        checkFunction('freesound-search'),
        checkFunction('printify-products'),
      ]);

      results.push(connectionCheck, dbCheck, storageCheck, rssProxyCheck, freesoundCheck, printifyCheck);

      setChecks(results);

      // Show summary toast
      const passed = results.filter((r) => r.status === 'pass').length;
      const failed = results.filter((r) => r.status === 'fail').length;
      const warnings = results.filter((r) => r.status === 'warning').length;

      if (failed === 0 && warnings === 0) {
        toast.success('All systems operational! ✅', {
          description: `All ${passed} checks passed`,
        });
      } else if (failed === 0) {
        toast.warning('Systems operational with warnings', {
          description: `${passed} passed, ${warnings} warnings`,
        });
      } else {
        toast.error('Some checks failed', {
          description: `${failed} failed, ${passed} passed, ${warnings} warnings`,
        });
      }
    } catch (error) {
      console.error('[SystemCheck] Error running checks:', error);
      toast.error('System check failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const getStatusIcon = (status: CheckResult['status']) => {
    switch (status) {
      case 'checking':
        return <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />;
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: CheckResult['status']) => {
    switch (status) {
      case 'checking':
        return <Badge variant="secondary">Checking...</Badge>;
      case 'pass':
        return <Badge className="bg-green-500 hover:bg-green-600">Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-500 hover:bg-red-600">Fail</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Warning</Badge>;
    }
  };

  const getCategoryIcon = (name: string) => {
    if (name.includes('Connection')) return <Database className="w-5 h-5" />;
    if (name.includes('Database') || name.includes('Tables')) return <Database className="w-5 h-5" />;
    if (name.includes('Storage') || name.includes('Bucket')) return <FolderOpen className="w-5 h-5" />;
    if (name.includes('Function')) return <Zap className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl md:text-3xl">System Health Dashboard</CardTitle>
                <CardDescription>
                  Verify remote Supabase infrastructure and configuration
                </CardDescription>
              </div>
              <Button onClick={runAllChecks} disabled={isChecking} variant="outline">
                <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        {getCategoryIcon(check.name)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{check.name}</h3>
                            {getStatusBadge(check.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{check.message}</p>
                          {check.details && (
                            <p className="text-xs text-muted-foreground mt-2 font-mono bg-muted/50 p-2 rounded">
                              {check.details}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">{getStatusIcon(check.status)}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {checks.length === 0 && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Running system checks...</p>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-950/50 border border-blue-500/30 rounded-lg">
              <h4 className="font-semibold text-blue-400 mb-2">Quick Deployment Guide</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-200">
                <li>Run: <code className="bg-blue-950 px-1 rounded">npx supabase link --project-ref uzudveyglwouuofiaapq</code></li>
                <li>Run: <code className="bg-blue-950 px-1 rounded">npx supabase db push</code></li>
                <li>Deploy functions: <code className="bg-blue-950 px-1 rounded">npx supabase functions deploy [function-name] --no-verify-jwt</code></li>
                <li>Create storage bucket: <code className="bg-blue-950 px-1 rounded">tracks</code></li>
                <li>Set secrets: <code className="bg-blue-950 px-1 rounded">FREESOUND_API_KEY</code> in Supabase Dashboard</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

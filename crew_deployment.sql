-- EDM Shuffle CrewAI Database Schema
-- Production deployment schema for workflow logging and system monitoring

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORKFLOW EXECUTION LOGGING
-- ============================================

CREATE TABLE IF NOT EXISTS workflow_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('festival', 'dj_set', 'analysis', 'marketplace', 'gamification')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  agent_results JSONB DEFAULT '{}',
  user_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS workflow_logs_user_id_idx ON workflow_logs(user_id);
CREATE INDEX IF NOT EXISTS workflow_logs_workflow_type_idx ON workflow_logs(workflow_type);
CREATE INDEX IF NOT EXISTS workflow_logs_status_idx ON workflow_logs(status);
CREATE INDEX IF NOT EXISTS workflow_logs_created_at_idx ON workflow_logs(created_at DESC);

-- ============================================
-- SYSTEM HEALTH MONITORING
-- ============================================

CREATE TABLE IF NOT EXISTS system_health_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_status TEXT NOT NULL CHECK (system_status IN ('healthy', 'degraded', 'unhealthy')),
  agent_status JSONB NOT NULL DEFAULT '{}',
  tool_status JSONB NOT NULL DEFAULT '{}',
  metrics JSONB NOT NULL DEFAULT '{}',
  error_count INTEGER DEFAULT 0,
  warning_count INTEGER DEFAULT 0,
  uptime_seconds INTEGER,
  memory_usage_mb REAL,
  cpu_usage_percent REAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for monitoring queries
CREATE INDEX IF NOT EXISTS system_health_logs_status_idx ON system_health_logs(system_status);
CREATE INDEX IF NOT EXISTS system_health_logs_created_at_idx ON system_health_logs(created_at DESC);

-- ============================================
-- AGENT PERFORMANCE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS agent_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL,
  workflow_id UUID REFERENCES workflow_logs(id) ON DELETE CASCADE,
  task_description TEXT,
  execution_time_ms INTEGER NOT NULL,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  output_quality_score REAL CHECK (output_quality_score >= 0 AND output_quality_score <= 10),
  error_message TEXT,
  tools_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance analysis
CREATE INDEX IF NOT EXISTS agent_performance_agent_name_idx ON agent_performance(agent_name);
CREATE INDEX IF NOT EXISTS agent_performance_workflow_id_idx ON agent_performance(workflow_id);
CREATE INDEX IF NOT EXISTS agent_performance_success_idx ON agent_performance(success);
CREATE INDEX IF NOT EXISTS agent_performance_created_at_idx ON agent_performance(created_at DESC);

-- ============================================
-- API RATE LIMITING
-- ============================================

CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  window_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS api_rate_limits_user_endpoint_window_idx 
  ON api_rate_limits(user_id, endpoint, window_start);

-- ============================================
-- QUEUE MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS workflow_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for queue processing
CREATE INDEX IF NOT EXISTS workflow_queue_status_priority_idx ON workflow_queue(status, priority DESC, scheduled_at ASC);
CREATE INDEX IF NOT EXISTS workflow_queue_user_id_idx ON workflow_queue(user_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_queue ENABLE ROW LEVEL SECURITY;

-- Workflow logs policies
CREATE POLICY "Users can view their own workflow logs" ON workflow_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own workflow logs" ON workflow_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow logs" ON workflow_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- System health policies (read-only for authenticated users)
CREATE POLICY "Authenticated users can view system health" ON system_health_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Service role can insert system health logs
CREATE POLICY "Service role can manage system health logs" ON system_health_logs
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Agent performance policies
CREATE POLICY "Users can view agent performance for their workflows" ON agent_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_logs 
      WHERE workflow_logs.id = agent_performance.workflow_id 
      AND workflow_logs.user_id = auth.uid()
    )
  );

-- Service role can insert agent performance data
CREATE POLICY "Service role can manage agent performance" ON agent_performance
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Rate limiting policies
CREATE POLICY "Users can view their own rate limits" ON api_rate_limits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage rate limits" ON api_rate_limits
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Queue policies
CREATE POLICY "Users can view their own queue items" ON workflow_queue
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue items" ON workflow_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage queue" ON workflow_queue
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- UTILITY FUNCTIONS
-- ============================================

-- Function to clean up old logs (called by cron job)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete workflow logs older than 30 days
  DELETE FROM workflow_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete system health logs older than 7 days
  DELETE FROM system_health_logs 
  WHERE created_at < NOW() - INTERVAL '7 days';
  
  -- Delete agent performance logs older than 14 days
  DELETE FROM agent_performance 
  WHERE created_at < NOW() - INTERVAL '14 days';
  
  -- Delete rate limit entries older than 1 hour
  DELETE FROM api_rate_limits 
  WHERE window_end < NOW() - INTERVAL '1 hour';
  
  -- Delete completed queue items older than 1 day
  DELETE FROM workflow_queue 
  WHERE status IN ('completed', 'failed') 
  AND completed_at < NOW() - INTERVAL '1 day';
END;
$$;

-- Function to get workflow statistics
CREATE OR REPLACE FUNCTION get_workflow_stats(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE (
  workflow_type TEXT,
  total_executions BIGINT,
  successful_executions BIGINT,
  failed_executions BIGINT,
  avg_execution_time_ms NUMERIC,
  success_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    wl.workflow_type,
    COUNT(*) as total_executions,
    COUNT(*) FILTER (WHERE wl.status = 'completed') as successful_executions,
    COUNT(*) FILTER (WHERE wl.status = 'failed') as failed_executions,
    AVG(wl.execution_time_ms) as avg_execution_time_ms,
    ROUND(
      (COUNT(*) FILTER (WHERE wl.status = 'completed')::NUMERIC / COUNT(*)) * 100, 
      2
    ) as success_rate
  FROM workflow_logs wl
  WHERE wl.user_id = user_uuid
    AND wl.created_at > NOW() - INTERVAL '30 days'
  GROUP BY wl.workflow_type;
END;
$$;

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  user_uuid UUID,
  endpoint_name TEXT,
  limit_count INTEGER DEFAULT 60,
  window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start_time := DATE_TRUNC('minute', NOW()) - (window_minutes - 1) * INTERVAL '1 minute';
  
  -- Get current request count in the window
  SELECT COALESCE(SUM(request_count), 0)
  INTO current_count
  FROM api_rate_limits
  WHERE user_id = user_uuid
    AND endpoint = endpoint_name
    AND window_start >= window_start_time;
  
  -- Return true if under limit
  RETURN current_count < limit_count;
END;
$$;

-- ============================================
-- VIEWS FOR MONITORING
-- ============================================

-- System health overview
CREATE OR REPLACE VIEW system_health_overview AS
SELECT 
  system_status,
  COUNT(*) as status_count,
  AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at)))) as avg_interval_seconds,
  MAX(created_at) as last_check
FROM system_health_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY system_status;

-- Agent performance summary
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
  agent_name,
  COUNT(*) as total_tasks,
  COUNT(*) FILTER (WHERE success = true) as successful_tasks,
  AVG(execution_time_ms) as avg_execution_time_ms,
  AVG(output_quality_score) as avg_quality_score,
  ROUND(
    (COUNT(*) FILTER (WHERE success = true)::NUMERIC / COUNT(*)) * 100, 
    2
  ) as success_rate
FROM agent_performance
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY agent_name;

-- User workflow activity
CREATE OR REPLACE VIEW user_workflow_activity AS
SELECT 
  user_id,
  workflow_type,
  status,
  COUNT(*) as execution_count,
  AVG(execution_time_ms) as avg_execution_time_ms,
  MAX(created_at) as last_execution
FROM workflow_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_id, workflow_type, status;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert initial system health log
INSERT INTO system_health_logs (
  system_status,
  agent_status,
  tool_status,
  metrics
) VALUES (
  'healthy',
  '{"agents_initialized": 10, "agents_active": 0}',
  '{"tools_configured": 9, "tools_available": 1}',
  '{"deployment_time": "' || NOW()::TEXT || '", "version": "1.0.0"}'
) ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE workflow_logs IS 'Stores execution logs for all CrewAI workflows';
COMMENT ON TABLE system_health_logs IS 'Tracks overall system health and performance metrics';
COMMENT ON TABLE agent_performance IS 'Records individual agent task performance and quality metrics';
COMMENT ON TABLE api_rate_limits IS 'Manages API rate limiting per user and endpoint';
COMMENT ON TABLE workflow_queue IS 'Queue system for managing workflow execution priority and retry logic';

COMMENT ON FUNCTION cleanup_old_logs() IS 'Maintenance function to clean up old log entries';
COMMENT ON FUNCTION get_workflow_stats(UUID) IS 'Returns workflow execution statistics for a user';
COMMENT ON FUNCTION check_rate_limit(UUID, TEXT, INTEGER, INTEGER) IS 'Checks if user has exceeded rate limits for an endpoint';
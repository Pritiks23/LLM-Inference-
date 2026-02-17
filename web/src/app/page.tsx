'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, type DashboardKPIs, type Run } from '@/lib/api';
import { format } from 'date-fns';

export default function HomePage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await api.getDashboardKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Failed to load KPIs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!kpis) {
    return <div>Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your LLM benchmarking runs
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Runs</CardDescription>
            <CardTitle className="text-4xl">{kpis.total_runs}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-4xl">
              {kpis.success_rate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>P50 Total Time</CardDescription>
            <CardTitle className="text-4xl">
              {kpis.total_time_stats.p50
                ? `${kpis.total_time_stats.p50.toFixed(0)}ms`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>P95 Total Time</CardDescription>
            <CardTitle className="text-4xl">
              {kpis.total_time_stats.p95
                ? `${kpis.total_time_stats.p95.toFixed(0)}ms`
                : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Streaming Metrics (Placeholder) */}
      <Card>
        <CardHeader>
          <CardTitle>Streaming Metrics</CardTitle>
          <CardDescription>
            Time to First Token and Inter-Token Latencies (Streaming-ready)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">TTFT P50</div>
              <div className="text-2xl font-bold">
                {kpis.ttft_stats?.p50
                  ? `${kpis.ttft_stats.p50.toFixed(0)}ms`
                  : 'N/A (Pending SSE)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TTFT P95</div>
              <div className="text-2xl font-bold">
                {kpis.ttft_stats?.p95
                  ? `${kpis.ttft_stats.p95.toFixed(0)}ms`
                  : 'N/A (Pending SSE)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Avg Inter-Token</div>
              <div className="text-2xl font-bold">
                {kpis.avg_inter_token_latency
                  ? `${kpis.avg_inter_token_latency.toFixed(0)}ms`
                  : 'N/A (Pending SSE)'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Runs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Runs</CardTitle>
          <CardDescription>Latest benchmark executions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {kpis.recent_runs.length === 0 ? (
              <p className="text-muted-foreground">No runs yet</p>
            ) : (
              <div className="space-y-2">
                {kpis.recent_runs.map((run) => (
                  <div
                    key={run.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex-1">
                      <div className="font-medium">Run #{run.id}</div>
                      <div className="text-sm text-muted-foreground">
                        Scenario ID: {run.scenario_id}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        run.status === 'completed' ? 'text-green-600' :
                        run.status === 'failed' ? 'text-red-600' :
                        run.status === 'running' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>
                        {run.status}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {run.total_duration_ms
                          ? `${run.total_duration_ms.toFixed(0)}ms`
                          : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

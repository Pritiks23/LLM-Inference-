'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, type Run } from '@/lib/api';
import Link from 'next/link';

export default function RunDetailPage() {
  const params = useParams();
  const runId = parseInt(params.id as string);
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRun();
  }, [runId]);

  const loadRun = async () => {
    try {
      const data = await api.getRun(runId);
      setRun(data);
    } catch (error) {
      console.error('Failed to load run:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading run details...</div>;
  }

  if (!run) {
    return <div>Run not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Run #{run.id}</h1>
          <p className="text-muted-foreground">Benchmark run details</p>
        </div>
        <Link href="/runs">
          <Button variant="outline">Back to Runs</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Run Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <div className={`font-medium ${
                run.status === 'completed' ? 'text-green-600' :
                run.status === 'failed' ? 'text-red-600' :
                run.status === 'running' ? 'text-blue-600' :
                'text-gray-600'
              }`}>
                {run.status}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Scenario ID</div>
              <div className="font-medium">{run.scenario_id}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created At</div>
              <div className="font-medium">
                {new Date(run.created_at).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Duration</div>
              <div className="font-medium">
                {run.total_duration_ms ? `${run.total_duration_ms.toFixed(0)}ms` : 'N/A'}
              </div>
            </div>
            {run.started_at && (
              <div>
                <div className="text-sm text-muted-foreground">Started At</div>
                <div className="font-medium">
                  {new Date(run.started_at).toLocaleString()}
                </div>
              </div>
            )}
            {run.finished_at && (
              <div>
                <div className="text-sm text-muted-foreground">Finished At</div>
                <div className="font-medium">
                  {new Date(run.finished_at).toLocaleString()}
                </div>
              </div>
            )}
            {run.tinyfish_run_id && (
              <div>
                <div className="text-sm text-muted-foreground">TinyFish Run ID</div>
                <div className="font-medium">{run.tinyfish_run_id}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Streaming Metrics</CardTitle>
          <CardDescription>TTFT and Inter-Token Latencies (Streaming-ready)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Time to First Token</div>
              <div className="font-medium">
                {run.ttft_ms ? `${run.ttft_ms.toFixed(0)}ms` : 'N/A (Pending SSE)'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Inter-Token Stats</div>
              <div className="font-medium">
                {run.inter_token_stats ? JSON.stringify(run.inter_token_stats) : 'N/A (Pending SSE)'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {run.error && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-red-50 p-4 rounded overflow-x-auto">
              {run.error}
            </pre>
          </CardContent>
        </Card>
      )}

      {run.response_json && (
        <Card>
          <CardHeader>
            <CardTitle>Response Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-muted p-4 rounded overflow-x-auto max-h-96">
              {JSON.stringify(run.response_json, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

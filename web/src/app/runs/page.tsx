'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, type Run } from '@/lib/api';

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadRuns();
  }, [statusFilter]);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await api.getRuns(undefined, statusFilter || undefined);
      setRuns(data);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      case 'running':
        return 'info';
      default:
        return 'secondary';
    }
  };

  if (loading && runs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading runs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluation Runs</h1>
          <p className="text-muted-foreground">
            View and analyze benchmark execution history
          </p>
        </div>
        <Button onClick={loadRuns} variant="outline" disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Runs</CardDescription>
            <CardTitle className="text-2xl">{runs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Completed</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              {runs.filter(r => r.status === 'completed').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Running</CardDescription>
            <CardTitle className="text-2xl text-blue-600">
              {runs.filter(r => r.status === 'running').length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">
              {runs.filter(r => r.status === 'failed').length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('')}
              size="sm"
            >
              All ({runs.length})
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
              size="sm"
            >
              ✓ Completed
            </Button>
            <Button
              variant={statusFilter === 'running' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('running')}
              size="sm"
            >
              ⏳ Running
            </Button>
            <Button
              variant={statusFilter === 'failed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('failed')}
              size="sm"
            >
              ✗ Failed
            </Button>
            <Button
              variant={statusFilter === 'pending' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('pending')}
              size="sm"
            >
              ⌛ Pending
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Runs List */}
      <div className="space-y-3">
        {runs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg mb-2">No runs found</p>
              {statusFilter && (
                <Button variant="outline" onClick={() => setStatusFilter('')}>
                  Clear Filter
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          runs.map((run) => (
            <Card key={run.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">Run #{run.id}</span>
                        <Badge variant={getStatusVariant(run.status)}>
                          {run.status.toUpperCase()}
                        </Badge>
                        {run.tinyfish_run_id && (
                          <Badge variant="outline" className="font-mono text-xs">
                            TinyFISH: {run.tinyfish_run_id}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>📋 Scenario #{run.scenario_id}</span>
                        <span>🕐 {new Date(run.created_at).toLocaleString()}</span>
                        {run.total_duration_ms && (
                          <span className="font-semibold text-foreground">
                            ⚡ {run.total_duration_ms.toFixed(0)}ms
                          </span>
                        )}
                      </div>

                      {run.error && (
                        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3">
                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                            Error: {run.error}
                          </span>
                        </div>
                      )}

                      {run.response_json && (
                        <details className="text-sm">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                            View Response Data
                          </summary>
                          <div className="mt-2 bg-muted p-3 rounded-md font-mono text-xs overflow-auto max-h-64">
                            {JSON.stringify(run.response_json, null, 2)}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

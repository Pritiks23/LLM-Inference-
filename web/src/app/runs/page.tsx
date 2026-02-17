'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, type Run } from '@/lib/api';
import Link from 'next/link';

export default function RunsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    loadRuns();
  }, [statusFilter]);

  const loadRuns = async () => {
    try {
      const data = await api.getRuns(undefined, statusFilter || undefined);
      setRuns(data);
    } catch (error) {
      console.error('Failed to load runs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading runs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benchmark Runs</h1>
          <p className="text-muted-foreground">
            View and filter benchmark execution history
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'completed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('completed')}
            >
              Completed
            </Button>
            <Button
              variant={statusFilter === 'running' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('running')}
            >
              Running
            </Button>
            <Button
              variant={statusFilter === 'failed' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('failed')}
            >
              Failed
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {runs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No runs found
            </CardContent>
          </Card>
        ) : (
          runs.map((run) => (
            <Card key={run.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-lg">Run #{run.id}</div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        run.status === 'completed' ? 'bg-green-100 text-green-800' :
                        run.status === 'failed' ? 'bg-red-100 text-red-800' :
                        run.status === 'running' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {run.status}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Scenario ID: {run.scenario_id} • Created:{' '}
                      {new Date(run.created_at).toLocaleString()}
                    </div>
                    {run.total_duration_ms && (
                      <div className="mt-1 text-sm">
                        Duration: {run.total_duration_ms.toFixed(0)}ms
                      </div>
                    )}
                    {run.error && (
                      <div className="mt-1 text-sm text-red-600">
                        Error: {run.error}
                      </div>
                    )}
                  </div>
                  <Link href={`/runs/${run.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

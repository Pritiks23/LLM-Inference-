'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, type DashboardKPIs, type Scenario } from '@/lib/api';
import Link from 'next/link';

export default function HomePage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [kpisData, scenariosData] = await Promise.all([
        api.getDashboardKPIs(),
        api.getScenarios(),
      ]);
      setKpis(kpisData);
      setScenarios(scenariosData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickEvaluate = async (scenarioId: number) => {
    setEvaluating(scenarioId);
    try {
      await api.triggerRun(scenarioId);
      // Refresh data after evaluation
      await loadData();
    } catch (error) {
      console.error('Failed to trigger evaluation:', error);
      alert('Failed to start evaluation. Please try again.');
    } finally {
      setEvaluating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-12 border-b border-border">
        <h1 className="text-5xl font-bold text-foreground tracking-tight">
          LLM Evaluation Platform
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Benchmark and compare different Large Language Models using TinyFISH automation.
          Create scenarios, run evaluations, and analyze performance metrics in real-time.
        </p>
        <div className="flex gap-4 justify-center pt-6">
          <Link href="/scenarios">
            <Button size="lg" className="font-semibold">Create Scenario</Button>
          </Link>
          <Link href="/runs">
            <Button size="lg" variant="outline" className="font-semibold">View All Runs</Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-foreground">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wide">Total Evaluations</CardDescription>
              <CardTitle className="text-4xl font-bold">{kpis.total_runs}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Across all scenarios</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-foreground">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wide">Success Rate</CardDescription>
              <CardTitle className="text-4xl font-bold">
                {kpis.success_rate.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Successful completions</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-foreground">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wide">Avg Response Time</CardDescription>
              <CardTitle className="text-4xl font-bold">
                {kpis.total_time_stats.p50
                  ? `${kpis.total_time_stats.p50.toFixed(0)}ms`
                  : 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Median (P50)</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-foreground">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs uppercase font-semibold tracking-wide">P95 Response Time</CardDescription>
              <CardTitle className="text-4xl font-bold">
                {kpis.total_time_stats.p95
                  ? `${kpis.total_time_stats.p95.toFixed(0)}ms`
                  : 'N/A'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">95th percentile</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Evaluate Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quick Evaluate</CardTitle>
          <CardDescription>
            Run a quick evaluation using one of your existing scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          {scenarios.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <p className="text-muted-foreground">No scenarios available yet.</p>
              <Link href="/scenarios">
                <Button>Create Your First Scenario</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scenarios.slice(0, 4).map((scenario) => (
                <Card key={scenario.id} className="hover:border-foreground transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-lg">{scenario.name}</h3>
                        {scenario.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {scenario.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Automation #{scenario.automation_id}</Badge>
                      </div>
                      <Button
                        className="w-full font-semibold"
                        onClick={() => handleQuickEvaluate(scenario.id)}
                        disabled={evaluating === scenario.id}
                      >
                        {evaluating === scenario.id ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Evaluating...
                          </>
                        ) : (
                          'Run Evaluation'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      {kpis && kpis.recent_runs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Recent Activity</CardTitle>
                <CardDescription>Latest evaluation runs</CardDescription>
              </div>
              <Link href="/runs">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {kpis.recent_runs.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:border-foreground transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">Run #{run.id}</span>
                      <Badge 
                        variant={
                          run.status === 'completed' ? 'success' :
                          run.status === 'failed' ? 'destructive' :
                          run.status === 'running' ? 'info' :
                          'secondary'
                        }
                      >
                        {run.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Scenario #{run.scenario_id}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-semibold">
                      {run.total_duration_ms
                        ? `${run.total_duration_ms.toFixed(0)}ms`
                        : 'In Progress'}
                    </div>
                    <Link href={`/runs`}>
                      <Button variant="ghost" size="sm" className="mt-1">
                        View Details →
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* How It Works */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">How It Works</CardTitle>
          <CardDescription>Evaluate LLMs in three simple steps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold">
                1
              </div>
              <h3 className="font-bold text-lg">Create Automation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Configure your LLM automation with TinyFISH API settings and parameters
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold">
                2
              </div>
              <h3 className="font-bold text-lg">Define Scenarios</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Set up test scenarios with prompts and expected behavior for benchmarking
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center text-xl font-bold">
                3
              </div>
              <h3 className="font-bold text-lg">Run & Analyze</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Execute evaluations and analyze performance metrics, response times, and quality
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

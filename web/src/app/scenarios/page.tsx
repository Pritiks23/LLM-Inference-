'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, type Scenario } from '@/lib/api';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarios();
  }, []);

  const loadScenarios = async () => {
    try {
      const data = await api.getScenarios();
      setScenarios(data);
    } catch (error) {
      console.error('Failed to load scenarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRun = async (scenarioId: number) => {
    try {
      await api.triggerRun(scenarioId);
      alert('Run triggered successfully!');
    } catch (error) {
      console.error('Failed to trigger run:', error);
      alert('Failed to trigger run');
    }
  };

  if (loading) {
    return <div>Loading scenarios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scenarios</h1>
          <p className="text-muted-foreground">
            Manage benchmark scenarios
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {scenarios.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No scenarios configured. Use the API to create scenarios.
            </CardContent>
          </Card>
        ) : (
          scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-bold text-lg">{scenario.name}</div>
                    {scenario.description && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {scenario.description}
                      </div>
                    )}
                    <div className="mt-2 text-sm">
                      Automation ID: {scenario.automation_id}
                    </div>
                  </div>
                  <Button onClick={() => handleTriggerRun(scenario.id)}>
                    Trigger Run
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

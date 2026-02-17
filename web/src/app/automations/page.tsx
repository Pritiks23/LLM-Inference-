'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, type Automation } from '@/lib/api';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      const data = await api.getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error('Failed to load automations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading automations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automations</h1>
          <p className="text-muted-foreground">
            TinyFish automation registry
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {automations.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No automations configured. Use the API to create automations.
            </CardContent>
          </Card>
        ) : (
          automations.map((automation) => (
            <Card key={automation.id}>
              <CardContent className="py-4">
                <div className="flex-1">
                  <div className="font-bold text-lg">{automation.name}</div>
                  {automation.description && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      {automation.description}
                    </div>
                  )}
                  <div className="mt-2 text-sm">
                    TinyFish Automation ID: {automation.tinyfish_automation_id}
                  </div>
                  {automation.default_inputs && Object.keys(automation.default_inputs).length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium">Default Inputs:</div>
                      <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(automation.default_inputs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

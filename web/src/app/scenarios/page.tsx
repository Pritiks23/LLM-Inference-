'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type Scenario, type Automation, type CreateScenarioRequest } from '@/lib/api';

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateScenarioRequest>({
    name: '',
    automation_id: 0,
    description: '',
    inputs_template: {},
    run_settings: {},
  });
  const [promptText, setPromptText] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scenariosData, automationsData] = await Promise.all([
        api.getScenarios(),
        api.getAutomations(),
      ]);
      setScenarios(scenariosData);
      setAutomations(automationsData);
      if (automationsData.length > 0) {
        setFormData(prev => ({ ...prev, automation_id: automationsData[0].id }));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerRun = async (scenarioId: number) => {
    try {
      await api.triggerRun(scenarioId);
      alert('Evaluation started! Check the Runs page for results.');
    } catch (error) {
      console.error('Failed to trigger run:', error);
      alert('Failed to start evaluation. Please try again.');
    }
  };

  const handleCreateScenario = async () => {
    if (!formData.name || !formData.automation_id) {
      alert('Please fill in required fields (Name and Automation)');
      return;
    }

    setCreating(true);
    try {
      const inputs_template = promptText ? { prompt: promptText } : {};
      await api.createScenario({
        ...formData,
        inputs_template,
      });
      setDialogOpen(false);
      setFormData({
        name: '',
        automation_id: automations[0]?.id || 0,
        description: '',
        inputs_template: {},
        run_settings: {},
      });
      setPromptText('');
      await loadData();
    } catch (error) {
      console.error('Failed to create scenario:', error);
      alert('Failed to create scenario. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Evaluation Scenarios</h1>
          <p className="text-muted-foreground">
            Create and manage test scenarios for LLM evaluation
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">+ Create Scenario</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Scenario</DialogTitle>
              <DialogDescription>
                Define a test scenario for evaluating LLM performance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Scenario Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chat Completion Test"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="automation">Automation *</Label>
                <select
                  id="automation"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.automation_id}
                  onChange={(e) => setFormData({ ...formData, automation_id: parseInt(e.target.value) })}
                >
                  {automations.map((auto) => (
                    <option key={auto.id} value={auto.id}>
                      {auto.name} (ID: {auto.id})
                    </option>
                  ))}
                </select>
                {automations.length === 0 && (
                  <p className="text-sm text-red-500">No automations available. Create one first from the Automations page.</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this scenario test?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Test Prompt</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter the prompt to send to the LLM"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be sent to the LLM via TinyFISH automation
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateScenario} disabled={creating}>
                {creating ? 'Creating...' : 'Create Scenario'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scenarios.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">No scenarios configured yet.</p>
                <p className="text-sm text-muted-foreground">
                  Create your first scenario to start evaluating LLMs
                </p>
                <Button onClick={() => setDialogOpen(true)} size="lg">
                  Create Your First Scenario
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          scenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{scenario.name}</CardTitle>
                    {scenario.description && (
                      <CardDescription className="mt-2">
                        {scenario.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">ID: {scenario.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Automation:</span>
                    <Badge variant="secondary">
                      {automations.find(a => a.id === scenario.automation_id)?.name || `#${scenario.automation_id}`}
                    </Badge>
                  </div>
                  
                  {scenario.inputs_template && Object.keys(scenario.inputs_template).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Input Configuration:</span>
                      <div className="bg-muted p-3 rounded-md text-sm font-mono overflow-auto max-h-32">
                        {JSON.stringify(scenario.inputs_template, null, 2)}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => handleTriggerRun(scenario.id)} className="flex-1">
                      🚀 Run Evaluation
                    </Button>
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

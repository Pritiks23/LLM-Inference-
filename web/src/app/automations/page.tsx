'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, type Automation, type CreateAutomationRequest } from '@/lib/api';

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CreateAutomationRequest>({
    name: '',
    tinyfish_automation_id: '',
    description: '',
    default_inputs: {},
  });
  const [creating, setCreating] = useState(false);

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

  const handleCreateAutomation = async () => {
    if (!formData.name || !formData.tinyfish_automation_id) {
      alert('Please fill in required fields (Name and TinyFISH Automation ID)');
      return;
    }

    setCreating(true);
    try {
      await api.createAutomation(formData);
      setDialogOpen(false);
      setFormData({
        name: '',
        tinyfish_automation_id: '',
        description: '',
        default_inputs: {},
      });
      await loadAutomations();
    } catch (error) {
      console.error('Failed to create automation:', error);
      alert('Failed to create automation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading automations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TinyFISH Automations</h1>
          <p className="text-muted-foreground">
            Configure and manage LLM automations powered by TinyFISH API
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">+ Create Automation</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
              <DialogDescription>
                Connect a TinyFISH automation to this platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Automation Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., GPT-4 Chat Automation"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tinyfishId">TinyFISH Automation ID *</Label>
                <Input
                  id="tinyfishId"
                  placeholder="e.g., auto_abc123xyz"
                  value={formData.tinyfish_automation_id}
                  onChange={(e) => setFormData({ ...formData, tinyfish_automation_id: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The automation ID from your TinyFISH account
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this automation does"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">💡 How to get TinyFISH Automation ID</h4>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Log in to your TinyFISH account</li>
                  <li>Create or select an automation</li>
                  <li>Copy the automation ID from the URL or settings</li>
                  <li>Paste it here to connect it to this platform</li>
                </ol>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAutomation} disabled={creating}>
                {creating ? 'Creating...' : 'Create Automation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {automations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">No automations configured yet.</p>
                <p className="text-sm text-muted-foreground">
                  Create your first automation to connect with TinyFISH API
                </p>
                <Button onClick={() => setDialogOpen(true)} size="lg">
                  Create Your First Automation
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          automations.map((automation) => (
            <Card key={automation.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{automation.name}</CardTitle>
                    {automation.description && (
                      <CardDescription className="mt-2">
                        {automation.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant="outline">ID: {automation.id}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono">
                      🔗 {automation.tinyfish_automation_id}
                    </Badge>
                  </div>
                  
                  {automation.default_inputs && Object.keys(automation.default_inputs).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-sm font-medium">Default Configuration:</span>
                      <div className="bg-muted p-3 rounded-md text-sm font-mono overflow-auto max-h-32">
                        {JSON.stringify(automation.default_inputs, null, 2)}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground">
                    Created: {new Date(automation.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {automations.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardHeader>
            <CardTitle>Using TinyFISH API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              ✅ Your automations are connected to TinyFISH API
            </p>
            <p className="text-sm text-muted-foreground">
              When you run evaluations, this platform will call the TinyFISH automation endpoint
              with your configured automation IDs to execute LLM tasks and collect performance metrics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

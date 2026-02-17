// TypeScript types for API entities
export interface Automation {
  id: number;
  name: string;
  tinyfish_automation_id: string;
  description?: string;
  default_inputs?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface Scenario {
  id: number;
  name: string;
  automation_id: number;
  description?: string;
  inputs_template?: Record<string, any>;
  run_settings?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}

export interface Run {
  id: number;
  scenario_id: number;
  started_at?: string;
  finished_at?: string;
  status: string;
  total_duration_ms?: number;
  ttft_ms?: number;
  inter_token_stats?: Record<string, any>;
  error?: string;
  tinyfish_run_id?: string;
  response_json?: Record<string, any>;
  created_at: string;
}

export interface PercentileStats {
  p50?: number;
  p95?: number;
  p99?: number;
}

export interface DashboardKPIs {
  total_runs: number;
  success_rate: number;
  total_time_stats: PercentileStats;
  ttft_stats?: PercentileStats;
  avg_inter_token_latency?: number;
  recent_runs: Run[];
}

export interface TriggerRunRequest {
  scenario_id: number;
  inputs_override?: Record<string, any>;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_V1_PREFIX = '/api/v1';

// Helper function for making API requests
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${API_V1_PREFIX}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
}

// API Client
export const api = {
  // Automations
  async getAutomations(): Promise<Automation[]> {
    return fetchAPI<Automation[]>('/automations');
  },

  async getAutomation(id: number): Promise<Automation> {
    return fetchAPI<Automation>(`/automations/${id}`);
  },

  // Scenarios
  async getScenarios(automationId?: number): Promise<Scenario[]> {
    const params = automationId ? `?automation_id=${automationId}` : '';
    return fetchAPI<Scenario[]>(`/scenarios${params}`);
  },

  async getScenario(id: number): Promise<Scenario> {
    return fetchAPI<Scenario>(`/scenarios/${id}`);
  },

  // Runs
  async getRuns(scenarioId?: number, status?: string): Promise<Run[]> {
    const params = new URLSearchParams();
    if (scenarioId) params.append('scenario_id', scenarioId.toString());
    if (status) params.append('status', status);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchAPI<Run[]>(`/runs${queryString}`);
  },

  async getRun(id: number): Promise<Run> {
    return fetchAPI<Run>(`/runs/${id}`);
  },

  async triggerRun(scenarioId: number, inputsOverride?: Record<string, any>): Promise<Run> {
    return fetchAPI<Run>('/runs/trigger', {
      method: 'POST',
      body: JSON.stringify({
        scenario_id: scenarioId,
        inputs_override: inputsOverride,
      }),
    });
  },

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<DashboardKPIs> {
    return fetchAPI<DashboardKPIs>('/runs/kpis/dashboard');
  },
};

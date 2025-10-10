export interface Monitor {
  id: string;
  name: string;
  url: string;
  interval: number; // in seconds
  enabled: boolean;
  alertEmail?: string; // email for alerts
  createdAt: number;
}

export interface MonitorCheck {
  id: string;
  monitorId: string;
  timestamp: number;
  status: 'success' | 'warning' | 'error';
  latency: number; // in ms
  statusCode?: number;
  errorMessage?: string;
  dnsTime?: number;
  connectTime?: number;
  sslValid?: boolean;
}

export interface MonitorStats {
  monitorId: string;
  uptime: number; // percentage
  avgLatency: number;
  lastCheck?: MonitorCheck;
  checks: MonitorCheck[];
}

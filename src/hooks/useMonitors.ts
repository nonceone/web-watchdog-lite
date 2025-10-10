import { useState, useEffect, useCallback } from 'react';
import { Monitor, MonitorCheck, MonitorStats } from '@/types/monitor';
import { checkWebsite, calculateUptime, calculateAvgLatency } from '@/lib/monitor';

const STORAGE_KEY_MONITORS = 'website-monitors';
const STORAGE_KEY_CHECKS = 'website-checks';
const MAX_CHECKS_PER_MONITOR = 50;

export function useMonitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [checks, setChecks] = useState<MonitorCheck[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    const savedMonitors = localStorage.getItem(STORAGE_KEY_MONITORS);
    const savedChecks = localStorage.getItem(STORAGE_KEY_CHECKS);
    
    if (savedMonitors) {
      setMonitors(JSON.parse(savedMonitors));
    }
    if (savedChecks) {
      setChecks(JSON.parse(savedChecks));
    }
    setLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_MONITORS, JSON.stringify(monitors));
    }
  }, [monitors, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY_CHECKS, JSON.stringify(checks));
    }
  }, [checks, loading]);

  // Add monitor
  const addMonitor = useCallback((monitor: Omit<Monitor, 'id' | 'createdAt'>) => {
    const newMonitor: Monitor = {
      ...monitor,
      id: `monitor-${Date.now()}`,
      createdAt: Date.now(),
    };
    setMonitors((prev) => [...prev, newMonitor]);
    return newMonitor;
  }, []);

  // Remove monitor
  const removeMonitor = useCallback((id: string) => {
    setMonitors((prev) => prev.filter((m) => m.id !== id));
    setChecks((prev) => prev.filter((c) => c.monitorId !== id));
  }, []);

  // Update monitor
  const updateMonitor = useCallback((id: string, updates: Partial<Monitor>) => {
    setMonitors((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  // Run check
  const runCheck = useCallback(async (monitor: Monitor) => {
    const check = await checkWebsite(monitor);
    setChecks((prev) => {
      const filtered = prev.filter((c) => c.monitorId !== monitor.id);
      const updated = [check, ...filtered].slice(0, MAX_CHECKS_PER_MONITOR);
      return updated;
    });
    return check;
  }, []);

  // Get stats for a monitor
  const getMonitorStats = useCallback(
    (monitorId: string): MonitorStats => {
      const monitorChecks = checks
        .filter((c) => c.monitorId === monitorId)
        .sort((a, b) => b.timestamp - a.timestamp);

      return {
        monitorId,
        uptime: calculateUptime(monitorChecks),
        avgLatency: calculateAvgLatency(monitorChecks),
        lastCheck: monitorChecks[0],
        checks: monitorChecks,
      };
    },
    [checks]
  );

  // Auto-check monitors
  useEffect(() => {
    const intervals: Record<string, NodeJS.Timeout> = {};

    monitors.forEach((monitor) => {
      if (monitor.enabled) {
        // Initial check
        runCheck(monitor);

        // Set up interval
        intervals[monitor.id] = setInterval(() => {
          runCheck(monitor);
        }, monitor.interval * 1000);
      }
    });

    return () => {
      Object.values(intervals).forEach(clearInterval);
    };
  }, [monitors, runCheck]);

  return {
    monitors,
    checks,
    loading,
    addMonitor,
    removeMonitor,
    updateMonitor,
    runCheck,
    getMonitorStats,
  };
}

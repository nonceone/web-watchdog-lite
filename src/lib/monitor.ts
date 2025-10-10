import { Monitor, MonitorCheck } from "@/types/monitor";

export async function checkWebsite(monitor: Monitor): Promise<MonitorCheck> {
  const startTime = performance.now();
  const checkId = `${monitor.id}-${Date.now()}`;

  try {
    // Use a CORS proxy or fetch with no-cors mode
    // Note: no-cors mode has limitations, we'll use Image loading as fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(monitor.url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeoutId);
      
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);

      return {
        id: checkId,
        monitorId: monitor.id,
        timestamp: Date.now(),
        status: response.ok ? 'success' : 'warning',
        latency,
        statusCode: response.status,
        sslValid: monitor.url.startsWith('https'),
      };
    } catch (fetchError) {
      // Fallback to image loading trick for CORS-restricted sites
      clearTimeout(timeoutId);
      return await checkWithImage(monitor, checkId, startTime);
    }
  } catch (error) {
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);

    return {
      id: checkId,
      monitorId: monitor.id,
      timestamp: Date.now(),
      status: 'error',
      latency,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkWithImage(
  monitor: Monitor,
  checkId: string,
  startTime: number
): Promise<MonitorCheck> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      resolve({
        id: checkId,
        monitorId: monitor.id,
        timestamp: Date.now(),
        status: 'error',
        latency: 10000,
        errorMessage: 'Timeout',
      });
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      resolve({
        id: checkId,
        monitorId: monitor.id,
        timestamp: Date.now(),
        status: 'success',
        latency,
        sslValid: monitor.url.startsWith('https'),
      });
    };

    img.onerror = () => {
      clearTimeout(timeout);
      // Site exists but blocks image loading - consider it reachable
      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      resolve({
        id: checkId,
        monitorId: monitor.id,
        timestamp: Date.now(),
        status: 'warning',
        latency,
        errorMessage: 'CORS restricted',
      });
    };

    // Try to load favicon or a random pixel
    img.src = `${monitor.url}/favicon.ico?t=${Date.now()}`;
  });
}

export function calculateUptime(checks: MonitorCheck[]): number {
  if (checks.length === 0) return 0;
  const successCount = checks.filter((c) => c.status === 'success').length;
  return Math.round((successCount / checks.length) * 100);
}

export function calculateAvgLatency(checks: MonitorCheck[]): number {
  if (checks.length === 0) return 0;
  const validChecks = checks.filter((c) => c.latency < 10000);
  if (validChecks.length === 0) return 0;
  const sum = validChecks.reduce((acc, c) => acc + c.latency, 0);
  return Math.round(sum / validChecks.length);
}

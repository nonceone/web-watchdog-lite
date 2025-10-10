import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorStats } from "@/types/monitor";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Monitor } from "@/types/monitor";

interface LatencyChartProps {
  stats: MonitorStats;
  monitor: Monitor;
}

export function LatencyChart({ stats, monitor }: LatencyChartProps) {
  // Get the most recent 50 checks
  const chartData = stats.checks
    .slice(0, 50)
    .reverse()
    .map((check) => ({
      timestamp: check.timestamp,
      latency: check.latency < 10000 ? check.latency : null,
      status: check.status,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{monitor.name} - 延迟趋势</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => format(new Date(timestamp), 'HH:mm', { locale: zhCN })}
                className="text-xs"
              />
              <YAxis
                label={{ value: '延迟 (ms)', angle: -90, position: 'insideLeft' }}
                className="text-xs"
              />
              <Tooltip
                labelFormatter={(timestamp) =>
                  format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })
                }
                formatter={(value: number) => [`${value}ms`, '延迟']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            暂无数据
          </div>
        )}
      </CardContent>
    </Card>
  );
}

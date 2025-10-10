import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonitorStats } from "@/types/monitor";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface LatencyChartProps {
  stats: MonitorStats[];
}

export function LatencyChart({ stats }: LatencyChartProps) {
  // Get the most recent 20 checks from each monitor
  const chartData = stats.flatMap((stat) =>
    stat.checks.slice(0, 20).reverse().map((check) => ({
      timestamp: check.timestamp,
      [stat.monitorId]: check.latency < 10000 ? check.latency : null,
      name: stats.find((s) => s.monitorId === stat.monitorId)?.monitorId || '',
    }))
  );

  // Merge data points by timestamp
  const mergedData = chartData.reduce((acc, curr) => {
    const existing = acc.find((item) => item.timestamp === curr.timestamp);
    if (existing) {
      Object.assign(existing, curr);
    } else {
      acc.push(curr);
    }
    return acc;
  }, [] as any[]);

  // Sort by timestamp
  mergedData.sort((a, b) => a.timestamp - b.timestamp);

  const colors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>延迟趋势</CardTitle>
      </CardHeader>
      <CardContent>
        {mergedData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mergedData}>
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
              <Legend />
              {stats.map((stat, index) => (
                <Line
                  key={stat.monitorId}
                  type="monotone"
                  dataKey={stat.monitorId}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MonitorStats, Monitor } from "@/types/monitor";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface StatusTableProps {
  monitors: Monitor[];
  stats: MonitorStats[];
}

export function StatusTable({ monitors, stats }: StatusTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>监控详情</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>延迟</TableHead>
              <TableHead>平均延迟</TableHead>
              <TableHead>可用性</TableHead>
              <TableHead>最后检测</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {monitors.map((monitor) => {
              const stat = stats.find((s) => s.monitorId === monitor.id);
              const lastCheck = stat?.lastCheck;

              return (
                <TableRow key={monitor.id}>
                  <TableCell className="font-medium">{monitor.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                    {monitor.url}
                  </TableCell>
                  <TableCell>
                    {lastCheck ? (
                      <Badge
                        variant={
                          lastCheck.status === 'success'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {lastCheck.status === 'success' && '正常'}
                        {lastCheck.status === 'warning' && '警告'}
                        {lastCheck.status === 'error' && '异常'}
                      </Badge>
                    ) : (
                      <Badge variant="outline">等待中</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {lastCheck ? `${lastCheck.latency}ms` : '-'}
                  </TableCell>
                  <TableCell>
                    {stat ? `${stat.avgLatency}ms` : '-'}
                  </TableCell>
                  <TableCell>
                    {stat ? `${stat.uptime}%` : '-'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {lastCheck
                      ? format(new Date(lastCheck.timestamp), 'MM-dd HH:mm:ss', {
                          locale: zhCN,
                        })
                      : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
            {monitors.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  暂无监控任务，点击"添加监控"开始
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

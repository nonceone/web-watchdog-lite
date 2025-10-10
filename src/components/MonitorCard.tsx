import { Activity, Globe, Trash2, Power, PowerOff, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor } from "@/types/monitor";
import { MonitorStats } from "@/types/monitor";
import { cn } from "@/lib/utils";
import { AddMonitorDialog } from "./AddMonitorDialog";

interface MonitorCardProps {
  monitor: Monitor;
  stats: MonitorStats;
  onToggle: (id: string, enabled: boolean) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Monitor>) => void;
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export function MonitorCard({ monitor, stats, onToggle, onRemove, onUpdate, onSelect, isSelected }: MonitorCardProps) {
  const statusColor = {
    success: "text-green-600 dark:text-green-400",
    warning: "text-orange-600 dark:text-orange-400",
    error: "text-red-600 dark:text-red-400",
  };

  const statusBg = {
    success: "bg-green-100 dark:bg-green-950",
    warning: "bg-orange-100 dark:bg-orange-950",
    error: "bg-red-100 dark:bg-red-950",
  };

  const status = stats.lastCheck?.status || 'error';

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-md cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={() => onSelect(monitor.id)}
    >
      <div
        className={cn(
          "absolute top-0 left-0 w-1 h-full transition-all",
          status === 'success' && "bg-green-500",
          status === 'warning' && "bg-orange-500",
          status === 'error' && "bg-red-500"
        )}
      />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-lg", statusBg[status])}>
              <Globe className={cn("h-4 w-4", statusColor[status])} />
            </div>
            <div>
              <CardTitle className="text-base">{monitor.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 break-all">
                {monitor.url}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onToggle(monitor.id, !monitor.enabled)}
            >
              {monitor.enabled ? (
                <Power className="h-4 w-4 text-green-600" />
              ) : (
                <PowerOff className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
            <AddMonitorDialog
              monitor={monitor}
              onUpdate={onUpdate}
              trigger={
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onRemove(monitor.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">状态</div>
            <Badge
              variant={status === 'success' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {status === 'success' && '正常'}
              {status === 'warning' && '警告'}
              {status === 'error' && '异常'}
            </Badge>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">延迟</div>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-primary" />
              <span className="text-sm font-medium">
                {stats.lastCheck ? `${stats.lastCheck.latency}ms` : '-'}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">可用性</div>
            <div className="text-sm font-medium">{stats.uptime}%</div>
          </div>
        </div>
        {stats.lastCheck?.sslValid !== undefined && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">SSL 证书</span>
              <Badge variant={stats.lastCheck.sslValid ? 'default' : 'destructive'} className="text-xs">
                {stats.lastCheck.sslValid ? '有效' : '无效'}
              </Badge>
            </div>
          </div>
        )}
        {monitor.alertEmail && (
          <div className="mt-2 pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">告警邮箱</span>
              <span className="text-xs font-mono">{monitor.alertEmail}</span>
            </div>
          </div>
        )}
      </CardContent>
      {monitor.enabled && (
        <div className="absolute top-2 right-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
        </div>
      )}
    </Card>
  );
}

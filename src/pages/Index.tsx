import { Activity } from "lucide-react";
import { AddMonitorDialog } from "@/components/AddMonitorDialog";
import { MonitorCard } from "@/components/MonitorCard";
import { LatencyChart } from "@/components/LatencyChart";
import { StatusTable } from "@/components/StatusTable";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMonitors } from "@/hooks/useMonitors";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { monitors, addMonitor, removeMonitor, updateMonitor, getMonitorStats } = useMonitors();

  const handleToggle = (id: string, enabled: boolean) => {
    updateMonitor(id, { enabled });
    toast({
      title: enabled ? "已启用监控" : "已暂停监控",
      description: monitors.find((m) => m.id === id)?.name,
    });
  };

  const handleRemove = (id: string) => {
    const monitor = monitors.find((m) => m.id === id);
    if (confirm(`确定要删除监控任务"${monitor?.name}"吗？`)) {
      removeMonitor(id);
      toast({
        title: "已删除",
        description: `监控任务"${monitor?.name}"已被删除`,
      });
    }
  };

  const stats = monitors.map((monitor) => getMonitorStats(monitor.id));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">网站监控中心</h1>
                <p className="text-sm text-muted-foreground">实时监测网站可用性与性能</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AddMonitorDialog onAdd={addMonitor} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Monitor Cards Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">监控任务</h2>
          {monitors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {monitors.map((monitor) => (
                <MonitorCard
                  key={monitor.id}
                  monitor={monitor}
                  stats={getMonitorStats(monitor.id)}
                  onToggle={handleToggle}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg border-2 border-dashed">
              <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">还没有监控任务</p>
              <AddMonitorDialog onAdd={addMonitor} />
            </div>
          )}
        </div>

        {/* Chart */}
        {monitors.length > 0 && (
          <div className="mb-8">
            <LatencyChart stats={stats} />
          </div>
        )}

        {/* Status Table */}
        {monitors.length > 0 && (
          <div>
            <StatusTable monitors={monitors} stats={stats} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>网站监控工具 - 实时监测您的网站健康状态</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
